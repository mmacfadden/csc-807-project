import {Persistence} from "../data/Persistence.js";
import {download_file} from "../util/file_utils.js";
import UploadModal from "../common/UploadModal.js";

export default {
  props: ["modules", "schemas", "config"],
  events: ["update"],
  components: {
    UploadModal
  },
  data() {
    const {
      serializationScheme,
      documentsPerTest,
      selectedModuleMap,
      selectedSchemaMap
    } = this.configToData(this.config);

    return {
      serializationScheme,
      documentsPerTest,
      selectedModuleMap,
      selectedSchemaMap
    };
  },
  methods: {
    configToData(config) {
      return {
        serializationScheme: config.preEncryptionSerialization,
        documentsPerTest: config.documentsPerTest,
        selectedModuleMap: new Map(this.modules.map(m => [m, config.selectedModules.includes(m)])),
        selectedSchemaMap: new Map(this.schemas.map(s => [s.name, config.selectedSchemas.find(o => o.name === s.name) !== undefined])),
      }
    },
    updateDocsPerTest(e) {
      try {
        this.documentsPerTest = Number(e.target.value);
        this.emitConfig();
      } catch (e) {

      }
    },
    selectModule(e) {
      this.selectedModuleMap.set(e.target.value, e.target.checked);
      this.emitConfig();
    },
    selectSchema(e) {
      this.selectedSchemaMap.set(e.target.value, e.target.checked);
      this.emitConfig();
    },
    setSerialization(e) {
      this.serializationScheme = e.target.value;
      this.emitConfig();
    },
    emitConfig() {
      const update = {
        preEncryptionSerialization: this.serializationScheme,
        documentsPerTest: this.documentsPerTest,
        selectedModules: this.modules.filter(m => this.selectedModuleMap.get(m)),
        selectedSchemas: this.schemas.filter(s => this.selectedSchemaMap.get(s.name))
      }
      this.$emit("update", update);
    },
    setDataFromConfig(config) {
      const {
        serializationScheme,
        documentsPerTest,
        selectedModuleMap,
        selectedSchemaMap
      } = this.configToData(config);
      this.serializationScheme = serializationScheme;
      this.documentsPerTest = documentsPerTest;
      this.selectedModuleMap = selectedModuleMap;
      this.selectedSchemaMap = selectedSchemaMap;
      this.emitConfig();
    },
    reset() {
      Persistence.reset();
      const config = Persistence.loadTestConfig();
      this.setDataFromConfig(config);
      this.emitConfig();
    },
    importRequest() {
      this.$refs.uploadModal.show();
    },
    onImportSettings(settings) {
      try {
        const config = JSON.parse(settings);
        Persistence.saveTestConfig(config);
        this.setDataFromConfig(config);
      } catch (e) {
        // TODO pop an error
      }
    },
    exportSettings() {
      const settings = Persistence.loadTestConfig();
      const settingsJson = JSON.stringify(settings, null, "  ");
      download_file("test-config.json", settingsJson);
    }
  },
  template: `
    <div class="accordion" id="accordionExample">
    <div class="accordion-item">
      <div class="accordion-header" id="headingOne">
        <button class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseOne"
                aria-expanded="false"
                aria-controls="collapseOne">
          Test Configuration
        </button>
      </div>
      <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne"
           data-bs-parent="#accordionExample">
        <div class="accordion-body">
          <div class="row mb-3">
            <div class="col-12 text-end">
              <button class="btn btn-primary icon" @click="exportSettings">
                <i class="fa-solid fa-download"/> Export Settings
              </button>
              <button class="btn btn-primary icon" @click="importRequest">
                <i class="fa-solid fa-upload"/> Import Settings
              </button>
              <button class="btn btn-danger icon" @click="reset">
                <i class="fa-solid fa-refresh"/> Reset Settings
              </button>
              <upload-modal
                  ref="uploadModal"
                  title="Import Test Results"
                  @upload="onImportSettings"
              >
                <div>
                  <p><strong>Warning: Importing test results will replace any current results.</strong></p>
                  <p>Select a file to import.</p>
                </div>
              </upload-modal>
            </div>
          </div>
          <div class="mb-3 row">
            <div class="col-6">
              <label for="docsPerTest" class="form-label">Objects Per Test</label>
              <input type="number"
                     class="form-control"
                     id="docsPerTest"
                     v-model="this.documentsPerTest"
                     @change="updateDocsPerTest"
              />
            </div>
            <div class="col-6">
              <label for="docsPerTest" class="form-label">Pre-Encryption Serialization Scheme</label>
              <select class="form-select" aria-label="Pre-Encryption Serialization Scheme" @change="setSerialization">
                <option value="bson" :selected="serializationScheme === 'bson'">BSON</option>
                <option value="msgpack" :selected="serializationScheme === 'msgpack'">Message Pack</option>
              </select>
            </div>
          </div>
          <div class="row">
            <div class="col-8">
              <div class="row">
                <h2>Encryption Modules</h2>
              </div>
              <div class="card">
                <div class="card-body row">
                  <div class="col-12 col-md-6 col-xl-4" v-for="module in modules">
                    <input class="form-check-input me-1" type="checkbox" :checked="this.selectedModuleMap.get(module)"
                           :value="module" @click="selectModule">
                    <label class="form-check-label" for="firstCheckbox">{{ module }}</label>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-4">
              <div class="row">
                <h2>Object Schemas</h2>
              </div>
              <div class="card">
                <div class="card-body row">
                  <div class="col-6" v-for="schema in schemas">
                    <input class="form-check-input me-1" type="checkbox"
                           :checked="this.selectedSchemaMap.get(schema.name)"
                           :value="schema.name" @click="selectSchema">
                    <label class="form-check-label" for="firstCheckbox">{{ schema.name }}</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    
`
}