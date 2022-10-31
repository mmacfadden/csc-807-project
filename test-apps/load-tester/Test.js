import Controls from "./TestControls.js";
import Status from "./TestStatus.js";
import Results from "./TestResults.js";
import Analysis from "./TestResultAnalysis.js";
import Config from "./TestConfig.js";

import ALL_MODULES from "./modules.js";

import {parseSchema} from "./document_schemas/utils.js";
import {Persistence} from "./Persistence.js";
import {download_file} from "./download_utils.js";

const {
  LoadTester,
  CsvGenerator,
  EncryptionConfigManager
} = EncryptedIndexedDB;

export default {
  data() {
    const testConfig = Persistence.loadTestConfig();
    return {
      ALL_MODULES,
      documentSchemas: Persistence.loadSchemas(),
      testingInProgress: false,
      currentModule: null,
      currentSchema: null,
      totalTestCount: 10,
      testsCompleted: 0,
      testingFinished: false,
      documentsCompleted: 0,
      loadTester: null,
      results: [],
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
      const quiet = true;
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
        },
      }

      const moduleParams = {
        serializationScheme: this.testConfig.preEncryptionSerialization
      }

      try {
        const encryptionConfigs = [];
        for (let i = 0; i < this.testConfig.selectedModules.length; i++) {
          const moduleConfig = await EncryptionConfigManager.generateConfig(this.testConfig.selectedModules[i], moduleParams);
          encryptionConfigs.push(moduleConfig);
        }

        const schemas = this.testConfig.selectedSchemas.map(parseSchema).map(s => {
              return {...(s.config), name: s.name}
            }
        );

        const results = await LoadTester.testEncryptionConfigs(
            encryptionConfigs,
            schemas,
            this.testConfig.documentsPerTest,
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
      download_file( "load-test-results.csv", this.resultsCsv);
    }
  },
  components: {
    Controls,
    Status,
    Results,
    Config,
    Analysis
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
        @download="onDownload"
        :in-progress="testingInProgress"
        :test-completed="this.resultsCsv"
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
                aria-selected="true">Tests</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" 
                id="analysis-tab" 
                data-bs-toggle="tab"
                data-bs-target="#analysis-tab-pane"
                type="button" 
                role="tab" 
                aria-controls="analysis-tab-pane" 
                aria-selected="false">Analysis</button>
      </li>
    </ul>
    <div class="tab-content" id="result-tabs">
      <div class="tab-pane fade show active" id="tests-tab-pane" role="tabpanel" aria-labelledby="tests-tab" tabindex="0">
        <results :in-progress-module="currentModule" :in-progress-schema="currentSchema" :results="results"/>
      </div>
      <div class="tab-pane fade" id="analysis-tab-pane" role="tabpanel" aria-labelledby="analysis-tab" tabindex="0">
        <analysis v-if="testingFinished" :results="results" />
        <div v-else-if="testingInProgress">Analysis will be presented when testing is complete.</div>
        <div v-else>Run tests to see the analysis.</div>
      </div>
    </div>
    
    <textarea readonly="readonly" id="results-csv">{{resultsCsv || ""}}</textarea>
  `
}