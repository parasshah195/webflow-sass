export async function showWebflowError(message: string) {
  await webflow.notify({
    type: 'Error',
    message: message,
  });
}

export async function showWebflowSuccessfulSave() {
  await webflow.notify({
    type: 'Success',
    message: 'Style updated successfully'
  });
}