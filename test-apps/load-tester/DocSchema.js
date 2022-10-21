const {DocumentGenerator} = EncryptedIndexedDB;

import {parseSchema} from "./document_schemas/utils.js";

export default {
  props: ["documentSchemas"],
  events: ["update"],
  data() {
    return {
      selectedSchema: this.documentSchemas[0],
      schemaSourceValid: true,
      exampleEditor: null,
      sourceEditor: null,
    }
  },
  mounted() {
    this.sourceEditor = ace.edit("config-source", {
      mode: "ace/mode/javascript",
      theme: "ace/theme/solarized_dark",
      fontSize: "10pt",
      wrap: true
    });

    this.exampleEditor = ace.edit("example-document", {
      mode: "ace/mode/json",
      theme: "ace/theme/solarized_dark",
      fontSize: "10pt",
      wrap: true,
      readOnly: true,
    });

    this.sourceEditor.session.on('change', () => {
      // TODO debounce.
      const value = this.sourceEditor.getValue();
      this.selectedSchema.config = value;
      this.updateExampleDoc();
    });

    this.updateConfig();
    this.updateExampleDoc();

  },
  unmounted() {
    this.exampleEditor.destroy();
    this.sourceEditor.destroy();
  },
  methods: {
    updateConfig() {
      const schema = this.documentSchemas.find(s => s.name === this.selectedSchema.name)
      this.sourceEditor.session.setValue(schema.config);
    },
    updateExampleDoc() {
      try {
        const selected = parseSchema(this.selectedSchema);
        const doc = DocumentGenerator.generateDocument(selected.config.documentSchema);
        const selectedSchemaExample = JSON.stringify(doc, null, "  ");

        if (this.exampleEditor?.session) {
          this.exampleEditor.session.setValue(selectedSchemaExample);
        }

        this.exampleEditor.session.setMode("ace/mode/json");
      } catch (e) {
        this.exampleEditor.session.setMode("ace/mode/text");
        this.exampleEditor.session.setValue(`Schema Not Valid: ${e}`);
      }
    },
    onSelect(e) {
      const schemaName = e.target.selectedOptions[0].value;
      this.selectedSchema = this.documentSchemas.find(s => s.name === schemaName);
      console.log(this.selectedSchema)
      this.updateConfig();
      this.updateExampleDoc();
    }
  },
  template: `
    <div class="d-flex flex-fill flex-column">
    <h1>Document Schemas</h1>
    <div class="row flex-fill">
      <div class="col-auto d-flex">
        <div class="flex-fill d-flex flex-column">
          <label for="config-select" class="form-label">Select Config</label>
          <select @change="onSelect" class="form-select flex-fill" id="config-select" multiple
                  aria-label="multiple select example">
            <option v-for="schema in documentSchemas" :value="schema.name" :selected="schema === this.selectedSchema">
              {{ schema.name }}
            </option>
          </select>
        </div>
      </div>
      <div class="col d-flex flex-column">
        <div class="mb-3">
          <label for="config-name" class="form-label">Configuration Name</label>
          <input type="text" class="form-control" id="config-name" placeholder="Config Name" required
                 v-model="this.selectedSchema.name">
        </div>
        <div class="row flex-fill flex-row">
          <div class="col d-flex flex-column">
            <label for="config-source" class="form-label">Document Schema</label>
            <div id="config-source" class="flex-fill"></div>
          </div>
          <div class="col d-flex flex-column">
            <label for="example-document" class="form-label">Example Document</label>
            <div id="example-document" class="flex-fill"></div>
          </div>
        </div>

      </div>
    </div>
    </div>
  `
}