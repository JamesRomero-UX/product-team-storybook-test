import {
  GetParameterCommand,
  ParameterNotFound,
  SSMClient,
} from '@aws-sdk/client-ssm';

import { getLogger } from '../logger';

const logger = getLogger();
const ssmClient = new SSMClient({});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * A resilient SSM parameter client with caching and retry logic.
 * Handles cases where the parameter might not be immediately available
 * (e.g., when consumer service starts before producer service is deployed).
 */
export class CachedSsmParameter {
  private value: string | null = null;
  private lastFetched: number | null = null;
  private fetchPromise: Promise<string> | null = null;

  constructor(
    private readonly parameterName: string,
    private readonly cacheTTLms: number = 300000, // 5 minutes
    private readonly maxRetries: number = 5,
    private readonly initialRetryDelayMs: number = 1000
  ) {
    if (!parameterName) {
      throw new Error('SSM parameter name cannot be empty.');
    }
    logger.info(`Initialized CachedSsmParameter for: ${this.parameterName}`);
  }

  public async getValue(): Promise<string> {
    const now = Date.now();
    if (
      this.value &&
      this.lastFetched &&
      now - this.lastFetched < this.cacheTTLms
    ) {
      logger.debug(
        `Returning cached SSM parameter value for: ${this.parameterName}`
      );

      return this.value;
    }

    // If already fetching, wait for that promise instead of starting a new fetch
    if (this.fetchPromise) {
      logger.debug(
        `Waiting for in-flight fetch of SSM parameter: ${this.parameterName}`
      );

      return this.fetchPromise;
    }

    // Start new fetch and store the promise
    this.fetchPromise = this.doFetch();
    try {
      return await this.fetchPromise;
    } finally {
      this.fetchPromise = null;
    }
  }

  private async doFetch(): Promise<string> {
    logger.info(`Fetching/refreshing SSM parameter: ${this.parameterName}`);

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const command = new GetParameterCommand({
          Name: this.parameterName,
        });
        const response = await ssmClient.send(command);
        const fetchedValue = response.Parameter?.Value;

        if (!fetchedValue) {
          throw new Error(
            `SSM Parameter '${this.parameterName}' is empty or has no value.`
          );
        }

        this.value = fetchedValue;
        this.lastFetched = Date.now();
        logger.info(
          `Successfully fetched and cached SSM parameter: ${this.parameterName}`
        );

        return this.value;
      } catch (error) {
        if (error instanceof ParameterNotFound) {
          logger.warn(
            `SSM Parameter not found: ${this.parameterName}. Attempt ${attempt}/${this.maxRetries}.`
          );
          if (attempt === this.maxRetries) {
            throw error;
          }
          await sleep(this.initialRetryDelayMs * Math.pow(2, attempt - 1));
        } else {
          logger.error(
            `Error fetching SSM parameter '${this.parameterName}'.`,
            { error }
          );
          throw error;
        }
      }
    }
    throw new Error(
      `Failed to fetch SSM parameter '${this.parameterName}' after ${this.maxRetries} attempts.`
    );
  }
}
