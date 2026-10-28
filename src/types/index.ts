// Re-export all the shared types
export * from './common';

// Legacy type definitions kept for compatibility; can be removed in a later version
export interface PromptData {
    slug: string;
    title: string;
    description: string;
    category: string;
    content?: string;
    rating?: number;
    createdAt?: string;
    featured?: boolean;
    isNew?: boolean;
  }
  
  export interface CategoryData {
    slug: string;
    name: string;
    nameKey?: string;
    icon: string;
    count?: number;
  }