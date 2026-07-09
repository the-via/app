export const isCustomMenuCommandContent = (
  content: unknown,
): content is [string, number, number, ...number[]] =>
  Array.isArray(content) &&
  content.length >= 3 &&
  typeof content[0] === 'string' &&
  content.slice(1).every((value) => typeof value === 'number');
