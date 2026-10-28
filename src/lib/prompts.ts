import { Prompt, PromptData, CategoryData } from '@/types';
import { 
  getAllPrompts as getPrompts, 
  getPromptBySlug,
  getPromptContentHtml,
  getFeaturedPrompts as getFeatured,
  getRecentPrompts as getRecent
} from './promptUtils';

// Convert a Prompt into a PromptData (kept for backwards compatibility)
function convertToPromptData(prompt: Prompt): PromptData {
  return {
    slug: prompt.slug,
    title: prompt.title,
    description: prompt.description,
    category: prompt.category,
    content: prompt.content,
    rating: prompt.rating,
    createdAt: prompt.createdAt,
    featured: prompt.featured,
    isNew: prompt.isNew
  };
}

/**
 * Get every prompt
 * @returns the data for every prompt
 */
export function getAllPrompts(): PromptData[] {
  return getPrompts().map(convertToPromptData);
}

/**
 * Get a prompt's details
 * @param slug the prompt's slug
 * @returns the prompt's details
 */
export async function getPromptData(slug: string): Promise<PromptData | null> {
  const prompt = getPromptBySlug(slug);
  if (!prompt) return null;
  
  // Get the HTML content
  const contentHtml = await getPromptContentHtml(slug);
  
  return {
    ...convertToPromptData(prompt),
    content: contentHtml
  };
}

/**
 * Get the featured prompts
 * @returns the list of featured prompts
 */
export function getFeaturedPrompts(): PromptData[] {
  return getFeatured().map(convertToPromptData);
}

/**
 * Get the most recent prompts
 * @returns the list of recent prompts
 */
export function getRecentPrompts(): PromptData[] {
  return getRecent().map(convertToPromptData);
}

// Re-export the category functions
export { getAllCategories } from './categoryUtils';