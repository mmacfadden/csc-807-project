export default {
  props: ["title", "xAxis", "yAxis", "series"],
  mounted() {
    Highcharts.chart(this.$refs.container, {
      chart: {
        type: 'line',
        zoomType: 'xy',
        height: (5 / 7 * 100) + '%',
      },
      colors: [
        "#49402b",
        "#7f0000",
        "#008000",
        "#0000e0",
        "#ff8c00",
        "#000000",
        "#00ff00",
        "#00ffff",
        "#9d029d",
        "#1e90ff",
        "#eee8aa",
        "#d73785",
      ],
      title: {
        text: null
      },
      xAxis: {
        title: {
          enabled: true,
          text: this.xAxis
        },
        startOnTick: true,
        endOnTick: true,
        showLastLabel: true
      },
      yAxis: {
        title: {
          text: this.yAxis
        }
      },
      legend: {
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'top',
        x: 10,
        y: 10,
        floating: false,
        backgroundColor: Highcharts.defaultOptions.chart.backgroundColor,
        borderWidth: 1
      },
      plotOptions: {
        line: {
          marker: {
            radius: 2,
            states: {
              hover: {
                enabled: true,
                lineColor: 'rgb(100,100,100)'
              }
            }
          },
          states: {
            hover: {
              marker: {
                enabled: true
              }
            }
          },
          tooltip: {
            pointFormatter() {
              return `${this.x.toFixed(1)} kB, ${this.y.toFixed(1)} ms`;
            },
            headerFormat: '<b>{series.name}</b><br>',
          }
        }
      },
      exporting: {
        filename: this.title,
        chartOptions: {
          chart: {
            width: 700,
            height: 500
          }
        },
        scale: 1
      },
      credits: {
        enabled: false
      },
      series: this.series
    });

  },
  template: `
    <div class="line-chart">
    <div class="chart-title">{{ this.title }}</div>
    <div ref="container"/>
    </div>
  `
}