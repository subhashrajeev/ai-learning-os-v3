// Client-side wrappers that call the secure server-side API proxy

export async function generateCurriculum(profile) {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'curriculum', payload: { profile } }),
    });
    const res = await response.json();
    if (!res.ok) throw new Error(res.error);
    return res.data;
}

export async function generateLessonContent(topic, profile, dayInfo) {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lesson', payload: { topic, profile, dayInfo } }),
    });
    const res = await response.json();
    if (!res.ok) throw new Error(res.error);
    return res.data;
}

export async function generateQuizQuestions(topic, profile, count = 5) {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'quiz', payload: { topic, profile, count } }),
    });
    const res = await response.json();
    if (!res.ok) throw new Error(res.error);
    return res.data;
}

export async function generateProactiveSuggestions(profile, progress, context = {}) {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suggestions', payload: { profile, progress, context } }),
    });
    const res = await response.json();
    if (!res.ok) throw new Error(res.error);
    return res.data;
}

export async function analyzeAndAdapt(profile, progress, curriculum) {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'adapt', payload: { profile, progress, curriculum } }),
    });
    const res = await response.json();
    if (!res.ok) throw new Error(res.error);
    return res.data;
}
