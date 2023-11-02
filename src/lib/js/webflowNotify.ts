export async function showWebflowError(message: string) {
  await webflow.notify({
    type: 'Error',
    message: message
  });
}

export async function showWebflowInfoMessage(message: string) {
  await webflow.notify({
    type: 'Info',
    message: message
  });
}

export async function showWebflowSuccessfulSave() {
  await webflow.notify({
    type: 'Success',
    message: 'Style updated'
  });
}

export const ERROR_TEXTS = {
  emptyFile: "Can't save an empty code file",
  sassDomNotFound:
    'Unable to locate current .scss file. Is it in a component? \n\nCheck Error notes for next steps',
  sassDomCantUpdate:
    'Unable to update the current .scss file. \n\nCopy this code and start a new code file',
  invalidCodeElParent:
    "This element can't nest .scss file. Select a valid parent element like `div`",
  invalidCssParent: 'Please select the parent element which has the .scss file, then save again',
  invalidSassElLoad: 'This does not look like a valid .scss file',
  sassLoadNoCode: 'No Sass code found on this element',
  cssElNotFound: 'Unable to find existing .css file',
  missingFilename: 'Please enter a filename'
};

export const INFO_TEXTS = {
  cssUpdateError: 'Unable to update .css file. Creating a new one.'
};

export async function showCssElNotFoundErrors() {
  showWebflowError(ERROR_TEXTS.cssElNotFound);
  await showWebflowError(ERROR_TEXTS.invalidCssParent);
}
