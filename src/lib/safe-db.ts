export async function safeDbRead<T>(fallback: T, query: () => Promise<T>): Promise<T> {
  try {
    return await query();
  } catch {
    return fallback;
  }
}
