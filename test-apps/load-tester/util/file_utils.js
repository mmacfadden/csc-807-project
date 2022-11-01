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

export function handle_single_file_upload(element) {
    return new Promise((resolve, reject) => {
      element.onchange = (evt)  => {

        const reader = new FileReader();

        reader.onload = (evt) => {
          if (evt.target.readyState !== 2) {
            return;
          }

          if (evt.target.error) {
            reject(evt.target.error);
          }

          const content = evt.target.result;
          resolve(content);
        };

        reader.readAsText(evt.target.files[0]);
      }
    });
}