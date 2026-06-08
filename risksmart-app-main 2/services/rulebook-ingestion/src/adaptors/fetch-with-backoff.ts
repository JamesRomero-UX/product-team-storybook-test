const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

export const fetchWithBackoff = async (
  input: string | URL | Request,
  init?: RequestInit
): Promise<Response> => {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(input, init);

    if (response.ok || !RETRYABLE_STATUS_CODES.has(response.status)) {
      return response;
    }

    if (attempt === MAX_RETRIES) {
      return response;
    }

    const delay = BASE_DELAY_MS * Math.pow(2, attempt) * (0.5 + Math.random());
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  // Unreachable, but satisfies the type checker
  throw new Error('Unexpected end of retry loop');
};
