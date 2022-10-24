export default {
  props: ["modules", "schemas", "selectedModules", "selectedSchemas"],
  events: ["update"],
  data() {
    return {
      selectedModuleMap: new Map(this.modules.map(m => [m, this.selectedModules.includes(m)])),
      selectedSchemaMap: new Map(this.schemas.map(s => [s.name, this.selectedSchemas.find(o => o.name === s.name) !== undefined])),
    }
  },
  methods: {
    selectModule(e) {
      this.selectedModuleMap.set(e.target.value, e.target.checked);
      this.emitConfig();
    },
    selectSchema(e) {
      this.selectedSchemaMap.set(e.target.value, e.target.checked);
      this.emitConfig();
    },
    emitConfig() {
      const update = {
        selectedModules: this.modules.filter(m => this.selectedModuleMap.get(m)),
        selectedSchemas: this.schemas.filter(s => this.selectedSchemaMap.get(s.name))
      }
      this.$emit("update", update);
    }
  },
  template: `
    <div class="accordion" id="accordionExample">
    <div class="accordion-item">
      <h2 class="accordion-header" id="headingOne">
        <button class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseOne"
                aria-expanded="false"
                aria-controls="collapseOne">
          Test Configuration
        </button>
      </h2>
      <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne"
           data-bs-parent="#accordionExample">
        <div class="accordion-body">
          <div class="row">
            <div class="col-6">
              <div class="row">
                <h2>Encryption Modules</h2>
              </div>
              <div class="card">
                <div class="card-body row">
                  <div class="col-4" v-for="module in modules">
                    <input class="form-check-input me-1" type="checkbox" :checked="this.selectedModuleMap.get(module)"
                           :value="module" @click="selectModule">
                    <label class="form-check-label" for="firstCheckbox">{{ module }}</label>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="row">
                <h2>Document Schemas</h2>
              </div>
              <div class="card">
                <div class="card-body row">
                  <div class="row">
                    <div class="col-4" v-for="schema in schemas">
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
    </div>
  `
}