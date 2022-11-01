export default {
  props: ["inProgress", "testCompleted"],
  events: ["start", "cancel", "download"],
  methods: {
    onStartTest() {
      this.$emit("start");
    },
    onCancel() {
      this.$emit("cancel");
    },
    onDownload() {
      this.$emit("download");
    }
  },
  template: `
    <div id="controls">
      <button class="btn btn-primary icon" @click="onStartTest" :disabled="inProgress">
        <i class="fa-solid fa-play"></i>Run Load Test
      </button>
      <button class="btn btn-primary icon" @click="onCancel" :disabled="!inProgress">
        <i class="fa-solid fa-stop"></i>Cancel Tests
      </button>
      <button class="btn btn-primary icon" @click="onDownload" :disabled="!testCompleted">
        <i class="fa-solid fa-download"></i>Download Results
      </button>
    </div>
  `
};