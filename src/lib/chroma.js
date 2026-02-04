// ChromaDB integration for long-term memory

import { ChromaClient } from 'chromadb';

const DEFAULT_COLLECTION = 'ai_learning_memory';

let cachedClient = null;

function getClient() {
    if (!cachedClient) {
        cachedClient = new ChromaClient({
            path: process.env.CHROMA_URL || 'http://localhost:8000',
        });
    }
    return cachedClient;
}

async function getCollection(collectionName = DEFAULT_COLLECTION) {
    const client = getClient();
    return client.getOrCreateCollection({ name: collectionName });
}

function normalizeEntries(entries = []) {
    const ids = [];
    const documents = [];
    const metadatas = [];

    entries.forEach((entry) => {
        if (!entry?.content) return;
        ids.push(entry.id || `memory-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
        documents.push(entry.content);
        metadatas.push(entry.metadata || {});
    });

    return { ids, documents, metadatas };
}

export async function upsertMemory({ entries = [], collectionName = DEFAULT_COLLECTION }) {
    const collection = await getCollection(collectionName);
    const { ids, documents, metadatas } = normalizeEntries(entries);

    if (documents.length === 0) return { count: 0 };

    await collection.upsert({ ids, documents, metadatas });
    return { count: documents.length };
}

export async function queryMemory({ queryTexts = [], nResults = 5, collectionName = DEFAULT_COLLECTION }) {
    if (queryTexts.length === 0) return { documents: [], metadatas: [] };

    const collection = await getCollection(collectionName);
    const results = await collection.query({
        queryTexts,
        nResults,
    });

    return results;
}
