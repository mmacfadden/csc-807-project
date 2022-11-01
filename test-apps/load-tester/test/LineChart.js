export default {
  props: ["title", "xAxis", "yAxis", "series"],
  mounted() {
    Highcharts.chart(this.$refs.container, {
      chart: {
        type: 'line',
        zoomType: 'xy'
      },
      title: {
        text: this.title
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
        scatter: {
          marker: {
            radius: 5,
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
                enabled: false
              }
            }
          },
          tooltip: {
            headerFormat: '<b>{series.name}</b><br>',
            pointFormat: '{point.x} cm, {point.y} kg'
          }
        }
      },
      series: this.series
    });

  },
  template: `
    <div ref="container"/>
  `
}