import Controls from "./TestControls.js";
import Status from "./TestStatus.js";
import Results from "./TestResults.js";
import Config from "./TestConfig.js";

import ALL_MODULES from "./modules.js";

import {parseSchema} from "./document_schemas/utils.js";

const {
  LoadTester,
  CsvGenerator,
  EncryptionConfigManager
} = EncryptedIndexedDB;

export default {
  props: ["documentSchemas"],
  data() {
    return {
      ALL_MODULES,
      testingInProgress: false,
      currentModule: null,
      totalModuleCount: 10,
      modulesCompleted: 0,
      documentsCompleted: 0,
      documentsPerModule: 30,
      loadTester: null,
      results: [],
      resultsCsv: null,
      testConfig: {
        selectedModules: ALL_MODULES,
        selectedSchemas: this.documentSchemas.slice(0)
      }
    }
  },
  mounted() {
  },
  methods: {
    configUpdated(config) {
      console.log(config)
    },
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
        const encryptionConfigs = [];
        for (let i = 0; i < this.testConfig.selectedModules.length; i++) {
          const moduleConfig = await EncryptionConfigManager.generateConfig(this.testConfig.selectedModules[i]);
          encryptionConfigs.push(moduleConfig);
        }

        const results = await LoadTester.testEncryptionConfigs(
            encryptionConfigs,
            this.testConfig.selectedSchemas.map(parseSchema).map(s => s.config),
            this.documentsPerModule,
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
    Results,
    Config
  },
  template: `
    <config 
        :modules="ALL_MODULES"
        :schemas="documentSchemas"
        @update="configUpdated"
    />
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
  `
}