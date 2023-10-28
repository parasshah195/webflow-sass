/**
 * Autocomplete Webflow Variables
 */

import type { Completion, CompletionContext } from '@codemirror/autocomplete';
import { sassLanguage } from '@codemirror/lang-sass';
import { get } from 'svelte/store';
import { WEBFLOW_VARS_AUTOCOMPLETE } from '$lib/js/stores/webflowVariables';

let webflowVarsAutocomplete: Completion[] | null = null;

/**
 * Return Codemirror autocomplete options for all the Webflow Classes
 */

function webflowVarsAutocompletions(context: CompletionContext) {
  const word = context.matchBefore(/var(\()?[\w-]*(\))?/);
  if (!word) return null;
  if (word.from == word.to && !context.explicit) return null;

  return {
    from: word.from,
    options: webflowVarsAutocomplete,
    validFor: /var\([\w-]*\)$/
    // validFor: /var(\()?[\w-]*(\))?/
  };
}

export function registerWebflowVarsCompletions() {
  webflowVarsAutocomplete = get(WEBFLOW_VARS_AUTOCOMPLETE) || null;

  return sassLanguage.data.of({
    autocomplete: webflowVarsAutocompletions
  });
}
