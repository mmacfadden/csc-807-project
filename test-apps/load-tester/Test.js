import Controls from "./TestControls.js";
import Status from "./TestStatus.js";
import Results from "./TestResults.js";
import Config from "./TestConfig.js";

import ALL_MODULES from "./modules.js";

import {parseSchema} from "./document_schemas/utils.js";
import {Persistence} from "./Persistence.js";

const {
  LoadTester,
  CsvGenerator,
  EncryptionConfigManager
} = EncryptedIndexedDB;

export default {
  data() {
    const config = Persistence.loadTestConfig();
    return {
      ALL_MODULES,
      documentSchemas: Persistence.loadSchemas(),
      testingInProgress: false,
      currentModule: null,
      currentSchema: null,
      totalTestCount: 10,
      testsCompleted: 0,
      documentsCompleted: 0,
      documentsPerTest: 30,
      loadTester: null,
      results: [],
      resultsCsv: null,
      selectedModules: config.selectedModules,
      selectedSchemas: config.selectedSchemas
    }
  },
  mounted() {
  },
  methods: {
    configUpdated(config) {
      this.selectedModules = config.selectedModules;
      this.selectedSchemas = config.selectedDocSchemas;
      Persistence.saveTestConfig(config);
    },
    async onStart() {
      const quiet = true;
      this.results = [];
      this.resultsCsv = null;
      this.testsCompleted = 0;
      this.documentsCompleted = 0;

      const hooks = {
        testingStarted: (testConfigs) => {
          this.totalTestCount = testConfigs.length;
        },
        testStarted: (module, schema) => {
          this.currentModule = module;
          this.currentSchema = schema;
          this.documentsCompleted = 0;
        },
        documentCompleted: (docCompleted) => {
          this.documentsCompleted = docCompleted;
        },
        testFinished: (result) => {
          this.testsCompleted++;
          this.currentModule = null;
          this.results.push(result);
          this.documentsCompleted = 0;
        }
      }

      try {
        const encryptionConfigs = [];
        for (let i = 0; i < this.selectedModules.length; i++) {
          const moduleConfig = await EncryptionConfigManager.generateConfig(this.selectedModules[i]);
          encryptionConfigs.push(moduleConfig);
        }

        const results = await LoadTester.testEncryptionConfigs(
            encryptionConfigs,
            this.selectedSchemas.map(parseSchema).map(s => {
                  return {...(s.config), name: s.name}
                }
            ),
            this.documentsPerTest,
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
        :selectedModules="selectedModules"
        :schemas="documentSchemas"
        :selectedSchemas="selectedSchemas"
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
        :current-schema="currentSchema"
        :total-tests="totalTestCount"
        :tests-completed="testsCompleted"
        :documents-completed="documentsCompleted"
        :documents-per-test="documentsPerTest"
    />
    <h1>Results</h1>
    <results :in-progress-module="currentModule" :in-progress-schema="currentSchema" :results="results"/>
    <textarea readonly="readonly" id="results-csv">{{resultsCsv || ""}}</textarea>
  `
}