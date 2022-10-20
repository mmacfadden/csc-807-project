import {ALL_MODULES, DEFAULT_DOCUMENT_SCHEMA} from "./all_configs.js";

export default {
  props: [],
  events: ["update"],
  data() {
    return {
      ALL_MODULES,
      documentSchema: DEFAULT_DOCUMENT_SCHEMA,
      selectedModules: ALL_MODULES.slice(0)
    }
  },
  methods: {
    select(e) {
      this.selectedModules = Array.from(e.target.selectedOptions).map(o => o.value);
      console.log(this.selectedModules);
    },
    emitConfig() {
      this.$emit("update", {
        selectedModules: this.selectedModules,
        documentSchema: this.documentSchema
      })
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
      <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
        <div class="accordion-body">
          <div class="d-flex">
            <div>
              <select @change="select" class="form-select" multiple aria-label="multiple select example" :size="ALL_MODULES.length" style="height: 100%;">
                <option v-for="module in ALL_MODULES" :value="module" selected>{{module}}</option>
              </select>
            </div>
            <div class="flex-fill">
              <select class="form-select" aria-label="Default select example">
                <option selected>Open this select menu</option>
                <option value="1">One</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
              </select>
              <textarea id="documentSchema">{{documentSchema}}</textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  `
}