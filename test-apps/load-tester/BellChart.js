export default {
  props: ["data", "title"],
  mounted() {
    const pointsInInterval = 5;
    Highcharts.chart(this.$refs.container, {
      chart: {
        margin: [50, 0, 50, 50],
        events: {
          load: function () {
            Highcharts.each(this.series[0].data,  (point, i) => {
              const labels = ['4σ', '3σ', '2σ', 'σ', 'μ', 'σ', '2σ', '3σ', '4σ'];
              if (i % pointsInInterval === 0) {
                point.update({
                  color: 'black',
                  dataLabels: {
                    enabled: true,
                    format: labels[Math.floor(i / pointsInInterval)],
                    overflow: 'none',
                    crop: false,
                    y: -2,
                    style: {
                      fontSize: '13px'
                    }
                  }
                });
              }
            });
          }
        }
      },
      title: {
        text: null
      },
      legend: {
        enabled: false
      },
      xAxis: [{
        title: {
          text: 'Data'
        },
        visible: false
      }, {
        title: {
          text: this.title
        },
        opposite: true,
        visible: true
      }],

      yAxis: [{
        title: {
          text: 'Data'
        },
        visible: false
      }, {
        title: {
          text: this.title
        },
        opposite: true,
        visible: true
      }],

      series: [{
        name: this.title,
        type: 'bellcurve',
        xAxis: 1,
        yAxis: 1,
        pointsInInterval: pointsInInterval,
        intervals: 4,
        baseSeries: 1,
        zIndex: -1,
        marker: {
          enabled: true
        },
        animation: false
      }, {
        name: 'Data',
        type: 'scatter',
        data: this.data,
        visible: false,
        marker: {
          radius: 1.5
        }
      }]
    });
  },
  template: `
    <div ref="container"/>
  `
}