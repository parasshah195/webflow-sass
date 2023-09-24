document.getElementById("lorem").onsubmit = async (event) => {
  event.preventDefault()
  const el = await webflow.getSelectedElement();
  if (el && el.textContent) {
    el.setTextContent(
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do " +
        "eiusmod tempor incididunt ut labore et dolore magna aliqua."
    )
    el.save()
  }
}
