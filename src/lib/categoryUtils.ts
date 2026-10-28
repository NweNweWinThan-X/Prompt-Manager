import fs from 'fs';
import path from 'path';
import { CategoryData } from '@/types';
import { safeReadFile, safeWriteFile, safeParseJson } from './utils';
import { getAllPrompts } from './promptUtils';
import { CATEGORIES, resolveCategorySlug } from '@/config/categories';

// Path to the category config file
const CATEGORIES_FILE_PATH = path.join(process.cwd(), 'src', 'config', 'categories.json');

/**
 * Get the data for every category
 * @returns the data for every category
 */
export function getAllCategories(): CategoryData[] {
  // First try reading from the config file
  try {
    if (fs.existsSync(CATEGORIES_FILE_PATH)) {
      const fileContent = safeReadFile(CATEGORIES_FILE_PATH);
      const categories = safeParseJson<CategoryData[]>(fileContent, []);
      if (categories.length > 0) {
        return updateCategoryCounts(categories);
      }
    }
  } catch (error) {
    console.error('读取分类配置文件失败:', error);
  }
  
  // Fall back to the default categories if the config file is missing or unreadable
  return updateCategoryCounts([...CATEGORIES]);
}

/**
 * Update the category counts
 * @param categories the category data
 * @returns the updated category data
 */
function updateCategoryCounts(categories: CategoryData[]): CategoryData[] {
  const prompts = getAllPrompts();
  
  // Count the prompts in each category
  const categoryCounts: Record<string, number> = {};
  
  // Count by category name
  prompts.forEach(prompt => {
    if (prompt.category) {
      categoryCounts[prompt.category] = (categoryCounts[prompt.category] || 0) + 1;
    }
  });
  
  // Count by slug (a category name, slug or alias all match)
  const slugCounts: Record<string, number> = {};
  prompts.forEach(prompt => {
    if (prompt.category) {
      const slug = resolveCategorySlug(prompt.category);
      slugCounts[slug] = (slugCounts[slug] || 0) + 1;
    }
  });
  
  // Update the category counts
  return categories.map(category => {
    const count = slugCounts[category.slug] || categoryCounts[category.name] || 0;
    return { ...category, count };
  });
}

/**
 * Save the category config
 * @param categories the category data
 * @returns whether the save succeeded
 */
export function saveCategories(categories: CategoryData[]): boolean {
  try {
    // Make sure the directory exists
    const dir = path.dirname(CATEGORIES_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Save the category data
    return safeWriteFile(CATEGORIES_FILE_PATH, JSON.stringify(categories, null, 2));
  } catch (error) {
    console.error('保存分类配置失败:', error);
    return false;
  }
}

/**
 * Add a new category
 * @param category the category data
 * @returns whether it was added
 */
export function addCategory(category: Omit<CategoryData, 'count'>): boolean {
  try {
    const categories = getAllCategories();
    
    // Check whether a category with the same slug already exists
    if (categories.some(c => c.slug === category.slug)) {
      console.error(`分类 ${category.slug} 已存在`);
      return false;
    }
    
    // Add the new category
    categories.push({ ...category, count: 0 });
    
    // Save the updated categories
    return saveCategories(categories);
  } catch (error) {
    console.error('添加分类失败:', error);
    return false;
  }
}

/**
 * Update a category
 * @param slug the category slug
 * @param categoryData the updated category data
 * @returns whether the update succeeded
 */
export function updateCategory(
  slug: string, 
  categoryData: Partial<Omit<CategoryData, 'count'>>
): boolean {
  try {
    const categories = getAllCategories();
    
    // Find the category's index
    const index = categories.findIndex(c => c.slug === slug);
    if (index === -1) {
      console.error(`找不到分类 ${slug}`);
      return false;
    }
    
    // Update the category
    categories[index] = { 
      ...categories[index], 
      ...categoryData 
    };
    
    // Save the updated categories
    return saveCategories(categories);
  } catch (error) {
    console.error(`更新分类 ${slug} 失败:`, error);
    return false;
  }
}

/**
 * Delete a category
 * @param slug the category slug
 * @returns whether the delete succeeded
 */
export function deleteCategory(slug: string): boolean {
  try {
    const categories = getAllCategories();
    
    // Filter out the category being deleted
    const updatedCategories = categories.filter(c => c.slug !== slug);
    
    // Check whether anything changed
    if (updatedCategories.length === categories.length) {
      console.error(`找不到分类 ${slug}`);
      return false;
    }
    
    // Save the updated categories
    return saveCategories(updatedCategories);
  } catch (error) {
    console.error(`删除分类 ${slug} 失败:`, error);
    return false;
  }
} 