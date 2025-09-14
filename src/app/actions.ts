'use server';

export async function askQuestion(question: string): Promise<{ answer: string; details: any[] }> {
  try {
    // Get current URL from headers to construct proper absolute URL
    const host = await import('next/headers').then(h => h.headers()).then(h => h.get('host'));
    const protocol = await import('next/headers').then(h => h.headers()).then(h => h.get('x-forwarded-proto') || 'http');

    if (!host) {
      throw new Error('Unable to determine host from headers');
    }

    const apiUrl = `${protocol}://${host}/api/cv/qa`;
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
  } catch (error) {
    // Add better error logging
    console.error('Server action error:', error);
    throw error;
  }
}
