export default {
  props: [
    "currentModule",
    "currentSchema",
    "testsCompleted",
    "totalTests",
    "documentsCompleted",
    "documentsPerTest"
  ],
  computed: {
    modulePercent() {
      const modulePercent =
          Math.round((this.documentsCompleted) / this.documentsPerTest * 100);
      return `${modulePercent}%`;
    },
    totalPercent() {
      const totalCompletedDocs =
          this.testsCompleted * this.documentsPerTest + this.documentsCompleted;
      const totalPercent = Math.round((totalCompletedDocs) / (this.documentsPerTest * this.totalTests) * 100);
      return `${totalPercent}%`;
    }
  },
  template: `
    <table id="status-table" class="table table-bordered">
    <tbody>
    <tr>
      <td>Current Test:</td>
      <td>
        <span v-if="currentModule">
          Test {{ testsCompleted + 1 }} of {{ totalTests }}: 
          Encrypting <strong>{{currentSchema}}</strong> documents 
          with <strong>{{ currentModule }}</strong>
        </span>
        <span v-if="!currentModule">No Test Running</span>
      </td>
    </tr>
    <tr>
      <td>Test Progress:</td>
      <td>
        <div class="progress">
          <div class="progress-bar progress-bar-striped progress-bar-animated" id="module-progress" role="progressbar"
               :style="{width: modulePercent}" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
            {{ modulePercent }}
          </div>
        </div>
      </td>
    </tr>
    <tr>
      <td>Total Progress:</td>
      <td>
        <div class="progress">
          <div class="progress-bar progress-bar-striped progress-bar-animated" id="total-progress" role="progressbar"
               :style="{width: totalPercent}" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
            {{ totalPercent }}
          </div>
        </div>
      </td>
    </tr>
    </tbody>
    </table>
  `
}