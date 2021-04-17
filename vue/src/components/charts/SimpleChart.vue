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

      <div class="field is-grouped is-grouped-multiline" v-if="xAxis">
        <div class="control">
          <span class="is-size-7">X:</span>
        </div>
        <div class="control">
          <div class="select is-small">
            <select v-model="xAxis.columnName">
              <option v-for="(xc, i) in xOptions" :key="'view-' + view.id + '-chart-' + chart.id + '-simple-chart-x-option-' + i">
                {{xc}}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="field is-grouped is-grouped-multiline" v-for="(s, i) in series" 
        :key="'view-' + view.id + '-chart-' + chart.id + '-simple-chart-y-option-group-' + i">
        <div class="control">
          <span class="is-size-7">Y{{i+1}}:</span>
        </div>
        <div class="control">
          <div class="select is-small">
            <select v-model="series[i].columnName" @change="serieColumnNameChanged(i)">
              <option v-for="(yo, j) in yOptions"
                :key="'view-' + view.id + '-chart-' + chart.id + '-simple-chart-y-option-' + i + '-' + j + '-' + s.id">
                {{yo}}
              </option>
            </select>
          </div>
        </div>
        <div class="control">
          <div class="select is-small">
            <select v-model="series[i].chartType">
              <option v-for="(co, j) in chartTypeOptions"
                :key="'view-' + view.id + '-chart-' + chart.id + '-simple-chart-y-chart-type-option-' + i + '-' + j + '-' + s.id">
                {{co}}
              </option>
            </select>
          </div>
        </div>
        <div class="control" v-if="series[i].chartType == 'line'">
          <label class="checkbox is-size-7">
            <input type="checkbox" class="my-checkbox" v-model="series[i].fill">
            Fill
          </label>
        </div>
        <div class="control" v-if="series[i].chartType == 'line'">
          <label class="checkbox is-size-7">
            <input type="checkbox" class="my-checkbox" v-model="series[i].smooth">
            Smooth
          </label>
        </div>
        <div class="control" v-if="series[i].chartType == 'line'">
          <label class="checkbox is-size-7">
            <input type="checkbox" class="my-checkbox" v-model="series[i].step">
            Step
          </label>
        </div>
        <div class="control" v-if="series.length > 1">
          <label class="checkbox is-size-7">
            <input type="checkbox" class="my-checkbox" v-model="series[i].stack">
            Stack
          </label>
        </div>
        <div class="control" v-if="xAxis && series[i].columnName != xAxis.columnName && xAxisData && xAxisData.duplicated">
          <span class="is-size-7">Multi-value:</span>
        </div>
        <div class="control" v-if="xAxis && series[i].columnName != xAxis.columnName && xAxisData && xAxisData.duplicated">
          <div class="select is-small">
            <select v-model="series[i].greg">
              <option v-for="(go, j) in gregOptions"
                :key="'view-' + view.id + '-chart-' + chart.id + '-simple-chart-y-greg-option-' + i + '-' + j + '-' + s.id">
                {{go}}
              </option>
            </select>
          </div>
        </div>
        <div class="control" v-if="hasPieKind">
          <label class="checkbox is-size-7">
            <input type="checkbox" class="my-checkbox" v-model="series[i].donut">
            Donut
          </label>
        </div>
        <div class="control" v-if="hasPieKind">
          <label class="checkbox is-size-7">
            <input type="checkbox" class="my-checkbox" v-model="series[i].rounded">
            Rounded
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

      <div class="field is-grouped is-grouped-multiline" v-if="!hasPieKind">
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
  name: 'simple-chart',
  props: ['chart', 'view'],
  data () {
    return {
      count: 1,
      chartHeight: 400,
      chartWidth: '100%',
      chartThemeOptions: ['light', 'dark', 'vintage', 'westeros', 'essos', 'wonderland', 'walden', 'chalk', 'infographic', 'macarons', 'roma', 'shine', 'purple-passion', 'halloween', 'ovilia-green'],
      chartTheme: 'light',
      xAxis: null,
      xAxisData: null, 
      series: [],
      gregOptions: ['average', 'sum'],
      title: {text: '', left: 'center'},
      legendOption: {show: true, top: 'bottom'}
    }
  },
  computed: {
    rows () {
      return this.view.data.rows
    },
    format () {
      return this.view.data.format
    },
    chartTypeOptions() {
      if (this.series.length < 2)
        return ['line', 'bar', 'pie']
      return ['line', 'bar']
    },
    xOptions () {
      return this.format.map(function (h) {
        return h.columnName
      })
    },
    yOptions () {
      var vm = this
      return this.format.filter(function (h) {
        if (h.columnName == '#') {
          return false
        }
        if (h.columnType == 'num') {
          return true
        }
        if (vm.xAxis && vm.xAxis.columnName == h.columnName) {
          return true
        }
        return false
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
    hasPieKind () {
      return this.series.find(this.isPieKind) != undefined
    },
    option () {
      var op = {
        title: this.title,
        legend: this.legend,
        tooltip: {
          trigger: this.hasPieKind ? 'item' : 'axis'
        },
        toolbox: {
          feature: {
            dataZoom: {
                yAxisIndex: 'none'
            },
            restore: {},
            saveAsImage: {}
          }
        },
      }
      var xAxis = this.collectXData()
      var series = this.collectSeriesData()
      op.xAxis = this.hasPieKind ? undefined : xAxis
      op.yAxis = this.hasPieKind ? undefined : {
          type: 'value'
      }
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
    pieOptions () {
      if (!this.hasPieKind ) {
        return {}
      }
      var pie = this.series[0]
      return {
        pieEmphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          borderRadius: pie.rounded ? 10 : 0,
          borderColor: '#fff',
          borderWidth: pie.rounded ? 2 : 0
        },
        radius: pie.donut ? ['40%', '70%'] : '70%'
      }
    }
  },
  watch: {
    format: function (val) {
      this.$nextTick(this.initOptions)
    },
  },
  methods: {
    initOptions () {
      this.xAxis = {
        columnName: this.xOptions[0]
      }
      this.series = []
      this.addSerie()
    },
    collectXData () {
      var xAxis = {
        type: 'category'
      }
      if (!this.xAxis) {
        return xAxis
      }
      if (this.xAxis.columnName == '#') {
        xAxis.data = this.makeRange()
      } else {
        xAxis.data = this.findUniqueValues()
      }
      this.makeAxisData(xAxis.data)
      return xAxis
    },
    collectSeriesData () {
      var vm = this
      if (!vm.xAxis || !vm.xAxisData || !vm.series.length) {
        return []
      }
      var seriesData = vm.series.map(function (s) {
        return vm.xAxisData.values.map(function (v) {
          return {count: 0, sum: 0, average: 0}
        })
      })
      for (var i=0;i<vm.rows.length;i++) {
        var row = vm.rows[i]
        for (var j=0;j<vm.series.length;j++) {
          var xValue = vm.xAxis.columnName == '#' ? (i + 1) : row[vm.xAxis.columnName]
          var xValueIndex = vm.xAxisData.indexMap[xValue]
          var columnName = vm.series[j].columnName
          var yValue = columnName == vm.xAxis.columnName ? 0 : parseFloat(row[columnName])
          var valueToUpdate = seriesData[j][xValueIndex]
          valueToUpdate.sum += yValue
          valueToUpdate.count += 1
          valueToUpdate.average = valueToUpdate.sum / valueToUpdate.count
        }
      }
      return vm.series.map(function (s, i) {
        return {
          type: s.chartType,
          data: seriesData[i].map(function (d, j) {
            var value = d[s.greg]
            if (s.columnName == vm.xAxis.columnName) {
              value = d.count
            }
            if (vm.isPieKind(s)) {
              return {value: value, name: vm.xAxisData.values[j]}
            }
            return value
          }),
          name: s.name,
          smooth: s.smooth,
          step: s.step ? s.columnName : undefined,
          stack: s.stack ? 'all' : null,
          areaStyle: s.fill ? {} : null,
          emphasis: vm.pieOptions.pieEmphasis,
          radius: vm.pieOptions.radius,
          itemStyle: vm.pieOptions.itemStyle
        }
      })
    },
    makeRange () {
      var range = [...Array(this.rows.length + 1).keys()]
      range.shift()
      return range
    },
    findUniqueValues () {
      var columnName = this.xAxis.columnName
      var valueSet = new Set()
      var values = []
      this.rows.forEach(function (r){
        var value = r[columnName]
        if (!valueSet.has(value)) {
          values.push(value)
          valueSet.add(value)
        }
      })
      return values
    },
    makeAxisData (values) {
      var indexMap = {}
      for (var i=0;i<values.length;i++) {
        indexMap[values[i]] = i
      }
      this.xAxisData = {values: values, indexMap: indexMap, duplicated: values.length < this.rows.length}
    },
    addSerie () {
      this.series.push({
        id: this.count++,
        columnName: this.yOptions[0],
        chartType: 'line',
        fill: false,
        smooth: false,
        step: false,
        stack: false,
        greg: 'average',
        name: this.yOptions[0],
        donut: false,
        rounded: false
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
    serieColumnNameChanged (i) {
      this.series[i].name = this.series[i].columnName
    },
    isPieKind (s) {
      return s.chartType == 'pie'
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