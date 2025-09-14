'use server';

export async function askQuestion(question: string): Promise<{ answer: string; details: any[] }> {
  // Construct full URL for server action fetch call
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  let host = 'localhost:3000'; // Default for development with Turbopack

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    host = process.env.NEXT_PUBLIC_SITE_URL;
  } else if (process.env.VERCEL_URL) {
    host = `${process.env.VERCEL_URL}`;
  }

  const baseUrl = `${protocol}://${host}`;
  const apiUrl = `${baseUrl}/api/cv/qa`;

  console.log('QA API URL:', apiUrl); // Debug logging

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    console.error('QA API response not ok:', response.status, response.statusText);
    throw new Error('Failed to get answer');
  }

  return response.json();
}
