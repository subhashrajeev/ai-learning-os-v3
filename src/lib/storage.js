// Storage utility for persisting user data in localStorage

import {
    createReviewItem,
    getDueReviews,
    scoreToQuality,
    updateReviewItem,
} from '@/lib/spacedRepetition';

const STORAGE_KEYS = {
    PROFILE: 'ai_learning_profile',
    PROGRESS: 'ai_learning_progress',
    CURRICULUM: 'ai_learning_curriculum',
    STREAK: 'ai_learning_streak',
    SAVED_ITEMS: 'ai_learning_saved',
    REVIEWS: 'ai_learning_reviews',
    MEMORY_SNAPSHOTS: 'ai_learning_memory_snapshots',
};

// Profile Management
export function saveProfile(profile) {
    try {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
        return true;
    } catch (error) {
        console.error('Error saving profile:', error);
        return false;
    }
}

export function loadProfile() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading profile:', error);
        return null;
    }
}

export function clearProfile() {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
}

// Progress Management
export function saveProgress(progress) {
    try {
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
        return true;
    } catch (error) {
        console.error('Error saving progress:', error);
        return false;
    }
}

export function loadProgress() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
        return data ? JSON.parse(data) : getDefaultProgress();
    } catch (error) {
        console.error('Error loading progress:', error);
        return getDefaultProgress();
    }
}

function getDefaultProgress() {
    return {
        completedDays: [],
        currentDay: 1,
        totalTimeSpent: 0,
        lessonsCompleted: 0,
        quizzesTaken: 0,
        quizScore: 0,
        lastActiveDate: null,
        startDate: new Date().toISOString(),
        lastReviewDate: null,
    };
}

// Curriculum Management
export function saveCurriculum(curriculum) {
    try {
        localStorage.setItem(STORAGE_KEYS.CURRICULUM, JSON.stringify(curriculum));
        return true;
    } catch (error) {
        console.error('Error saving curriculum:', error);
        return false;
    }
}

export function loadCurriculum() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.CURRICULUM);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading curriculum:', error);
        return null;
    }
}

// Streak Management
export function saveStreak(streak) {
    try {
        localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
        return true;
    } catch (error) {
        console.error('Error saving streak:', error);
        return false;
    }
}

export function loadStreak() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.STREAK);
        return data ? JSON.parse(data) : getDefaultStreak();
    } catch (error) {
        console.error('Error loading streak:', error);
        return getDefaultStreak();
    }
}

function getDefaultStreak() {
    return {
        currentStreak: 0,
        longestStreak: 0,
        lastLoginDate: null,
        streakHistory: [],
    };
}

export function updateStreak() {
    const streak = loadStreak();
    const today = new Date().toDateString();
    const lastLogin = streak.lastLoginDate ? new Date(streak.lastLoginDate).toDateString() : null;

    if (lastLogin === today) {
        // Already logged in today
        return streak;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastLogin === yesterday.toDateString()) {
        // Consecutive day - increase streak
        streak.currentStreak += 1;
        if (streak.currentStreak > streak.longestStreak) {
            streak.longestStreak = streak.currentStreak;
        }
    } else if (lastLogin !== today) {
        // Streak broken
        streak.currentStreak = 1;
    }

    streak.lastLoginDate = new Date().toISOString();
    streak.streakHistory.push({
        date: today,
        streak: streak.currentStreak,
    });

    saveStreak(streak);
    return streak;
}

// Saved Items (for Ecosystem Pulse)
export function saveSavedItems(items) {
    try {
        localStorage.setItem(STORAGE_KEYS.SAVED_ITEMS, JSON.stringify(items));
        return true;
    } catch (error) {
        console.error('Error saving items:', error);
        return false;
    }
}

export function loadSavedItems() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.SAVED_ITEMS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading saved items:', error);
        return [];
    }
}

export function addSavedItem(item) {
    const items = loadSavedItems();
    items.push({ ...item, savedAt: new Date().toISOString() });
    saveSavedItems(items);
    return items;
}

export function removeSavedItem(itemId) {
    const items = loadSavedItems();
    const filtered = items.filter(item => item.id !== itemId);
    saveSavedItems(filtered);
    return filtered;
}

