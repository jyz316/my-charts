<template>
  <div>
    <div class="box">
      <button class="delete is-pulled-right" @click="deleteChart"></button>
      <div class="field is-grouped is-grouped-multiline">
        <div class="control">
          <span class="is-size-7">Chart</span>
        </div>
        <div class="control">
          <span class="is-size-7">Title:</span>
        </div>
        <div class="control">
          <input class="input is-small" type="text" placeholder="title" v-model="title.text">
        </div>
        <div class="control">
          <div class="select is-small">
            <select v-model="title.left">
              <option>left</option>
              <option>center</option>
              <option>right</option>
            </select>
          </div>
        </div>
        <div class="control">
          <label class="checkbox is-size-7">
            <input type="checkbox" class="my-checkbox" v-model="legendOption.show">
            Legend
          </label>
        </div>
        <div class="control"  v-if="legendOption.show">
          <div class="select is-small">
            <select v-model="legendOption.top">
              <option>top</option>
              <option>bottom</option>
            </select>
          </div>
        </div>
        <div class="control">
          <span class="is-size-7">Height:</span>
        </div>
        <div class="control">
          <input class="input is-small number-input" type="number" placeholder="height" v-model.number="chartHeight">
        </div>
        <div class="control">
          <span class="is-size-7">Width:</span>
        </div>
        <div class="control">
          <input class="input is-small number-input" type="text" placeholder="width" v-model="chartWidth">
        </div>
        <div class="control">
          <span class="is-size-7">Theme:</span>
        </div>
        <div class="control">
          <div class="select is-small">
            <select v-model="chartTheme">
              <option v-for="(ctm, i) in chartThemeOptions" :key="'view-' + view.id + '-chart-' + chart.id + '-simple-chart-theme-option-' + i">
                {{ctm}}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="chart-container" :style="{'height': chartHeight + 'px', 'width': chartWidthStyle}">
        <v-chart autoresize :option="option" :theme="chartTheme" :ref="'chart-' + chart.id" />
      </div>

      <div class="field is-grouped is-grouped-multiline" v-for="(s, i) in series" 
        :key="'view-' + view.id + '-chart-' + chart.id + '-simple-xy-chart-xy-option-group-' + i">
        <div class="control">
          <span class="is-size-7">XY{{i+1}}:</span>
        </div>
        <div class="control">
          <div class="select is-small">
            <select v-model="series[i].xy[0]" @change="serieXyChanged(i)">
              <option v-for="(xo, j) in vars"
                :key="'view-' + view.id + '-chart-' + chart.id + '-simple-xy-chart-x-option-' + i + '-' + j + '-' + s.id">
                {{xo}}
              </option>
            </select>
          </div>
        </div>
        <div class="control">
          <div class="select is-small">
            <select v-model="series[i].xy[1]" @change="serieXyChanged(i)">
              <option v-for="(yo, j) in vars"
                :key="'view-' + view.id + '-chart-' + chart.id + '-simple-xy-chart-y-option-' + i + '-' + j + '-' + s.id">
                {{yo}}
              </option>
            </select>
          </div>
        </div>
        <div class="control">
          <div class="select is-small">
            <select v-model="series[i].chartType">
              <option v-for="(co, j) in chartTypeOptions"
                :key="'view-' + view.id + '-chart-' + chart.id + '-simple-xy-chart-y-chart-type-option-' + i + '-' + j + '-' + s.id">
                {{co}}
              </option>
            </select>
          </div>
        </div>
        <div class="control">
          <span class="is-size-7">Size:</span>
        </div>
        <div class="control">
          <input class="input is-small number-input" type="number" placeholder="Point size" v-model.number="series[i].symbolSize">
        </div>
        <div class="control" v-if="series[i].chartType == 'line'">
          <label class="checkbox is-size-7">
            <input type="checkbox" class="my-checkbox" v-model="series[i].smooth">
            Smooth
          </label>
        </div>
        <div class="control">
          <span class="is-size-7">Label:</span>
        </div>
        <div class="control">
          <input class="input is-small" type="text" placeholder="legend" v-model="series[i].name">
        </div>
        <div class="control" v-if="i" @click="deleteSerie(s.id)">
          <button class="delete delete-serie-btn"></button>
        </div>
      </div>

      <div class="field is-grouped is-grouped-multiline">
        <div class="control">
          <a class="button is-info is-small" @click="addSerie">
            添加数据
          </a>
        </div>
      </div>
     </div>
  </div>
