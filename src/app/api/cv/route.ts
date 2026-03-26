import { createHash } from 'crypto';
import cvdata from '@/data/cvdata.json';

export async function GET(request: Request) {
  const dataString = JSON.stringify(cvdata);
  const etag = createHash('sha256').update(dataString).digest('hex');

  const ifNoneMatch = request.headers.get('if-none-match');
  if (ifNoneMatch === `"${etag}"`) {
    return new Response(null, { status: 304 });
  }

  return new Response(JSON.stringify(cvdata), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'max-age=300, stale-while-revalidate=3600',
      'ETag': `"${etag}"`,
    },
  });
}
