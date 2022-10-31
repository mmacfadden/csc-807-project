export function download_file(filename, contents) {
  const textFileAsBlob = new Blob([contents], {type: 'text/plain'});
  const downloadLink = document.createElement("a");
  downloadLink.download = filename;
  downloadLink.innerHTML = "Download File";
  if (window.webkitURL != null) {
    // Chrome allows the link to be clicked
    // without actually adding it to the DOM.
    downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
  } else {
    // Firefox requires the link to be added to the DOM
    // before it can be clicked.
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    // downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
  }

  downloadLink.click();

  if (downloadLink.parentNode) {
    downloadLink.parentNode.removeChild(downloadLink);
  }
}