import cvdata from '@/data/cvdata.json';

export async function GET() {
  return new Response(JSON.stringify(cvdata), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
