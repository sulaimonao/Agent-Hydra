import fetch from 'node-fetch';

async function callApiWithRetry(endpoint, payload, retries = 3, backoff = 300) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
          const error = new Error(`HTTP error! status: ${response.status}`);
          error.response = response;
          throw error;
      }

      return await response.json();
    } catch (error) {
      if (attempt < retries && shouldRetry(error)) {
        await new Promise(resolve => setTimeout(resolve, backoff * attempt));
      } else {
        throw error;
      }
    }
  }
}

function shouldRetry(error) {
  return !error.response || (error.response.status >= 500 && error.response.status < 600);
}

export { callApiWithRetry };