// Spaced Repetition (SM-2) utilities

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

export function createReviewItem({
    id,
    front,
    back,
    tags = [],
    source = 'lesson',
    metadata = {},
}) {
    const now = new Date();

    return {
        id: id || `review-${now.getTime()}`,
        front,
        back,
        tags,
        source,
        metadata,
        interval: 1,
        repetition: 0,
        easeFactor: DEFAULT_EASE_FACTOR,
        lapses: 0,
        dueDate: now.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        lastReviewed: null,
        qualityHistory: [],
    };
}

export function scoreToQuality(score = 0) {
    const normalized = Math.max(0, Math.min(100, Math.round(score)));
    if (normalized >= 90) return 5;
    if (normalized >= 80) return 4;
    if (normalized >= 65) return 3;
    if (normalized >= 45) return 2;
    if (normalized >= 25) return 1;
    return 0;
}

export function updateReviewItem(item, quality, reviewDate = new Date()) {
    const q = Math.max(0, Math.min(5, Math.round(quality)));
    let repetition = item.repetition ?? 0;
    let interval = item.interval ?? 1;
    let easeFactor = item.easeFactor ?? DEFAULT_EASE_FACTOR;
    let lapses = item.lapses ?? 0;

    if (q < 3) {
        repetition = 0;
        interval = 1;
        lapses += 1;
    } else {
        repetition += 1;
        if (repetition === 1) {
            interval = 1;
        } else if (repetition === 2) {
            interval = 6;
        } else {
            interval = Math.round(interval * easeFactor);
        }
    }

    easeFactor = Math.max(
        MIN_EASE_FACTOR,
        easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    );

    const due = new Date(reviewDate);
    due.setDate(due.getDate() + interval);

    return {
        ...item,
        repetition,
        interval,
        easeFactor,
        lapses,
        dueDate: due.toISOString(),
        updatedAt: reviewDate.toISOString(),
        lastReviewed: reviewDate.toISOString(),
        qualityHistory: [
            ...(item.qualityHistory || []),
            { date: reviewDate.toISOString(), quality: q }
        ],
    };
}

export function getDueReviews(reviews = [], referenceDate = new Date()) {
    return reviews.filter((item) => {
        if (!item?.dueDate) return true;
        return new Date(item.dueDate) <= referenceDate;
    });
}

export function getNextReviewDate(reviews = []) {
    const futureDates = reviews
        .map((item) => item?.dueDate)
        .filter(Boolean)
        .map((date) => new Date(date))
        .sort((a, b) => a - b);

    return futureDates[0] || null;
}
