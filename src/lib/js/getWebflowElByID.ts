/**
 * Get Webflow element on a page from its ID
 * @param elID the element ID
 * @returns Reference to Webflow element if found, else null
 */
export async function getWebflowElByID(
  elID: string
): Promise<DOMElement | null> {
  const allElements = await webflow.getAllElements();
  const el = allElements.find((el) => el.id === elID) as DOMElement | null;

  return el;
}
