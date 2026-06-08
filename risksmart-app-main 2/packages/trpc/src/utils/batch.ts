interface ConcurrentListOptions {
  page: number;
  perPage: number;
}

export const chunk = <T>(arr: T[], size = 10): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }

  return chunks;
};

/**
 * Generic function to process items in batches with parallel execution
 * @param items Array of items to process
 * @param processBatch Function to process each batch of items
 * @param batchSize Size of each batch (default 1000)
 * @param concurrency Maximum number of batches to process in parallel (default 1)
 * @param rateLimit Optional rate limit in requests per minute (default undefined)
 * @returns Promise that resolves when all batches are processed
 */
export const processBatches = async <T>(
  items: T[],
  processBatch: (batch: T[], percentComplete: number) => Promise<void>,
  batchSize: number = 1000,
  concurrency: number = 1,
  rateLimit?: number
): Promise<void> => {
  // Calculate delay needed between batches if rate limit is specified
  const delayMs = rateLimit ? (60 * 1000) / rateLimit : 0;
  let lastBatchTime = 0;
  let processedItems = 0;
  const totalItems = items.length;

  // Process batches with controlled concurrency
  for (let i = 0; i < items.length; i += batchSize * concurrency) {
    // If rate limiting is enabled, wait until enough time has passed
    if (rateLimit && lastBatchTime) {
      const timeSinceLastBatch = Date.now() - lastBatchTime;
      if (timeSinceLastBatch < delayMs) {
        await new Promise((resolve) =>
          setTimeout(resolve, delayMs - timeSinceLastBatch)
        );
      }
    }

    const batchPromises: Promise<void>[] = [];
    let itemsInCurrentBatches = 0;

    // Create up to 'concurrency' number of batch promises
    for (let j = 0; j < concurrency; j++) {
      const start = i + j * batchSize;
      const batch = items.slice(start, start + batchSize);
      if (batch.length > 0) {
        const itemsBeforeBatch = processedItems + itemsInCurrentBatches;
        const percentComplete = Math.round(
          (itemsBeforeBatch / totalItems) * 100
        );
        itemsInCurrentBatches += batch.length;
        batchPromises.push(processBatch(batch, percentComplete));
      }
    }

    // Wait for the current set of batches to complete
    await Promise.all(batchPromises);
    processedItems += itemsInCurrentBatches;
    lastBatchTime = Date.now();
  }
};

/**
 * Executes async operations in controlled concurrent batches and collects results
 * @param items - Array of items to process
 * @param processor - Async function to process each item
 * @param concurrency - Number of concurrent operations per batch. Determines the size of each batch processed concurrently.
 * @returns Array of successful results. Throws an error if any of the operations fail.
 */
export const processBatchesWithResults = async <T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> => {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(batch.map(processor));

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        if (result.reason instanceof Error) {
          throw result.reason;
        }
        throw new Error(`Batch processing failed: ${String(result.reason)}`);
      }
    }
  }

  return results;
};

export async function fetchWithConcurrency<T>(
  fetchFn: (params: ConcurrentListOptions) => Promise<T[] | { data: T[] }>,
  params: Omit<ConcurrentListOptions, 'page' | 'perPage'> = {},
  concurrency: number = 1
): Promise<T[]> {
  const results: T[] = [];
  let page = 1;
  const perPage = 100;
  const batchSize = concurrency;

  while (true) {
    const pagePromises = Array.from({ length: batchSize }, (_, i) =>
      fetchFn({ ...params, page: page + i, perPage })
    );

    const pageResults = await Promise.all(pagePromises);
    const flatResults = pageResults.flatMap((r) =>
      Array.isArray(r) ? r : r.data
    );

    if (flatResults.length === 0) {
      break;
    }

    results.push(...flatResults);
    page += batchSize;
  }

  return results;
}
