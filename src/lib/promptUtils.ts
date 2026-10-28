import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { Prompt, PromptFrontmatter, PromptMetadata } from '@/types';
import { 
  PROMPTS_DIRECTORY, 
  ensureDirectoryExists,
  safeReadFile,
  safeWriteFile,
  safeDeleteFile,
  safeParseJson,
  generateUniqueSlug
} from './utils';

// Make sure the prompts directory exists
ensureDirectoryExists(PROMPTS_DIRECTORY);

/**
 * Get the slugs of all prompts
 * @returns the slugs of all prompts
 */
export function getPromptSlugs(): string[] {
  try {
    // Read every file in the directory
    const files = fs.readdirSync(PROMPTS_DIRECTORY);
    
    // Keep only .md files and strip the extension
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace(/\.md$/, ''));
  } catch (error) {
    console.error('Error listing prompt files:', error);
    return [];
  }
}

/**
 * Get the data for every prompt
 * @returns the data for every prompt
 */
export function getAllPrompts(): Prompt[] {
  const slugs = getPromptSlugs();
  const prompts = slugs.map(slug => getPromptBySlug(slug))
    .filter((prompt): prompt is Prompt => prompt !== null);
  
  // Sort by creation date, newest first
  return prompts.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
}

/**
 * Get a prompt's data by slug
 * @param slug the prompt's slug
 * @returns the prompt data, or null
 */
export function getPromptBySlug(slug: string): Prompt | null {
  try {
    // Clean up the slug, removing any extension
    const cleanSlug = slug.replace(/\.md$/, '');
    
    // Check whether the .md file exists
    const mdPath = path.join(PROMPTS_DIRECTORY, `${cleanSlug}.md`);
    if (!fs.existsSync(mdPath)) {
      return null;
    }
    
    // Read the .md file
    const fileContent = safeReadFile(mdPath);
    const { data, content } = matter(fileContent);
    
    // Read the metadata file
    const metadataPath = path.join(PROMPTS_DIRECTORY, `${cleanSlug}.json`);
    const metadataContent = safeReadFile(metadataPath);
    const metadata = safeParseJson<Partial<PromptMetadata>>(metadataContent, {});
    
    // Build the complete prompt object
    return {
      slug: cleanSlug,
      title: data.title || '',
      description: data.description || '',
      category: data.category || '',
      author: data.author || '',
      tags: data.tags || [],
      content,
      createdAt: data.createdAt || metadata.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || metadata.updatedAt || data.createdAt || metadata.createdAt || new Date().toISOString(),
      featured: metadata.featured || false,
      rating: metadata.rating || 0
    };
  } catch (error) {
    console.error(`Error loading prompt ${slug}:`, error);
    return null;
  }
}

/**
 * Get a prompt's content rendered as HTML
 * @param slug the prompt's slug
 * @returns the prompt's HTML content
 */
export async function getPromptContentHtml(slug: string): Promise<string> {
  const prompt = getPromptBySlug(slug);
  if (!prompt) return '';
  
  // Render the Markdown content as HTML
  const processedContent = await remark()
    .use(html)
    .process(prompt.content);
    
  return processedContent.toString();
}

/**
 * Create a new prompt
 * @param promptData the prompt data (without the slug)
 * @param customSlug a custom slug (optional)
 * @returns the created prompt data, or null
 */
export function createPrompt(
  promptData: Omit<Prompt, 'slug'>, 
  customSlug?: string
): Prompt | null {
  try {
    // Generate a slug, or use the custom one
    const slug = customSlug || generateUniqueSlug(promptData.title);
    
    // Build the front matter data
    const frontmatter: PromptFrontmatter = {
      title: promptData.title,
      description: promptData.description,
      category: promptData.category,
      author: promptData.author,
      tags: promptData.tags,
    };
    
    // Build the markdown file content as a string
    const content = promptData.content || '';
    const yamlFrontmatter = Object.entries(frontmatter)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
        }
        return `${key}: "${value}"`;
      })
      .join('\n');

    const markdownContent = `---\n${yamlFrontmatter}\n---\n\n${content}`;
    
    // Save the .md file
    const mdPath = path.join(PROMPTS_DIRECTORY, `${slug}.md`);
    if (!safeWriteFile(mdPath, markdownContent)) {
      return null;
    }
    
    // Prepare the metadata
    const metadata: PromptMetadata = {
      featured: promptData.featured,
      createdAt: promptData.createdAt,
      updatedAt: promptData.updatedAt,
      rating: promptData.rating
    };
    
    // Save the metadata file
    const metadataPath = path.join(PROMPTS_DIRECTORY, `${slug}.json`);
    if (!safeWriteFile(metadataPath, JSON.stringify(metadata, null, 2))) {
      // If saving the metadata failed, delete the md file we just created
      safeDeleteFile(mdPath);
      return null;
    }
    
    // Return the complete prompt data
    return {
      ...promptData,
      slug,
    };
  } catch (error) {
    console.error('Error creating prompt:', error);
    return null;
  }
}

