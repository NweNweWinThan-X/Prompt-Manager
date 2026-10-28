import fs from 'fs';
import path from 'path';

// Constants
export const PROMPTS_DIRECTORY = path.join(process.cwd(), 'prompts');

/**
 * Make sure a directory exists, creating it if it does not
 * @param directory the directory path
 * @returns whether the directory is now guaranteed to exist
 */
export function ensureDirectoryExists(directory: string): boolean {
  try {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
      console.log(`Created directory: ${directory}`);
    }
    return true;
  } catch (error) {
    console.error(`Failed to create directory: ${directory}`, error);
    return false;
  }
}

/**
 * Generate a unique slug
 * @param title the title
 * @returns the generated unique slug
 */
export function generateUniqueSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
    
  const timestamp = Date.now();
  return `${base}-${timestamp}`;
}

/**
 * Read a file without throwing
 * @param filePath the file path
 * @param defaultValue the value to return if the read fails
 * @returns the file content, or the default value
 */
export function safeReadFile(filePath: string, defaultValue: string = ''): string {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
    return defaultValue;
  } catch (error) {
    console.error(`Failed to read file: ${filePath}`, error);
    return defaultValue;
  }
}

/**
 * Write a file without throwing
 * @param filePath the file path
 * @param content the file content
 * @returns whether the write succeeded
 */
export function safeWriteFile(filePath: string, content: string): boolean {
  try {
    fs.writeFileSync(filePath, content);
    return true;
  } catch (error) {
    console.error(`Failed to write file: ${filePath}`, error);
    return false;
  }
}

/**
 * Delete a file without throwing
 * @param filePath the file path
 * @returns whether the delete succeeded
 */
export function safeDeleteFile(filePath: string): boolean {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return true;
  } catch (error) {
    console.error(`Failed to delete file: ${filePath}`, error);
    return false;
  }
}

/**
 * Parse JSON without throwing
 * @param content the JSON string
 * @param defaultValue the value to return if parsing fails
 * @returns the parsed object, or the default value
 */
export function safeParseJson<T>(content: string, defaultValue: T): T {
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    console.error('Failed to parse JSON', error);
    return defaultValue;
  }
} 