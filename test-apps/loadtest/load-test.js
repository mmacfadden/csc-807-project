const {
  LoadTester,
  CsvGenerator,
  ModuleClearText,
  ModuleCryptoJsAes128,
  ModuleCryptoJsAes256,
  ModuleCryptoJsTripleDes,
  ModuleNodeCryptoAes128,
  ModuleNodeCryptoAes256,
  ModuleTwoFish,
  ModuleBlowfish,
  ModuleRC5,
  ModuleWebCryptoAes128,
  ModuleWebCryptoAes256,
  EncryptionConfigManager
} = EncryptedIndexedDB;

//
// UI Elements
//
const status = $("#status");
const progress = $("#progress");

const runButton = $("#run");
const downloadButton = $("#download");

const resultTable = $("#results-table");
const resultsTextArea = $("#results-csv");

// Tracks the current test's status item.
let inProgressRow = null;
let testCounter = 0;
let totalTests = 0;

// Used to be notified of test progress.
const hooks = {
  testingStarted(testConfigs) {
    totalTests = testConfigs.length;
    testCounter = 0;
  },
  testStarted(module) {
    testCounter++;
    status.html(`Test ${testCounter} of ${totalTests}:  ${module}`);
    const percent = Math.round((testCounter - 1) / totalTests * 100);
    const percentage = `${percent}%`;
    progress.html( percentage );
    progress.width(percentage );
    inProgressRow = $(`<tr><td>${module}</td><td colspan="7">In Progress</td></tr>`);
    resultTable.append(inProgressRow);
  },
  testFinished(result) {
    inProgressRow.remove();
    appendResultRow(result);
    inProgressRow = null;
  }
}


const objectStoreConfig = {
  documentSchema: {
    id: {
      chance: "guid"
    },
    firstName: {
      faker: "name.firstName"
    },
    lastName: {
      faker: "name.lastName"
    },
    accountNumber: {
      faker: "finance.account"
    },
    phoneNumber: {
      faker: "phone.phoneNumber"
    },
    biography: {
      faker: "lorem.paragraphs()"
    },
    age: {
      faker: "datatype.number()"
    },
    birthday: {
      faker: "datatype.datetime()"
    },
    arrayData: {
      faker: "datatype.array()"
    }
  },
  keyPath: "id"
}

async function createConfigs() {
  return [
    await EncryptionConfigManager.generateConfig(ModuleClearText.MODULE_ID),
    await EncryptionConfigManager.generateConfig(ModuleCryptoJsAes256.MODULE_ID),
    await EncryptionConfigManager.generateConfig(ModuleCryptoJsAes128.MODULE_ID),
    await EncryptionConfigManager.generateConfig(ModuleNodeCryptoAes256.MODULE_ID),
    await EncryptionConfigManager.generateConfig(ModuleNodeCryptoAes128.MODULE_ID),
    await EncryptionConfigManager.generateConfig(ModuleTwoFish.MODULE_ID),
    await EncryptionConfigManager.generateConfig(ModuleBlowfish.MODULE_ID),
    await EncryptionConfigManager.generateConfig(ModuleCryptoJsTripleDes.MODULE_ID),
    await EncryptionConfigManager.generateConfig(ModuleRC5.MODULE_ID),
  ];
}

/**
 * Executes the load test procedure.
 */
async function loadTest() {
  status.empty();
  resultTable.empty();
  resultsTextArea.val("");

  runButton.prop("disabled", true);
  downloadButton.prop("disabled", true);

  const operationCount = 30;
  const quiet = true;

  try {
    const encryptionConfigs = await createConfigs();

    const results = await LoadTester.testEncryptionConfigs(
        encryptionConfigs,
        operationCount,
        objectStoreConfig,
        indexedDB, quiet,
        hooks);

    const csvData = CsvGenerator.generateCsv(results);
    resultsTextArea.val(csvData);

    runButton.prop("disabled", false);
    downloadButton.prop("disabled", false);

    status.html(`All tests complete.`);
  } catch (e) {
    runButton.prop("disabled", false);
    downloadButton.prop("disabled", true);
    status.innerHTML = `Error (see console for more details): ${e.message}`;
    console.log(e);
  }
}


/**
 * Adds a new test result to the result table.
 */
function appendResultRow(result) {
  const row = $("<tr>");

  row.append($(`<td class="string">${result.moduleId}</td>`));
  row.append($(`<td class="number">${result.operationCount}</td>`));
  row.append($(`<td class="number">${round(result.totalTimeMs, 3)}</td>`));
  row.append($(`<td class="number">${round(result.averageReadTimeMs, 3)}</td>`));
  row.append($(`<td class="number">${round(result.averageWriteTimeMs, 3)}</td>`));
  row.append($(`<td class="number">${round(result.averageReadWriteTimeMs, 3)}</td>`));
  row.append($(`<td class="number">${round(result.avgReadThroughputKbps, 3)}</td>`));
  row.append($(`<td class="number">${round(result.avgWriteThroughputKbps, 3)}</td>`));

  resultTable.append(row);
}

/**
 * A helper method to round a number to a specific number of digits.
 */
function round(value, decimals) {
  const multiplier = Math.pow(10, decimals);
  return Math.round(multiplier * value) / multiplier;
}

/**
 * A helper method to download the contents of the results text
 * area as a CSV file.
 */
function downloadCsv() {
  const textFileAsBlob = new Blob([resultsTextArea.val()], {type: 'text/plain'});
  const downloadLink = document.createElement("a");
  downloadLink.download = "load-test-results.csv";
  downloadLink.innerHTML = "Download File";
  if (window.webkitURL != null) {
    // Chrome allows the link to be clicked
    // without actually adding it to the DOM.
    downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
  } else {
    // Firefox requires the link to be added to the DOM
    // before it can be clicked.
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
  }

  downloadLink.click();

  if (downloadLink.parentNode) {
    downloadLink.parentNode.removeChild(downloadLink);
  }
}