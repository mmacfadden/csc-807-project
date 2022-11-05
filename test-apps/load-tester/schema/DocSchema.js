import {Persistence} from "../data/Persistence.js";
import {parseSchema} from "../data/document_schemas/utils.js";
import {formatSize} from "../util/utils.js";
import {download_file} from "../util/file_utils.js";
import UploadSchemaModal from "../common/UploadModal.js";
import SingleValueModal from "../common/SingleValueModal.js";
import ConfirmModal from "../common/ConfirmModal.js";

const {DocumentGenerator, ObjectSizeCalculator} = EncryptedIndexedDB;

export default {
  props: [],
  events: [],
  components: {
    UploadSchemaModal,
    SingleValueModal,
    ConfirmModal
  },
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
      exampleAvgBytes: -1
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
      this.selectedSchema.schema = this.sourceEditor.getValue();
      Persistence.saveSchemas(this.documentSchemas);
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
    onDeleteRequest() {
      this.$refs.deleteModal.show();
    },
    deleteConfirmed() {
      const index = this.documentSchemas.indexOf(this.selectedSchema);
      const newIndex = Math.max(0, index - 1);
      this.documentSchemas.splice(index, 1);
      if (this.documentSchemas.length > 0) {
        this.selectedSchema = this.documentSchemas[newIndex];
      } else {
        this.selectedSchema = null;
      }
      Persistence.saveSchemas(this.documentSchemas);
    },
    onUploadRequest() {
      this.$refs.uploadModal.show();
    },
    onUpload(data) {
      try {
        const schemas = JSON.parse(data);
        this.documentSchemas = schemas;
        this.selectedSchema = schemas[0];
        Persistence.saveSchemas(schemas);

        this.updateConfig();
        this.updateExampleDoc();
      } catch (e) {
        console.error(e);
        // TODO popup an toast.
      }
    },
    onDownloadSchemas() {
      const schemas = Persistence.loadSchemas();
      download_file("document_schemas.json", JSON.stringify(schemas, null, "  "));
    },
    onCreateSchemaRequest() {
      this.$refs.createSchemaModal.show();
    },
    onChangeSchemaNameRequest() {
      this.$refs.editSchemaNameModal.show(this.selectedSchema.name);
    },
    schemaNameValidator(name) {
      if (this.documentSchemas.find(s => s.name === name)) {
        return "A schema with the specified name already exists.";
      }
    },
    createSchema(name) {
      const newSchema = {
        name,
        enabledByDefault: false,
        keyPath: "id",
        schema: `{\n"id": {\n  "faker": "datatype.number()"\n  }\n}`
      };
      this.documentSchemas.push(newSchema);
      this.selectedSchema = newSchema;

      Persistence.saveSchemas(this.documentSchemas);

      this.updateConfig();
      this.updateExampleDoc();
    },
    changeSchemaName(newName) {
      this.selectedSchema.name = newName;
      Persistence.saveSchemas(this.documentSchemas);
    },
    formatSize(size) {
      return formatSize(size);
    },
    updateEnabledByDefault(e) {
      this.selectedSchema.enabledByDefault = e.target.value === "yes";
    },
    updateConfig() {
      const config = this.documentSchemas.find(s => s.name === this.selectedSchema.name)
      this.sourceEditor.session.setValue(config.schema.trim());
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
          const doc = DocumentGenerator.generateDocument(selected.schema);
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
    <h1><i class="fa-solid fa-file-code"></i> Object Schemas</h1>
    <div class="row flex-fill">
      <div class="col-auto d-flex">
        <div class="flex-fill d-flex flex-column">
          <label for="config-select" class="form-label">Object Schemas</label>
          <select @change="onSelect" class="form-select flex-fill" id="config-select" size="4" aria-label="Select Schema">
            <option v-for="schema in documentSchemas" :value="schema.name" :selected="schema === this.selectedSchema">
              {{ schema.name }}
            </option>
          </select>
          <nav class="navbar bg-light btn-toolbar">
            <button class="btn btn-outline-primary" @click="onCreateSchemaRequest"><i class="fa-solid fa-file-circle-plus"></i></button>
            <button class="btn btn-outline-primary" @click="onDeleteRequest"><i class="fa-solid fa-trash" /></button>
            <button class="btn btn-outline-primary" @click="onDownloadSchemas"><i class="fa-solid fa-download" /></button>
            <button class="btn btn-outline-primary" @click="onUploadRequest"><i class="fa-solid fa-upload" /></button>
          </nav>
        </div>
      </div>
      <div class="col d-flex flex-column">
        <div class="mb-3 row">
          <div class="col-3">
            <label for="schema-name" class="form-label">Schema Name</label>
            <div class="input-group">
              <input type="text"
                     class="form-control"
                     id="schema-name"
                     placeholder="Schema Name"
                     disabled
                     readonly
                     :value="this.selectedSchema.name"
              />
              <button class="btn btn-outline-secondary" type="button" @click="onChangeSchemaNameRequest"><i class="fa-solid fa-pen-to-square"></i></button>
            </div>
          </div>
          <div class="col-3">
            <label for="key-path" class="form-label">Key Path</label>
            <div class="input-group">
              <input type="text"
                     class="form-control"
                     id="key-path"
                     placeholder="Key Path"
                     :value="this.selectedSchema.keyPath"
              />
            </div>
          </div>
          <div class="col-3">
            <label for="enabled-by-default" class="form-label">Enabled by Default</label>
            <select class="form-select" aria-label="Default select example" @change="updateEnabledByDefault">
              <option :selected="this.selectedSchema.enabledByDefault" value="yes">Yes</option>
              <option :selected="!this.selectedSchema.enabledByDefault" value="no">No</option>
            </select>
          </div>
        </div>
        <div class="row flex-fill flex-row">
          <div class="col d-flex flex-column">
            <label for="config-source" class="form-label">Object Schema</label>
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
    <upload-schema-modal 
        ref="uploadModal"
        title="Import Object Schemas"
        @upload="onUpload"
    >
      <div>
        <p><strong>Warning: Importing Object Schemas will replace all existing schema configurations.</strong></p>
        <p>Select a file to import.</p>
      </div>
    </upload-schema-modal>
    <single-value-modal
        ref="createSchemaModal"
        title="Create New Schema"
        input-label="Schema Name"
        input-placeholder="Schema Name"
        prompt="Please choose a name for the new schema that is not already in use."
        done-button="Create"
        :validator="schemaNameValidator"
        @done="createSchema"
     />
    <single-value-modal
        ref="editSchemaNameModal"
        title="Change Schema Name"
        input-label="Schema Name"
        input-placeholder="Schema Name"
        prompt="Please choose a new name for the schema that is not already in use."
        done-button="Update"
        :validator="schemaNameValidator"
        @done="changeSchemaName"
    />
    <confirm-modal
        ref="deleteModal"
        title="Delete Schema"
        confirm-button="Delete"
        @confirm="deleteConfirmed"
    >
      <p>Are you sure you want to delete the "{{this.selectedSchema.name}}" schema?</p>
    </confirm-modal>
  `
}