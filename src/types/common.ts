/**
 * Prompt metadata
 */
export interface PromptMetadata {
  /** Creation time */
  createdAt: string;
  /** Last update time */
  updatedAt: string;
  /** Featured or not */
  featured: boolean;
  /** New prompt or not (deprecated; getRecentPrompts derives this from the creation time) */
  isNew?: boolean;
  /** Rating (1-10) */
  rating?: number;
}

/**
 * Prompt frontmatter
 */
export interface PromptFrontmatter {
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Category */
  category: string;
  /** Tags */
  tags: string[];
  /** Author */
  author: string;
}

/**
 * A complete prompt
 */
export interface Prompt extends PromptMetadata, PromptFrontmatter {
  /** Unique identifier */
  slug: string;
  /** Content */
  content: string;
}

/**
 * Category information
 */
export interface CategoryData {
  /** Unique identifier */
  slug: string;
  /** Name */
  name: string;
  /** i18n key for the name */
  nameKey?: string;
  /** Icon */
  icon: string;
  /** Count */
  count?: number;
} 