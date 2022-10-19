export default {
  props: [
    "currentModule",
    "modulesCompleted",
    "totalModules",
    "documentsCompleted",
    "documentsPerModule"
  ],
  computed: {
    modulePercent() {
      const modulePercent =
          Math.round((this.documentsCompleted) / this.documentsPerModule * 100);
      return `${modulePercent}%`;
    },
    totalPercent() {
      const totalCompletedDocs =
          this.modulesCompleted * this.documentsPerModule + this.documentsCompleted;
      const totalPercent = Math.round((totalCompletedDocs) / (this.documentsPerModule * this.totalModules) * 100);
      return `${totalPercent}%`;
    }
  },
  template: `
    <table id="status-table" class="table table-bordered">
    <tbody>
    <tr>
      <td>Current Module:</td>
      <td>
        <span v-if="currentModule">Module {{ modulesCompleted + 1 }} of {{ totalModules }}: {{ currentModule }}</span>
        <span v-if="!currentModule">No Test Running</span>
      </td>
    </tr>
    <tr>
      <td>Module Progress:</td>
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