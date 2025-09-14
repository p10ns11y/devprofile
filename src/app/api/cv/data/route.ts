import { NextApiRequest, NextApiResponse } from 'next';
import cvdata from '@/data/cvdata.json';

export async function GET() {
  // Return the actual CV data
  return new Response(JSON.stringify(cvdata), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
