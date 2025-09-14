'use server';

export async function askQuestion(question: string): Promise<{ answer: string; details: any[] }> {
  try {
    // Use relative URL for server actions - much more reliable across different hosting platforms
    const apiUrl = '/api/cv/qa';

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
