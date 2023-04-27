
export class TimeoutError extends Error {
  public override name = 'Timeout';
  public override message = 'Promise interrupted by timeout';
}

export async function timeout(promise: Promise<void>, timeoutMs: number): Promise<void> {
  let t: NodeJS.Timeout;

  return Promise.race([
    promise,
    new Promise((_, reject) => {
      t = setTimeout(() => {
        reject(new TimeoutError());
      }, timeoutMs);
    }),
  ]).then(
    () => {
      clearTimeout(t);
    },
    (err) => {
      clearTimeout(t);
      throw err;
    },
  );
}
