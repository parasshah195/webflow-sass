interface ExistingCSSEl {
  domID: string;
}

export const CSS_DOM_ID_ATTRIBUTE = 'data-css-dom-id';

/**
 * @param currentEl reference to current selected webflow element
 * @returns If CSS DOM ID attribute is present on the Sass element, then returns its value in an object, else, `false`
 */
export function getCssDomId(currentEl: AnyElement): ExistingCSSEl | false {
  if ('DOM' !== currentEl.type) {
    return false;
  } else {
    const cssDomId = currentEl.getAttribute(CSS_DOM_ID_ATTRIBUTE) || '';

    if ('' === cssDomId) {
      return false;
    }

    return {
      domID: cssDomId,
    };
  }
}
