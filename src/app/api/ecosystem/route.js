import { generateEcosystemFromLiveData } from '@/lib/gemini';

const BRAVE_API_KEY = process.env.BRAVE_SEARCH_API_KEY || '';
const BRAVE_NEWS_URL = 'https://api.search.brave.com/res/v1/news/search';

async function fetchBraveNews(interests, goal) {
    const query = `${goal || 'AI'} ${interests || 'artificial intelligence'} latest news`;

    const params = new URLSearchParams({
        q: query,
        count: '10',
        freshness: 'pw', // past week
    });

    const response = await fetch(`${BRAVE_NEWS_URL}?${params}`, {
        headers: {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip',
            'X-Subscription-Token': BRAVE_API_KEY,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Brave API error:', response.status, errorText);
        throw new Error(`Brave Search API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
}

export async function POST(request) {
    try {
        const { interests, goal } = await request.json();

        if (!BRAVE_API_KEY) {
            return Response.json(
                { ok: false, error: 'BRAVE_SEARCH_API_KEY is not configured' },
                { status: 500 }
            );
        }

        // 1. Fetch live news from Brave Search
        const braveResults = await fetchBraveNews(interests, goal);

        if (!braveResults.length) {
            return Response.json(
                { ok: false, error: 'No news results found' },
                { status: 404 }
            );
        }

        // 2. Format results for Gemini
        const articles = braveResults.map((r, i) => ({
            id: i + 1,
            title: r.title,
            description: r.description,
            url: r.url,
            source: r.meta_url?.hostname || 'Unknown',
            publishedAt: r.age || 'Recent',
        }));

        // 3. Pass to Gemini for personalization
        const result = await generateEcosystemFromLiveData(interests, goal, articles);

        return Response.json({ ok: true, ...result });
    } catch (error) {
        console.error('Ecosystem API error:', error);
        return Response.json(
            { ok: false, error: error.message },
            { status: 500 }
        );
    }
}
