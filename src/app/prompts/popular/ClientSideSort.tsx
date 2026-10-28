"use client";
import { useState } from 'react';
import Link from 'next/link';
import { PromptData } from '@/types';
import PromptCard from '@/components/PromptCard';
import styles from './page.module.css';

interface ClientSideSortProps {
    prompts: PromptData[];
}

export default function ClientSideSort({ prompts }: ClientSideSortProps) {
    // Which sort the user has picked
    const [sortMethod, setSortMethod] = useState<'rating' | 'date'>('rating');

    // Sorts the list
    const sortPrompts = (promptList: PromptData[], sortMethod: 'rating' | 'date'): PromptData[] => {
        try {
            if (sortMethod === 'rating') {
                return [...promptList].sort((a, b) => {
                    if (a.rating !== undefined && b.rating !== undefined) {
                        return b.rating - a.rating; // Descending: highest rating first
                    }
                    // Rated prompts come before unrated ones
                    if (a.rating !== undefined) return -1;
                    if (b.rating !== undefined) return 1;
                    return 0;
                });
            } else {
                // Sort by date
                return [...promptList].sort((a, b) => {
                    if (a.createdAt && b.createdAt) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    }
                    // Dated prompts come before undated ones
                    if (a.createdAt) return -1;
                    if (b.createdAt) return 1;
                    return 0;
                });
            }
        } catch (error) {
            console.error('排序过程中出错:', error);
            return promptList; // On error, hand back the list unsorted
        }
    };

    // Handle a change of sort
    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortMethod(e.target.value as 'rating' | 'date');
    };

    // The sorted prompts
    const sortedPrompts = sortPrompts(prompts, sortMethod);

    return (
        <>
            {/* Filter and sort menu */}
            <div className={styles['filter-bar']}>
                <div className={styles['filter-menu']}>
                    <span className={styles['filter-label']}>排序方式：</span>
                    <select
                        className={styles['filter-select']}
                        value={sortMethod}
                        onChange={handleSortChange}
                    >
                        <option value="rating">按热度（默认）</option>
                        <option value="date">按日期</option>
                    </select>
                </div>
                <div className={styles['results-count']}>{sortedPrompts.length} 个提示词</div>
            </div>

            {/* Prompt list */}
            {sortedPrompts.length > 0 ? (
                <div className={styles['prompt-grid']}>
                    {sortedPrompts.slice(0, 9).map((prompt, index) => (
                        <PromptCard
                            key={prompt.slug}
                            prompt={prompt}
                            featured={index < 3} // Mark the top three as featured
                            isNew={prompt.isNew}
                        />
                    ))}
                </div>
            ) : (
                <div className={styles['empty-state']}>
                    <div className={styles['empty-icon']}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 15C8 15 9.5 17 12 17C14.5 17 16 15 16 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 10H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M15 10H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <p className={styles['empty-title']}>暂无热门提示词</p>
                    <p className={styles['empty-description']}>
                        我们正在收集用户反馈，很快将添加热门提示词
                    </p>
                    <Link href="/prompts" className={styles['view-button']}>
                        浏览所有提示词
                    </Link>
                </div>
            )}
        </>
    );
} 