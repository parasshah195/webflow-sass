export type EditorFileState = 'new' | 'load';

import { writable, type Writable } from 'svelte/store';

/**
 * Defines whether the code file is new or existing
 * @default "new"
 */
export const FILE_STATE: Writable<EditorFileState> = writable('new');
