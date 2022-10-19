import Controls from "./Controls.js";
import Status from "./Status.js";
import Results from "./Results.js";

const {
  LoadTester,
  CsvGenerator,
  ModuleClearText,
  ModuleCryptoJsAes128,
  ModuleCryptoJsAes256,
  ModuleCryptoJsTripleDes,
  ModuleNodeCryptoAes128,
  ModuleNodeCryptoAes256,
  ModuleNodeCryptoChaCha20,
  ModuleTwoFish,
  ModuleBlowfish,
  ModuleRC5,
  ModuleWebCryptoAes128,
  ModuleWebCryptoAes256,
  ModuleXSalsa20NaCl,
  ModuleChaCha20,
  ModuleSM4CBC,
  EncryptionConfigManager
} = EncryptedIndexedDB;


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
    },
    extraShit: {
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
    }
  },
  keyPath: "id"
}

async function createConfigs() {
  return [
    // await EncryptionConfigManager.generateConfig(ModuleClearText.MODULE_ID),
    // await EncryptionConfigManager.generateConfig(ModuleCryptoJsAes256.MODULE_ID),
    // await EncryptionConfigManager.generateConfig(ModuleCryptoJsAes128.MODULE_ID),
    // await EncryptionConfigManager.generateConfig(ModuleNodeCryptoAes256.MODULE_ID),
    // await EncryptionConfigManager.generateConfig(ModuleNodeCryptoAes128.MODULE_ID),
    // await EncryptionConfigManager.generateConfig(ModuleTwoFish.MODULE_ID),
    // await EncryptionConfigManager.generateConfig(ModuleBlowfish.MODULE_ID),
    // await EncryptionConfigManager.generateConfig(ModuleCryptoJsTripleDes.MODULE_ID),
    // await EncryptionConfigManager.generateConfig(ModuleRC5.MODULE_ID),
    // await EncryptionConfigManager.generateConfig(ModuleXSalsa20NaCl.MODULE_ID),
    await EncryptionConfigManager.generateConfig(ModuleChaCha20.MODULE_ID),
    await EncryptionConfigManager.generateConfig(ModuleSM4CBC.MODULE_ID)
  ];
}

export default {
  data() {
    return {
      testingInProgress: false,
      currentModule: null,
      totalModuleCount: 10,
      modulesCompleted: 0,
      documentsCompleted: 0,
      documentsPerModule: 30,
      loadTester: null,
      results: [],
      resultsCsv: null
    }
  },
  mounted() {
  },
  methods: {
    async onStart() {
      const quiet = false;
      this.results = [];
      this.resultsCsv = null;
      this.modulesCompleted = 0;
      this.documentsCompleted = 0;

      const hooks = {
        testingStarted: (testConfigs) => {
          this.totalModuleCount = testConfigs.length;
        },
        moduleStarted: (module) => {
          this.currentModule = module;
          this.documentsCompleted = 0;
        },
        documentCompleted: (docCompleted) => {
          this.documentsCompleted = docCompleted;
        },
        moduleFinished: (result) => {
          this.modulesCompleted++;
          this.currentModule = null;
          this.results.push(result);
          this.documentsCompleted = 0;
        }
      }

      try {

        const encryptionConfigs = await createConfigs();

        const results = await LoadTester.testEncryptionConfigs(
            encryptionConfigs,
            this.documentsPerModule,
            objectStoreConfig,
            indexedDB,
            quiet,
            hooks);

        this.resultsCsv = CsvGenerator.generateCsv(results);
      } catch (e) {
        console.error(e);
      }
    },
    onCancel() {
      console.log("cancel");
      this.currentModule = null;
      this.testingInProgress = false;

    },
    onDownload() {
      const textFileAsBlob = new Blob([this.resultsCsv], {type: 'text/plain'});
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
        // downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
      }

      downloadLink.click();

      if (downloadLink.parentNode) {
        downloadLink.parentNode.removeChild(downloadLink);
      }
    }
  },
  components: {
    Controls,
    Status,
    Results
  },
  template: `
    <nav class="navbar navbar-dark bg-dark">
    <div class="container-fluid">
        <span class="navbar-brand">
          <i class="fa-brands fa-html5"></i>
          <i class="fa-solid fa-database"></i>
          <span>Encrypted IndexedDB Load Test Tool</span>
        </span>
      <div class="flex-fill"></div>
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link" target="_blank" href="https://github.com/mmacfadden/csc-807-project">
            <i class="fa-brands fa-github"></i>
            GitHub
          </a>
        </li>
      </ul>
    </div>
    </nav>
    <div id="main">
    <h1>Controls</h1>
    <controls
        @start="onStart"
        @cancel="onCancel"
        @download="onDownload"
        :in-progress="testingInProgress"
        :test-completed="this.resultsCsv"
    />
    <h1>Status</h1>
    <status
        :current-module="currentModule"
        :total-modules="totalModuleCount"
        :modules-completed="modulesCompleted"
        :documents-completed="documentsCompleted"
        :documents-per-module="documentsPerModule"
    />
    <h1>Results</h1>
    <results :in-progress-module="currentModule" :results="results"/>
    <textarea readonly="readonly" id="results-csv">{{resultsCsv || ""}}</textarea>
    </div>
  `
}