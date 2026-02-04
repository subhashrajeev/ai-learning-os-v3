import { upsertMemory, queryMemory } from '@/lib/chroma';

export async function POST(request) {
    try {
        const body = await request.json();

        if (body.action === 'upsert') {
            const result = await upsertMemory({ entries: body.entries || [] });
            return Response.json({ ok: true, ...result });
        }

        if (body.action === 'query') {
            const result = await queryMemory({
                queryTexts: body.queryTexts || [],
                nResults: body.nResults || 4,
            });
            return Response.json(result || {});
        }

        return Response.json({ ok: false, error: 'Unknown action' }, { status: 400 });
    } catch (error) {
        return Response.json({ ok: false, error: error.message }, { status: 500 });
    }
}
