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
