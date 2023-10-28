/**
 * Codemirror autocomplete suggestion option
 * @example https://codemirror.net/examples/autocompletion/
 */

import type { Completion, CompletionContext } from '@codemirror/autocomplete';
import { sassLanguage } from '@codemirror/lang-sass';
import { syntaxTree } from '@codemirror/language';
import { get } from 'svelte/store';
import { WEBFLOW_CLASSES_AUTOCOMPLETE } from '$lib/js/stores/webflowClasses';

let webflowClassAutocomplete: Completion[] | null = null;

/**
 * Return Codemirror autocomplete options for all the Webflow Classes
 */

function webflowClassesAutocompletions(context: CompletionContext) {
  const classRegex = /\.[\w-]*/;

  const word = context.matchBefore(classRegex);
  if (!word) return null;
  if (word.from == word.to && !context.explicit) return null;

  return {
    // from: classNameBefore ? nodeBefore.from + classNameBefore.index : context.pos,
    from: word.from,
    options: webflowClassAutocomplete,
    validFor: classRegex
  };
}

export function registerWebflowClassCompletions() {
  webflowClassAutocomplete = get(WEBFLOW_CLASSES_AUTOCOMPLETE) || null;

  return sassLanguage.data.of({
    autocomplete: webflowClassesAutocompletions
  });
}
