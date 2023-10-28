import { readable, type Readable } from 'svelte/store';
import type { Completion } from '@codemirror/autocomplete';

export const WEBFLOW_CLASSES_AUTOCOMPLETE: Readable<Completion[] | null> = readable(
  getAllWebflowStyles()
);

// TODO: also include all webflow native classes

/**
 * Returns all Webflow classes reference as-is
 */
function getAllWebflowStyles(): Completion[] | null {
  try {
    const autocompleteClassOptions: Completion[] = [];

    webflow.getAllStyles().then((allStyles) => {
      allStyles.forEach((style) => {
        // Process each style
        const originalClassName = style.getName();
        const sanitizedClassName = originalClassName
          .replace(/[\s.]+/g, '-') // replaces spaces and periods with hyphens
          .replace(/[^\w-]/g, ''); // remove all other unsupported characters

        autocompleteClassOptions.push({
          label: '.' + sanitizedClassName,
          type: 'class',
          info: originalClassName
        });
      });
    });

    return autocompleteClassOptions;
  } catch (err) {
    console.error('Error trying to fetch/process Webflow styles for autocompletion', err);
    return null;
  }

  return null;
}
