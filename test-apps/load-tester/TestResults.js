import ResultTableRow from "./ResultTableRow.js";

export default {
  props: ["inProgressModule", "inProgressSchema", "results"],
  components: {
    ResultTableRow
  },
  template: `
    <table 
        id="results-table" 
        class="table table-striped table-bordered"
        data-detail-view="true"
    >
    <thead>
    <tr>
      <th>Encryption <br />Module</th>
      <th>Document <br />Schema</th>
      <th>Avg Document Size<br/>(kB)</th>
      <th>Document<br />Count</th>
      <th>Total Time<br/>(ms)</th>
      <th>Avg Read Time<br/>(ms)</th>
      <th>Avg Write Time<br/>(ms)</th>
      <th>Avg Read/Write Time<br/>(ms)</th>
      <th>Avg Read Throughput<br/>(kBps)</th>
      <th>Avg Write Throughput<br/>(kBps)</th>
    </tr>
    </thead>
    <tbody>
    <result-table-row v-for="result in results" :result="result"/>
    <tr v-if="inProgressModule">
      <td>{{ inProgressModule }}</td>
      <td>{{ inProgressSchema }}</td>
      <td colspan="8">In Progress</td>
    </tr>
    </tbody>
    </table>
  `
}