import type { Widget } from '@/types';

interface SavedTemplate {
  id: string;
  name: string;
  description: string;
  widgets: Widget[];
  timestamp: number;
}

const TEMPLATES_STORAGE_KEY = 'zento-saved-templates';

/**
 * Save a widget combination as a reusable template
 * @param name Template name
 * @param description Template description
 * @param widgets Widgets to save
 * @returns The saved template
 */
export function saveTemplate(
  name: string,
  description: string,
  widgets: Widget[]
): SavedTemplate {
  const template: SavedTemplate = {
    id: crypto.randomUUID(),
    name,
    description,
    widgets: JSON.parse(JSON.stringify(widgets)), // Deep copy
    timestamp: Date.now(),
  };

  const templates = getSavedTemplates();
  templates.push(template);
  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));

  return template;
}

/**
 * Get all saved templates
 * @returns Array of saved templates
 */
export function getSavedTemplates(): SavedTemplate[] {
  try {
    const data = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load templates:', error);
    return [];
  }
}

/**
 * Get a specific template by ID
 * @param id Template ID
 * @returns The template or undefined
 */
export function getTemplate(id: string): SavedTemplate | undefined {
  const templates = getSavedTemplates();
  return templates.find((t) => t.id === id);
}

/**
 * Delete a saved template
 * @param id Template ID
 */
export function deleteTemplate(id: string): void {
  const templates = getSavedTemplates();
  const filtered = templates.filter((t) => t.id !== id);
  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Update a template
 * @param id Template ID
 * @param updates Partial updates
 */
export function updateTemplate(
  id: string,
  updates: Partial<Omit<SavedTemplate, 'id'>>
): SavedTemplate | undefined {
  const templates = getSavedTemplates();
  const index = templates.findIndex((t) => t.id === id);

  if (index === -1) return undefined;

  const updated = {
    ...templates[index],
    ...updates,
  };

  templates[index] = updated;
  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));

  return updated;
}

/**
 * Duplicate a template
 * @param id Template ID
 * @returns The duplicated template
 */
export function duplicateTemplate(id: string): SavedTemplate | undefined {
  const template = getTemplate(id);
  if (!template) return undefined;

  const copy: SavedTemplate = {
    ...template,
    id: crypto.randomUUID(),
    name: `${template.name} (copy)`,
    timestamp: Date.now(),
    widgets: JSON.parse(JSON.stringify(template.widgets)),
  };

  const templates = getSavedTemplates();
  templates.push(copy);
  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));

  return copy;
}

/**
 * Search templates by name
 * @param query Search query
 * @returns Matching templates
 */
export function searchTemplates(query: string): SavedTemplate[] {
  const templates = getSavedTemplates();
  const lower = query.toLowerCase();

  return templates.filter(
    (t) =>
      t.name.toLowerCase().includes(lower) ||
      t.description.toLowerCase().includes(lower)
  );
}

/**
 * Get templates sorted by creation date (newest first)
 * @returns Sorted templates
 */
export function getTemplatesSorted(): SavedTemplate[] {
  const templates = getSavedTemplates();
  return [...templates].sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Export templates as JSON
 * @returns JSON string of all templates
 */
export function exportTemplates(): string {
  const templates = getSavedTemplates();
  return JSON.stringify(templates, null, 2);
}

/**
 * Import templates from JSON
 * @param json JSON string of templates
 */
export function importTemplates(json: string): void {
  try {
    const templates: SavedTemplate[] = JSON.parse(json);

    // Validate structure
    if (!Array.isArray(templates)) {
      throw new Error('Invalid template format');
    }

    const existing = getSavedTemplates();
    const merged = [...existing, ...templates];
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(merged));
  } catch (error) {
    console.error('Failed to import templates:', error);
    throw new Error('Invalid template file');
  }
}

/**
 * Clears all saved templates from local storage
 * 
 * **WARNING:** This action cannot be undone. All saved templates will be permanently deleted.
 * Use with caution and consider prompting the user for confirmation before calling.
 * 
 * @returns void
 * @example
 * // Prompt user for confirmation first
 * if (confirm('Delete all templates? This cannot be undone.')) {
 *   clearAllTemplates();
 * }
 */
export function clearAllTemplates(): void {
  localStorage.removeItem(TEMPLATES_STORAGE_KEY);
}
