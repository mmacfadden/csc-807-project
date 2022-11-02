export default {
  props: ["title",  "confirmButton"],
  events: ["confirm"],
  data() {
    return {
      modal: null,
    }
  },
  mounted() {
    this.modal = new bootstrap.Modal(this.$refs.modal);
  },
  unmounted() {
    this.modal.dispose();
  },
  methods: {
    show() {
      this.modal.show();
    },
    onConfirm() {
      this.$emit("confirm", this.value);
      this.modal.hide();
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
          <slot/>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" @click="onConfirm">{{ confirmButton }}
          </button>
        </div>
      </div>
    </div>
  </div>
  `
}