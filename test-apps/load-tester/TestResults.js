export default {
  props: ["inProgressModule", "inProgressSchema", "results"],
  methods: {
    round(value, decimals) {
      return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals).toFixed(decimals);
    }
  },
  template: `
    <table id="results-table" class="table table-striped table-bordered">
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
    <tr v-for="result in results">
      <td class="string">{{result.moduleId}}</td>
      <td class="string">{{result.schemaName}}</td>
      <td class="number">{{round(result.averageDocumentSize, 1)}}</td>
      <td class="number">{{result.operationCount}}</td>
      <td class="number">{{round(result.totalTimeMs, 1)}}</td>
      <td class="number">{{round(result.averageReadTimeMs, 1)}}</td>
      <td class="number">{{round(result.averageWriteTimeMs, 1)}}</td>
      <td class="number">{{round(result.averageReadWriteTimeMs, 1)}}</td>
      <td class="number">{{round(result.avgReadThroughputKbps, 1)}}</td>
      <td class="number">{{round(result.avgWriteThroughputKbps, 1)}}  </td>
    </tr>
    <tr v-if="inProgressModule">
      <td>{{ inProgressModule }}</td>
      <td>{{ inProgressSchema }}</td>
      <td colspan="8">In Progress</td>
    </tr>
    </tbody>
    </table>
  `
}