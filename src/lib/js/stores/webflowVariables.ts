import { readable, type Readable } from 'svelte/store';
import type { Completion } from '@codemirror/autocomplete';

export const WEBFLOW_VARS_AUTOCOMPLETE: Readable<Completion[] | null> = readable(
  getAllWebflowVars()
);

/**
 * Processes and returns all Webflow variables for autocompletion
 */
function getAllWebflowVars(): Completion[] | null {
  try {
    const autocompleteClassOptions: Completion[] = [];

    webflow.getDefaultVariableCollection().then((variableCollection) => {
      variableCollection?.getAllVariables().then((allVariables) => {
        allVariables.forEach((variable) => {
          let variableValue = '';

          // variable value processor
          variable.get().then((val) => {
            if (!val) return;
            if (typeof (val as SizeValue) === 'object') {
              variableValue = `${(val as SizeValue).value}${(val as SizeValue).unit}`;
            } else {
              variableValue = JSON.stringify(val) || '';
            }
          });

          variable.getName().then((variableName) => {
            if (!variableName) return;

            // Convert to a CSS Variable
            let sanitizedVar = variableName
              .replace(/[:;]+/g, ' ') // Replace one or more colon/semicolon to a space
              .replace(/-+/g, '-') // Convert multiple hyphens to a single one

              .replace(/\s*\/\s*/g, '--') // All `/`, with or without surrounded spaces, become `--`
              .replace(/(?<=\w)\s+(?=\w)/g, '-') // Spaces between valid characters become `-`
              .replace(/\s+/g, '') // Remove all remaining spaces

              .replace(/[^\w-]/g, '') // Remove all other unsupported characters (besides underscores and hyphens)
              .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens

              .toLowerCase();

            sanitizedVar = '--' + sanitizedVar;

            autocompleteClassOptions.push({
              label: `var(${sanitizedVar})`,
              type: 'variable',
              info: `Webflow Variable: \n${variableName} \n${variableValue}`
            });
          });
        });
      });
    });

    return autocompleteClassOptions;
  } catch (err) {
    console.error('Error trying to fetch/process Webflow variables for autocompletion', err);
    return null;
  }

  return null;
}
