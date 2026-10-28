import { CategoryData } from '@/types';
import {
  CATEGORIES as CATEGORY_DEFINITIONS,
  resolveCategorySlug,
  resolveCategoryName,
} from '../../categories.config';

export { resolveCategorySlug, resolveCategoryName };

// Category config (single source of truth: categories.config.js in the repo root)
export const CATEGORIES: CategoryData[] = CATEGORY_DEFINITIONS.map(
  ({ slug, name, nameKey, icon }) => ({ slug, name, nameKey, icon, count: 0 })
);

// Translation key for a prompt's `category` value, whatever spelling it uses
// (canonical name, slug or alias). Returns '' for an unknown category, which
// callers treat as "show the raw value".
export const getCategoryNameKey = (category: string): string => {
  const slug = resolveCategorySlug(category);
  return CATEGORY_DEFINITIONS.find((entry) => entry.slug === slug)?.nameKey ?? '';
};

// Category name (including aliases) to slug
export const CATEGORY_TO_SLUG: Record<string, string> = CATEGORY_DEFINITIONS.reduce(
  (map, { slug, name, aliases }) => {
    map[name] = slug;
    aliases.forEach((alias: string) => {
      map[alias] = slug;
    });
    return map;
  },
  {} as Record<string, string>
);

// Slug to category name
export const SLUG_TO_CATEGORY: Record<string, string> = CATEGORY_DEFINITIONS.reduce(
  (map, { slug, name }) => {
    map[slug] = name;
    return map;
  },
  {} as Record<string, string>
);
