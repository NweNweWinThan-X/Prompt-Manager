import { CategoryData } from '@/types';
import {
  CATEGORIES as CATEGORY_DEFINITIONS,
  resolveCategorySlug,
  resolveCategoryName,
} from '../../categories.config';

export { resolveCategorySlug, resolveCategoryName };

// 类别配置（单一来源见根目录的 categories.config.js）
export const CATEGORIES: CategoryData[] = CATEGORY_DEFINITIONS.map(
  ({ slug, name, nameKey, icon }) => ({ slug, name, nameKey, icon, count: 0 })
);

// 分类名称（含别名）到 slug 的映射
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

// slug 到分类名称的映射
export const SLUG_TO_CATEGORY: Record<string, string> = CATEGORY_DEFINITIONS.reduce(
  (map, { slug, name }) => {
    map[slug] = name;
    return map;
  },
  {} as Record<string, string>
);
