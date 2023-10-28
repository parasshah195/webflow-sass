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
  const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);

  // Get the text before the completion point
  const textBefore = context.state.sliceDoc(nodeBefore.from, context.pos);

  // Check if there is an existing class name selector (e.g., .classname) in the text
  const classNameBefore = /\.[\w-]*$/.exec(textBefore);

  if (!classNameBefore && !context.explicit) {
    return null;
  }

  return {
    from: classNameBefore ? nodeBefore.from + classNameBefore.index : context.pos,
    options: webflowClassAutocomplete,
    validFor: /^\.[\w-]*$/
  };
}

export function registerWebflowClassCompletions() {
  webflowClassAutocomplete = get(WEBFLOW_CLASSES_AUTOCOMPLETE) || null;

  return sassLanguage.data.of({
    autocomplete: webflowClassesAutocompletions
  });
}
