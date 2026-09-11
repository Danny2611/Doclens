export async function withStartupTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  dependency: string,
): Promise<T> {
  let timeout: NodeJS.Timeout | undefined;

  try {
    return await Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          reject(new Error(`${dependency} did not respond within ${timeoutMs}ms.`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}
