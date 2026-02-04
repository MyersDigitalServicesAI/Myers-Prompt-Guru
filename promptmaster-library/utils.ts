import { VariableMap } from './types';

/**
 * Extracts unique placeholders from a list of strings.
 * Matches patterns like [Topic], [Audience], etc.
 */
export const extractVariables = (texts: string[]): string[] => {
  const variableSet = new Set<string>();
  // Regex to find content inside square brackets, e.g., [Topic]
  const regex = /\[(.*?)\]/g;

  texts.forEach(text => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      // match[1] is the content inside brackets
      if (match[1].trim()) {
        variableSet.add(match[1].trim());
      }
    }
  });

  return Array.from(variableSet).sort();
};

/**
 * Replaces placeholders in a template with values from the map.
 * e.g., "Hello [Name]" -> "Hello World"
 */
export const interpolateTemplate = (template: string, variables: VariableMap): string => {
  return template.replace(/\[(.*?)\]/g, (match, p1) => {
    const key = p1.trim();
    // If we have a value, use it. Otherwise keep the original placeholder for clarity.
    return variables[key] ? variables[key] : match;
  });
};

/**
 * Determines if a template is "fully filled" (optional helper, not strictly used but good for UI state)
 */
export const isFullyFilled = (template: string, variables: VariableMap): boolean => {
  const required = extractVariables([template]);
  return required.every(key => !!variables[key]);
};