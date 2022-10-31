export default {
  props: ["modules", "schemas", "config"],
  events: ["update"],
  data() {
    return {
      serializationScheme: this.config.preEncryptionSerialization,
      documentsPerTest: this.config.documentsPerTest,
      selectedModuleMap: new Map(this.modules.map(m => [m, this.config.selectedModules.includes(m)])),
      selectedSchemaMap: new Map(this.schemas.map(s => [s.name, this.config.selectedSchemas.find(o => o.name === s.name) !== undefined])),
    }
  },
  methods: {
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
          <div class="mb-3 row">
            <div class="col-6">
              <label for="docsPerTest" class="form-label">Document Reads/Writes Per Test</label>
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
                <option value="json" :selected="serializationScheme === 'json'">JSON</option>
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
                <h2>Document Schemas</h2>
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