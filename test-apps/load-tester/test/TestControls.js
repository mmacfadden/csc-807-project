export default {
  props: ["inProgress", "testCompleted"],
  events: ["start", "cancel", "clear", "downloadCsv", "downloadJson", "uploadResults"],
  methods: {
    onStartTest() {
      this.$emit("start");
    },
    onCancel() {
      this.$emit("cancel");
    },
    onClear() {
      this.$emit("clear");
    },
    onDownloadCsv() {
      this.$emit("downloadCsv");
    },
    onDownloadJson() {
      this.$emit("downloadJson");
    },
    onUpload() {
      this.$emit("uploadResults");
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
    <button class="btn btn-primary icon" @click="onDownloadCsv" :disabled="!testCompleted">
      <i class="fa-solid fa-file-csv"></i><i class="fa-solid fa-download"></i> Download CSV 
    </button>
    <button class="btn btn-primary icon" @click="onDownloadJson" :disabled="!testCompleted">
      <i class="fa-solid fa-file-code"></i><i class="fa-solid fa-download"></i> Download JSON 
    </button>
    <button class="btn btn-primary icon" @click="onUpload" :disabled="inProgress">
      <i class="fa-solid fa-file-code"></i><i class="fa-solid fa-upload"></i> Upload Results
    </button>
    <button class="btn btn-danger icon" @click="onClear" :disabled="!testCompleted">
      <i class="fa-solid fa-trash"></i> Clear Results
    </button>
    </div>
  `
};