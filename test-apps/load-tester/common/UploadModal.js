import {handle_single_file_upload} from "../util/file_utils.js";

export default {
  props: ["title"],
  events: ["upload"],
  data() {
    return {
      uploadModal: null,
      error: null,
      contents: null,
      visible: false
    }
  },
  mounted() {
    this.uploadModal = new bootstrap.Modal(this.$refs.uploadModal);
    this.$refs.uploadModal.addEventListener('hide.bs.modal', () => {
      this.visible = false;
    });
    this.$refs.uploadModal.addEventListener('shown.bs.modal', () => {
      handle_single_file_upload(this.$refs.importFile)
          .then(contents => {
            this.contents = contents;
          })
          .catch(e => {
            console.log(e);
            this.error = e.message;
          });
    });
  },
  unmounted() {
    this.uploadModal.dispose();
  },
  methods: {
    show() {
      this.visible = true;
      setTimeout(() => this.uploadModal.show(), 0);
    },
    completeUpload() {
      this.uploadModal.hide();
      this.$emit("upload", this.contents);
      this.contents = null;
    }
  },
  template: `
    <div class="modal" tabindex="-1" ref="uploadModal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ this.title }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <slot></slot>
          <input v-if="visible" class="form-control" type="file" id="importFile" ref="importFile">
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" :disabled="contents === null" @click="completeUpload">Upload</button>
        </div>
      </div>
    </div>
    </div>
  `
}