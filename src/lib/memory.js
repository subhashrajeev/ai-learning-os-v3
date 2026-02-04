// Client-side memory utilities with ChromaDB API fallback

import { loadMemorySnapshots, saveMemorySnapshot } from '@/lib/storage';

export async function upsertMemoryEntries(entries = []) {
    if (!entries.length) return { count: 0, source: 'none' };

    try {
        const response = await fetch('/api/memory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'upsert', entries }),
        });

        if (!response.ok) throw new Error('Memory API error');
        const data = await response.json();

        entries.forEach((entry) => saveMemorySnapshot(entry));
        return { ...data, source: 'chroma' };
    } catch (error) {
        entries.forEach((entry) => saveMemorySnapshot(entry));
        return { count: entries.length, source: 'local' };
    }
}

export async function queryMemoryEntries(query, limit = 4) {
    if (!query) return [];

    try {
        const response = await fetch('/api/memory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'query', queryTexts: [query], nResults: limit }),
        });

        if (!response.ok) throw new Error('Memory API error');
        const data = await response.json();
        const docs = data?.documents?.[0] || [];
        const metas = data?.metadatas?.[0] || [];

        return docs.map((doc, index) => ({
            content: doc,
            metadata: metas[index] || {},
        }));
    } catch (error) {
        const snapshots = loadMemorySnapshots();
        const filtered = snapshots
            .filter((entry) => entry.content?.toLowerCase().includes(query.toLowerCase()))
            .slice(0, limit);

        return filtered;
    }
}

export function createLessonMemory({
    dayInfo,
    lessonContent,
    reflection,
    profile,
}) {
    if (!dayInfo) return null;

    const excerpt = (lessonContent || '')
        .split('\n')
        .filter((line) => line.trim())
        .slice(0, 4)
        .join(' ')
        .slice(0, 280);

    const summary = `${dayInfo.topic}: ${dayInfo.objective || ''}`.trim();

    return {
        id: `lesson-${dayInfo.day}-${Date.now()}`,
        content: [summary, excerpt, reflection].filter(Boolean).join(' | '),
        metadata: {
            day: dayInfo.day,
            topic: dayInfo.topic,
            goal: profile?.goal || 'AI learning',
            createdAt: new Date().toISOString(),
        },
    };
}