/**
 * Update a prompt
 * @param slug the prompt's slug
 * @param promptData the updated data
 * @returns whether the update succeeded
 */
export function updatePrompt(slug: string, promptData: Partial<Prompt>): boolean {
  try {
    // Get the existing prompt
    const existingPrompt = getPromptBySlug(slug);
    if (!existingPrompt) {
      return false;
    }
    
    // Merge the data
    const updatedPrompt = {
      ...existingPrompt,
      ...promptData,
      slug, // keep the slug unchanged
      updatedAt: new Date().toISOString(), // bump the modified time
    };
    
    // Build the front matter
    const frontmatter: PromptFrontmatter = {
      title: updatedPrompt.title,
      description: updatedPrompt.description,
      category: updatedPrompt.category,
      author: updatedPrompt.author,
      tags: updatedPrompt.tags,
    };
    
    // Build the markdown content
    const content = updatedPrompt.content || '';
    const yamlFrontmatter = Object.entries(frontmatter)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
        }
        return `${key}: "${value}"`;
      })
      .join('\n');

    const markdownContent = `---\n${yamlFrontmatter}\n---\n\n${content}`;
    
    // Update the .md file
    const mdPath = path.join(PROMPTS_DIRECTORY, `${slug}.md`);
    if (!safeWriteFile(mdPath, markdownContent)) {
      return false;
    }
    
    // Update the metadata
    const metadata: PromptMetadata = {
      featured: updatedPrompt.featured,
      createdAt: updatedPrompt.createdAt,
      updatedAt: updatedPrompt.updatedAt,
      rating: updatedPrompt.rating
    };
    
    // Save the metadata file
    const metadataPath = path.join(PROMPTS_DIRECTORY, `${slug}.json`);
    return safeWriteFile(metadataPath, JSON.stringify(metadata, null, 2));
  } catch (error) {
    console.error(`Error updating prompt ${slug}:`, error);
    return false;
  }
}

/**
 * Delete a prompt
 * @param slug the prompt's slug
 * @returns whether the delete succeeded
 */
export function deletePrompt(slug: string): boolean {
  try {
    const mdPath = path.join(PROMPTS_DIRECTORY, `${slug}.md`);
    const jsonPath = path.join(PROMPTS_DIRECTORY, `${slug}.json`);
    
    // Delete both files
    const mdDeleted = safeDeleteFile(mdPath);
    const jsonDeleted = safeDeleteFile(jsonPath);
    
    // Count the delete as successful if either file was removed
    return mdDeleted || jsonDeleted;
  } catch (error) {
    console.error(`Error deleting prompt ${slug}:`, error);
    return false;
  }
}

/**
 * Get the featured prompts
 * @param limit how many to return
 * @returns the list of featured prompts
 */
export function getFeaturedPrompts(limit: number = 3): Prompt[] {
  const allPrompts = getAllPrompts();
  // Return only prompts with featured=true, sorted by rating descending
  return allPrompts
    .filter(prompt => prompt.featured)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, limit);
}

/**
 * Get the most recent prompts
 * @param limit how many to return
 * @returns the list of recent prompts
 */
export function getRecentPrompts(limit: number = 9): Prompt[] {
  const allPrompts = getAllPrompts();
  // Make sure they are sorted by creation date descending (newest first)
  return allPrompts
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

/**
 * Get the prompts in a category
 * @param category the category name
 * @returns the list of prompts in that category
 */
export function getPromptsByCategory(category: string): Prompt[] {
  const allPrompts = getAllPrompts();
  return allPrompts.filter(prompt => prompt.category === category);
} 