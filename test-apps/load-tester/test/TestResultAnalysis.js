import LineChart from "./LineChart.js";

function convertResultsToSeries(results, xExtractor, yExtractor) {
  const series = [];
  const dataSeries = new Map();
  results.forEach(r => {
    let s = dataSeries.get(r.moduleId);
    if (s === undefined) {
      s = {
        name: r.moduleId,
        data: []
      };
      dataSeries.set(r.moduleId, s);
      series.push(s);
    }

    s.data.push([xExtractor(r), yExtractor(r)]);
  });

  series.forEach(s => {
    s.data.sort((a, b) => { return a[0] - b[0] });
  });

  return series;
}

export default {
  props: ["results"],
  data() {
    return {
      readTimeSeries: null,
      writeTimeSeries: null,
      readThroughputSeries: null,
      writeThroughputSeries: null
    }
  },
  mounted() {
    this.readTimeSeries = convertResultsToSeries(
        this.results, r => r.averageDocumentSize, r => r.averageReadTimeMs);

    this.writeTimeSeries = convertResultsToSeries(
        this.results, r => r.averageDocumentSize, r => r.averageWriteTimeMs);

    this.readThroughputSeries = convertResultsToSeries(
        this.results, r => r.averageDocumentSize, r => r.avgReadThroughputKbps);

    this.writeThroughputSeries = convertResultsToSeries(
        this.results, r => r.averageDocumentSize, r => r.avgWriteThroughputKbps);
  },
  components: {
    LineChart
  },
  template: `
    <div class="row">
      <div class="col-lg-6 col-md-12" v-if="readTimeSeries">
        <LineChart 
          :series="readTimeSeries"
          x-axis="Document Size (kB)"
          y-axis="Read Time (ms)"
          title="Read Time vs Document Size"
        />
      </div>
  
      <div class="col-lg-6 col-md-12" v-if="writeTimeSeries">
        <LineChart
            :series="writeTimeSeries"
            x-axis="Document Size (kB)"
            y-axis="Write Time (ms)"
            title="Write Time vs Document Size"
        />
      </div>

      <div class="col-lg-6 col-md-12" v-if="readThroughputSeries">
        <LineChart
            :series="readThroughputSeries"
            x-axis="Document Size (kB)"
            y-axis="Read Throughput (kBps)"
            title="Read Throughput vs Document Size"
        />
      </div>

      <div class="col-lg-6 col-md-12" v-if="writeThroughputSeries">
        <LineChart
            :series="writeThroughputSeries"
            x-axis="Document Size (kB)"
            y-axis="Write Throughput (kBps)"
            title="Write Throughput vs Document Size"
        />
      </div>
    </div>
  `
}