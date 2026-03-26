import { prepareData, qaCache, generateAnswer, chunks, extractor } from '@/utils/qa-utils';

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    if (!question) {
      return new Response(JSON.stringify({ message: 'Query required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await prepareData();

    // Check if the question is already in the cache
    if (qaCache.has(question)) {
      const cachedResponse = qaCache.get(question);
      return new Response(JSON.stringify(cachedResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
      });
    }

    // Embed the query and find similar chunks
    const queryEmbedding = await extractor(question, { pooling: 'mean', normalize: true });
    const queryVec = Array.from(queryEmbedding.data as number[]);

    // Cosine similarity calculation
    const similarities = chunks.map((chunk, i) => ({
      index: i,
      similarity: cosineSimilarity(queryVec, chunk.embedding)
    }));

    similarities.sort((a, b) => b.similarity - a.similarity);

    const topK = 3;
    const results = similarities.slice(0, topK).map(sim => ({
      text: chunks[sim.index].text,
      section: chunks[sim.index].section,
      similarity: sim.similarity
    }));

    // Generate answer
    const answer = await generateAnswer(question, results);

    const response = {
      answer,
      details: results
    };

    // Cache the response
    qaCache.set(question, response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Cosine similarity utility (extracted from utils for this route)
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let aMag = 0;
  let bMag = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    aMag += a[i] * a[i];
    bMag += b[i] * b[i];
  }
  return dot / (Math.sqrt(aMag) * Math.sqrt(bMag));
}