// Mark day as completed
export function markDayCompleted(dayNumber, timeSpent = 0) {
    const progress = loadProgress();

    if (!progress.completedDays.includes(dayNumber)) {
        progress.completedDays.push(dayNumber);
        progress.lessonsCompleted += 1;
    }

    progress.currentDay = Math.max(progress.currentDay, dayNumber + 1);
    progress.totalTimeSpent += timeSpent;
    progress.lastActiveDate = new Date().toISOString();

    saveProgress(progress);
    updateStreak();

    return progress;
}

// Update quiz score
export function updateQuizScore(correct, total) {
    const progress = loadProgress();

    progress.quizzesTaken += 1;
    const newTotal = progress.quizScore * (progress.quizzesTaken - 1) + (correct / total * 100);
    progress.quizScore = Math.round(newTotal / progress.quizzesTaken);

    saveProgress(progress);
    return progress;
}

// Clear all data
export function clearAllData() {
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
}

// Export all data (for backup)
export function exportAllData() {
    return {
        profile: loadProfile(),
        progress: loadProgress(),
        curriculum: loadCurriculum(),
        streak: loadStreak(),
        savedItems: loadSavedItems(),
        reviews: loadReviews(),
        memorySnapshots: loadMemorySnapshots(),
        exportedAt: new Date().toISOString(),
    };
}

// Spaced Repetition Reviews
export function loadReviews() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading reviews:', error);
        return [];
    }
}

export function saveReviews(reviews) {
    try {
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
        return true;
    } catch (error) {
        console.error('Error saving reviews:', error);
        return false;
    }
}

export function upsertReviewItem(item) {
    if (!item) return [];
    const reviews = loadReviews();
    const index = reviews.findIndex((review) => review.id === item.id || review.front === item.front);
    const updatedItem = {
        ...item,
        updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
        reviews[index] = { ...reviews[index], ...updatedItem };
    } else {
        reviews.push(updatedItem);
    }

    saveReviews(reviews);
    return reviews;
}

export function seedReviewFromLesson(dayInfo, lessonContent, profile, reflection) {
    if (!dayInfo?.topic) return null;

    const snippet = (lessonContent || '')
        .split('\n')
        .filter((line) => line.trim())
        .slice(0, 3)
        .join(' ')
        .slice(0, 200);

    const reviewItem = createReviewItem({
        id: `lesson-${dayInfo.day}`,
        front: dayInfo.topic,
        back: [dayInfo.objective, snippet, reflection].filter(Boolean).join(' | '),
        tags: ['lesson', profile?.goal].filter(Boolean),
        source: 'lesson',
        metadata: { day: dayInfo.day, topic: dayInfo.topic },
    });

    upsertReviewItem(reviewItem);
    return reviewItem;
}

export function updateReviewFromScore(topic, score, metadata = {}) {
    if (!topic) return null;
    const reviews = loadReviews();
    let item = reviews.find((review) => review.front === topic || review.id === `topic-${topic}`);

    if (!item) {
        item = createReviewItem({
            id: `topic-${topic}`,
            front: topic,
            back: `Recall core concepts about ${topic}.`,
            tags: ['practice'],
            source: 'practice',
            metadata,
        });
        reviews.push(item);
    }

    const updated = updateReviewItem(item, scoreToQuality(score), new Date());
    updated.metadata = { ...(item.metadata || {}), ...metadata };
    const next = reviews.map((review) => (review.id === updated.id ? updated : review));
    saveReviews(next);
    return updated;
}

export function getDueReviewItems(referenceDate = new Date()) {
    return getDueReviews(loadReviews(), referenceDate);
}

// Memory snapshots (local fallback for ChromaDB)
export function loadMemorySnapshots() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.MEMORY_SNAPSHOTS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading memory snapshots:', error);
        return [];
    }
}

export function saveMemorySnapshot(entry) {
    if (!entry?.content) return [];
    const snapshots = loadMemorySnapshots();
    snapshots.unshift({ ...entry, savedAt: new Date().toISOString() });
    const trimmed = snapshots.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.MEMORY_SNAPSHOTS, JSON.stringify(trimmed));
    return trimmed;
}
