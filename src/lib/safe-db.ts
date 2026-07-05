export async function safeDbRead<T>(fallback: T, query: () => Promise<T>): Promise<T> {
  try {
    return await query();
  } catch {
    return fallback;
  }
}

export type SafeDbReadResult<T> = {
  data: T;
  error?: string;
};

export function formatDbReadError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (
    message.includes("does not exist") ||
    message.includes("Unknown column") ||
    message.includes("P2022")
  ) {
    return "Reply Assistant database schema is out of date. Run npm run db:migrate:deploy, then refresh this page.";
  }

  if (
    message.includes("DATABASE_URL") ||
    message.includes("Can't reach database") ||
    message.includes("P1001")
  ) {
    return "Could not connect to the database. Check DATABASE_URL and try again.";
  }

  return "Could not load Reply Assistant data. Please try again later.";
}

export async function safeDbReadWithError<T>(
  fallback: T,
  query: () => Promise<T>,
): Promise<SafeDbReadResult<T>> {
  try {
    return { data: await query() };
  } catch (error) {
    return { data: fallback, error: formatDbReadError(error) };
  }
}
