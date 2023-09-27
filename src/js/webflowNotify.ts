export async function showWebflowError(message: string) {
  await webflow.notify({
    type: 'Error',
    message: message,
  });
}

export async function showWebflowInfoMessage(message: string) {
  await webflow.notify({
    type: 'Info',
    message: message,
  });
}

export async function showWebflowSuccessfulSave() {
  await webflow.notify({
    type: 'Success',
    message: 'Style updated successfully',
  });
}

export const ERROR_TEXTS = {
  sassDomNotFound:
    'Unable to locate current Sass DOM element. Creating a new one',
  sassDomCantUpdate:
    'Unable to update the current Sass element. Please copy the Sass code, and start a new file',
  invalidCodeElParent:
    'Select a proper element to nest the Sass and compiled CSS code',
  invalidCssParent:
    'Please select the correct parent element which has the .scss element, then save again',
  invalidSassElLoad: 'Please select the correct Sass code element to load',
  sassLoadNoCode: 'No Sass code found on this element',
  cssElNotFound: 'Unable to find the previous CSS Element',
  missingFilename: 'Please enter a filename',
};

export const INFO_TEXTS = {
  cssUpdateError: 'Unable to update CSS element. Creating a new one.',
};

export async function showCssElNotFoundErrors() {
  showWebflowError(ERROR_TEXTS.cssElNotFound);
  await showWebflowError(ERROR_TEXTS.invalidCssParent);
}
