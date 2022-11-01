import Chart from "./BellChart.js";

export default {
  props: ["result"],
  data() {
    return {
      expanded: false
    }
  },
  methods: {
    round(value, decimals) {
      return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals).toFixed(decimals);
    },
    toggle() {
      console.log("click");
      this.expanded = !this.expanded;
    }
  },
  components: {
    Chart
  },
  template: `
    <tr>
      <td class="string" >
        <span @click="toggle" class="row-toggle">
          <span v-show="!expanded"><i class="fa-solid fa-square-plus" /></span>
          <span v-show="expanded"><i class="fa-solid fa-square-minus" /></span>
        </span>
        <span>{{result.moduleId}}</span>
      </td>
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
    <tr v-if="expanded">
      <td colspan="10">  
        <div class="d-flex flex-row">
          <chart :data="result.reads.map(x => x.timeMs)" title="Read Time"/>
          <chart :data="result.writes.map(x => x.timeMs)" title="Write Time"/>
        </div>
      </td>
    </tr>
  `
}