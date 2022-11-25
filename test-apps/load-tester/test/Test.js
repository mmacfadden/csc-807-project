import Controls from "./TestControls.js";
import Status from "./TestStatus.js";
import Results from "./TestResults.js";
import Analysis from "./TestResultAnalysis.js";
import Config from "./TestConfig.js";
import UploadModal from "../common/UploadModal.js";

import ALL_MODULES from "../data/modules.js";

import {parseSchema} from "../data/document_schemas/utils.js";
import {Persistence} from "../data/Persistence.js";
import {download_file} from "../util/file_utils.js";

const {
  LoadTester,
  CsvGenerator,
  EncryptionConfigStorage
} = EncryptedIndexedDB;

export default {
  data() {
    const testConfig = Persistence.loadTestConfig();
    const documentSchemas = Persistence.loadSchemas();

    let results = Persistence.loadResults();
    let testingFinished = false;
    if (results !== null) {
      testingFinished = true;
    } else {
      results = [];
    }

    return {
      ALL_MODULES,
      documentSchemas,
      testingInProgress: false,
      currentModule: null,
      currentSchema: null,
      totalTestCount: 10,
      testsCompleted: 0,
      testingFinished,
      documentsCompleted: 0,
      loadTester: null,
      results,
      resultsCsv: null,
      testConfig
    }
  },
  methods: {
    configUpdated(config) {
      this.testConfig = config;
      Persistence.saveTestConfig(config);
    },
    async onStart() {
      this.results = [];
      this.resultsCsv = null;
      this.testsCompleted = 0;
      this.documentsCompleted = 0;

      const hooks = {
        testingStarted: (testConfigs) => {
          this.testingFinished = false;
          this.testingInProgress = true;
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
        },
        testingFinished: (results) => {
          this.testingFinished = true;
          this.testingInProgress = false;
          this.testsCompleted = 0;
          this.currentModule = null;
          this.currentSchema = null;
          Persistence.saveResults(results);
        },
      }

      const moduleParams = {
        serializationScheme: this.testConfig.preEncryptionSerialization
      }

      try {
        const encryptionConfigs = [];
        for (let i = 0; i < this.testConfig.selectedModules.length; i++) {
          const moduleConfig = await EncryptionConfigStorage.generateDefaultConfig(this.testConfig.selectedModules[i], moduleParams);
          encryptionConfigs.push(moduleConfig);
        }

        const schemas = this.testConfig.selectedSchemas.map(parseSchema).map(s => {
              const {name, keyPath, schema} = s;
              return {name, keyPath, schema}
            }
        );

        const results = await LoadTester.testEncryptionConfigs(
            encryptionConfigs,
            schemas,
            this.testConfig.documentsPerTest,
            indexedDB,
            hooks);

        this.resultsCsv = CsvGenerator.generateCsv(results);
      } catch (e) {
        console.error(e);
      }
    },
    onCancel() {
      // TODO implement cancel. Need to somehow implement this in the load tester also.
      console.log("cancel");
      this.currentModule = null;
      this.testingInProgress = false;

    },
    onClearResults() {
      this.results = [];
      this.testingFinished = false;
      this.testingInProgress = false;
      Persistence.saveResults([]);
    },
    onDownloadCsv() {
      download_file( "load-test-results.csv", this.resultsCsv);
    },
    onDownloadJson() {
      const json = JSON.stringify(this.results, null, "  ");
      download_file( "load-test-results.json", json);
    },
    onUploadJsonRequest() {
      this.$refs.uploadModal.show();
    },
    onUploadJson(file) {
      try {
        this.results = JSON.parse(file);
        this.testingInProgress = false;
        this.testingFinished = true;
      } catch (e) {
        // TODO pop toast.
        console.log(e);
      }
    }
  },
  components: {
    Controls,
    Status,
    Results,
    Config,
    Analysis,
    UploadModal
  },
  template: `
    <h1><i class="fa-solid fa-stopwatch"></i> Test</h1>
    <config
        :modules="ALL_MODULES"
        :schemas="documentSchemas"
        :config="testConfig"
        @update="configUpdated"
    />
    <h2>Controls</h2>
    <controls
        @start="onStart"
        @cancel="onCancel"
        @download-csv="onDownloadCsv"
        @download-json="onDownloadJson"
        @upload-results="onUploadJsonRequest"
        @clear="onClearResults"
        :in-progress="testingInProgress"
        :test-completed="this.testingFinished"
    />
    <h2>Status</h2>
    <status
        :current-module="currentModule"
        :current-schema="currentSchema"
        :total-tests="totalTestCount"
        :tests-completed="testsCompleted"
        :documents-completed="documentsCompleted"
        :documents-per-test="testConfig.documentsPerTest"
    />
    <h2>Results</h2>
    <ul class="nav nav-tabs" id="myTab" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link active"
                id="tests-tab"
                data-bs-toggle="tab"
                data-bs-target="#tests-tab-pane"
                type="button"
                role="tab"
                aria-controls="tests-tab-pane"
                aria-selected="true">Tests
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link"
                id="analysis-tab"
                data-bs-toggle="tab"
                data-bs-target="#analysis-tab-pane"
                type="button"
                role="tab"
                aria-controls="analysis-tab-pane"
                aria-selected="false">Analysis
        </button>
      </li>
    </ul>
    <div class="tab-content" id="result-tabs">
    <div class="tab-pane fade show active" id="tests-tab-pane" role="tabpanel" aria-labelledby="tests-tab" tabindex="0">
      <results :in-progress-module="currentModule" :in-progress-schema="currentSchema" :results="results"/>
    </div>
    <div class="tab-pane fade" id="analysis-tab-pane" role="tabpanel" aria-labelledby="analysis-tab" tabindex="0">
      <analysis v-if="testingFinished" :results="results"/>
      <div v-else-if="testingInProgress">
        <div class="text-center">
          <div><strong>Results will be presented when testing completes.</strong></div>
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
      <div v-else>Run tests to see the analysis.</div>
    </div>
    </div>
    <upload-modal
        ref="uploadModal"
        title="Import Test Results"
        @upload="onUploadJson"
    >
    <div>
      <p><strong>Warning: Importing test results will replace any current results.</strong></p>
      <p>Select a file to import.</p>
    </div>
    </upload-modal>
    <textarea readonly="readonly" id="results-csv">{{resultsCsv || ""}}</textarea>
`
}