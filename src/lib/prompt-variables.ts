const VARIABLE_PATTERN = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;

export function extractPromptVariables(content: string): string[] {
  const seen = new Set<string>();
  const variables: string[] = [];

  for (const match of content.matchAll(VARIABLE_PATTERN)) {
    const name = match[1];
    if (!seen.has(name)) {
      seen.add(name);
      variables.push(name);
    }
  }

  return variables;
}

export function fillPromptVariables(
  content: string,
  values: Record<string, string>,
): string {
  return content.replace(VARIABLE_PATTERN, (_, name: string) => {
    const value = values[name]?.trim();
    return value || `{{${name}}}`;
  });
}
