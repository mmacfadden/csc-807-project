import {Persistence} from "./Persistence.js";
import {parseSchema} from "./document_schemas/utils.js";
import {formatSize} from "./utils.js";

const {DocumentGenerator, ObjectSizeCalculator} = EncryptedIndexedDB;

export default {
  props: [],
  events: [],
  data() {
    const documentSchemas = Persistence.loadSchemas();
    return {
      documentSchemas,
      selectedSchema: documentSchemas[0],
      schemaSourceValid: true,
      exampleEditor: null,
      sourceEditor: null,
      exampleMinBytes: -1,
      exampleMaxBytes: -1,
      exampleAvgBytes: -1,
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
    formatSize(size) {
      return formatSize(size);
    },
    updateConfig() {
      const schema = this.documentSchemas.find(s => s.name === this.selectedSchema.name)
      this.sourceEditor.session.setValue(schema.config);
    },
    updateExampleDoc() {
      try {
        const selected = parseSchema(this.selectedSchema);
        const docs = [];
        const numDocs = 10;
        let totalSize = 0;
        this.exampleMinBytes = Number.MAX_SAFE_INTEGER;
        this.exampleMaxBytes = 0;
        for (let i = 0; i < numDocs;i++) {
          const doc = DocumentGenerator.generateDocument(selected.config.documentSchema);
          docs.push(doc)
          const size = ObjectSizeCalculator.sizeOf(doc);
          this.exampleMinBytes = Math.min(size, this.exampleMinBytes);
          this.exampleMaxBytes = Math.max(size, this.exampleMaxBytes);
          totalSize += size;
        }

        this.exampleAvgBytes = totalSize /numDocs;

        const selectedSchemaExample = JSON.stringify(docs[0], null, "  ");

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
          <label for="config-select" class="form-label">Select Schema</label>
          <select @change="onSelect" class="form-select flex-fill" id="config-select" size="4" aria-label="Select Schema">
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
            <div class="example-document-stats d-flex flex-row">
              <span class="col">
                <span class="label">Average Size:</span>
                <span>{{formatSize(this.exampleAvgBytes)}}</span>
              </span>
              <span class="col">
                <span class="label">Minimum Size:</span>
                <span>{{formatSize(this.exampleMinBytes)}}</span>
              </span>
              <span class="col">
                <span class="label">Maximum Size</span>
                <span>{{formatSize(this.exampleMaxBytes)}}</span>
              </span>
            </div>
            
          </div>
        </div>

      </div>
    </div>
    </div>
  `
}