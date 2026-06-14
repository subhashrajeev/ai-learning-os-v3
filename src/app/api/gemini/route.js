import { 
    generateCurriculum, 
    generateLessonContent, 
    generateQuizQuestions, 
    generateProactiveSuggestions, 
    analyzeAndAdapt 
} from '@/lib/gemini';

export async function POST(request) {
    try {
        const body = await request.json();
        const { action, payload } = body;

        if (action === 'curriculum') {
            const result = await generateCurriculum(payload.profile);
            return Response.json({ ok: true, data: result });
        }

        if (action === 'lesson') {
            const result = await generateLessonContent(payload.topic, payload.profile, payload.dayInfo);
            return Response.json({ ok: true, data: result });
        }

        if (action === 'quiz') {
            const result = await generateQuizQuestions(payload.topic, payload.profile, payload.count);
            return Response.json({ ok: true, data: result });
        }

        if (action === 'suggestions') {
            const result = await generateProactiveSuggestions(payload.profile, payload.progress, payload.context);
            return Response.json({ ok: true, data: result });
        }

        if (action === 'adapt') {
            const result = await analyzeAndAdapt(payload.profile, payload.progress, payload.curriculum);
            return Response.json({ ok: true, data: result });
        }

        return Response.json({ ok: false, error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Gemini API Route Error:', error);
        return Response.json(
            { ok: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
