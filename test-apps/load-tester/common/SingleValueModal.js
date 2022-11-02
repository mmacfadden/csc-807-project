export default {
  props: ["title", "prompt", "inputLabel", "inputPlaceholder", "validator", "doneButton"],
  events: ["done"],
  data() {
    return {
      error: null,
      modal: null,
      initialValue: null,
      value: this.initialValue || ""
    }
  },
  mounted() {
    this.modal = new bootstrap.Modal(this.$refs.modal);
    this.$refs.input.focus();
  },
  unmounted() {
    this.modal.dispose();
  },
  methods: {
    show(initialValue) {
      this.initialValue = initialValue || null;
      this.value = initialValue || "";
      this.error = "";
      this.modal.show();
    },
    onSubmit() {
      const error = this.validator(this.value);
      if (error) {
        this.error = error;
      } else {
        this.$emit("done", this.value);
        this.modal.hide();
        this.error = null;
        this.value = "";
      }

      return false;
    }
  },
  template: `
    <div class="modal" tabindex="-1" ref="modal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ this.title }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit="onSubmit">
            <label for="single-value-input" class="form-label">{{ this.inputLabel }}</label>
            <input type="text"
                   ref="input"
                   class="form-control"
                   id="single-value-input"
                   :placeholder="this.inputPlaceholder"
                   v-model="this.value"
                   autofocus
            />
            <div v-if="this.error !== null" class="form-error">{{ this.error }}</div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" :disabled="value === ''" @click="onSubmit">{{ doneButton }}
          </button>
        </div>
      </div>
    </div>
    </div>
  `
}