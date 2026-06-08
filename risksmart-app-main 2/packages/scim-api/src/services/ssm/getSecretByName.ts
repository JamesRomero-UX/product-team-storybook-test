import { GetParameterCommand, ParameterNotFound } from '@aws-sdk/client-ssm';
import { ssmClient } from 'src/utils/ssm-client';

export const getSecretByName = async (secretName: string) => {
  try {
    const result = await ssmClient.send(
      new GetParameterCommand({
        Name: secretName,
        WithDecryption: true,
      })
    );

    if (!result.Parameter?.Value) {
      console.info(
        `Parameter not found in parameter store with key: ${secretName}`
      );

      return null;
    }

    return result.Parameter?.Value;
  } catch (error) {
    if (error instanceof ParameterNotFound) {
      console.info(
        `Parameter not found in parameter store with key: ${secretName}`
      );

      return null;
    }
    console.error(
      `Error getting parameter from parameter store with key: ${secretName}`,
      error
    );
    throw error;
  }
};