</template>

<script>
export default {
  name: 'simple-xy-chart',
  props: ['chart', 'view'],
  data () {
    return {
      count: 1,
      chartHeight: 400,
      chartWidth: '100%',
      chartThemeOptions: ['light', 'dark', 'vintage', 'westeros', 'essos', 'wonderland', 'walden', 'chalk', 'infographic', 'macarons', 'roma', 'shine', 'purple-passion', 'halloween', 'ovilia-green'],
      chartTheme: 'light',
      series: [],
      title: {text: '', left: 'center'},
      legendOption: {show: true, top: 'bottom'},
      chartTypeOptions: ['scatter', 'line']
    }
  },
  computed: {
    rows () {
      return this.view.data.rows
    },
    format () {
      return this.view.data.format
    },
    vars () {
      return this.format.filter(function (h) {
        return h.columnType == 'num'
      }).map(function (h) {
        return h.columnName
      })
    },
    legend () {
      if (!this.legendOption.show) {
        return null
      }
      return { 
        data: this.series.map(function (s) {
          return s.name
        }),
        top: this.legendOption.top
      }
    },
    option () {
      var op = {
        title: this.title,
        legend: this.legend,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        xAxis: {
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          }
        },
        yAxis: {
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          }
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
      }

      var series = this.collectSeriesData()
      op.series = series

      console.log(op)

      const c = this.$refs['chart-' + this.chart.id]
      if (c) {
        c.setOption(op, true)
      }
      return op
    },
    chartWidthStyle () {
      if (this.chartWidth.endsWith('%')) {
        return this.chartWidth
      }
      return this.chartWidth + 'px'
    },
  },
  watch: {
    format: function (val) {
      this.$nextTick(this.initOptions)
    },
  },
  methods: {
    initOptions () {
      this.series = []
      this.addSerie()
    },
    collectSeriesData () {
      var vm = this
      if (!vm.series.length) {
        return []
      }
      var seriesData = vm.series.map(function (s) {
        return []
      })
      for (var i=0;i<vm.rows.length;i++) {
        var row = vm.rows[i]
        for (var j=0;j<vm.series.length;j++) {
          var xy = vm.series[j].xy
          var x = xy[0] == '#' ? (i + 1) : parseFloat(row[xy[0]])
          var y = xy[1] == '#' ? (i + 1) : parseFloat(row[xy[1]])
          seriesData[j].push([x, y])
        }
      }
      return vm.series.map(function (s, i) {
        return {
          type: s.chartType,
          data: seriesData[i],
          name: s.name,
          smooth: s.smooth,
          symbolSize: s.symbolSize
        }
      })
    },
    addSerie () {
      this.series.push({
        id: this.count++,
        xy: [this.vars[0], this.vars[1]],
        chartType: 'scatter',
        symbolSize: 7,
        smooth: false,
        name: this.vars[0] + '-' + this.vars[1],
      })
    },
    deleteSerie (id) {
      var index = -1
      for (var i=0;i<this.series.length;i++) {
        if (this.series[i].id == id) {
          index = i
          break
        }
      }
      if (index != -1) {
        this.series.splice(index, 1)
      }
    },
    serieXyChanged (i) {
      this.series[i].name = this.series[i].xy[0] + '-' + this.series[i].xy[1]
    },
    deleteChart () {
      this.$emit('delete-chart', this.chart)
    },
  },
  mounted () {
    this.$nextTick(this.initOptions)
  }
}
</script>

<style lang="scss" scoped>
.chart-container {
  border-radius: 6px;
  overflow: hidden;
  width: 100%;
}

.simple-chart-container {
   width: 100%;
   border-radius: 25px;
}

.number-input {
  width: 80px;
}

.delete-serie-btn {
  position: relative;
  top: 5px;
}

.my-checkbox {
  position: relative;
  top: 3px;
}

</style>