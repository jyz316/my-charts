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
        <div class="control" v-if="xAxis && series[i].columnName != xAxis.columnName && xDuplicated">
          <span class="is-size-7">Multi-value:</span>
        </div>
        <div class="control" v-if="xAxis && series[i].columnName != xAxis.columnName && xDuplicated">
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

      <div class="field is-grouped is-grouped-multiline button-line" v-if="!hasPieKind">
        <div class="control">
          <a class="button is-info is-small" @click="addSerie">
            添加数据
          </a>
        </div>
        <div class="code-button">
          <button class="button is-small is-text"
            @click="showCode = !showCode"
            :class="{'has-text-grey-light': !showCode}">
            <span class="icon">
              <v-icon name="code"/>
            </span>
          </button>
        </div>
      </div>

      <div v-if="showCode" class="columns">
        <div class="column is-half">
          <my-editor :editor-id="'editor1-' + view.id + '-' + chart.id"
            :editor-height="340" :language="'javascript'"
            :fixed="JSON.stringify(optionCode, null, 2)"></my-editor>
        </div>
        <div class="column is-half">
          <my-editor :editor-id="'editor2-' + view.id + '-' + chart.id"
            :editor-height="340" :language="'javascript'"
            :fixed="JSON.stringify(option, null, 2)"></my-editor>
        </div>
      </div>
     </div>
  </div>
</template>

<script>
import MyEditor from '@/components/MyEditor'

var cache = {}


export default {
  name: 'simple-chart',
  components: {
    MyEditor
  },
  props: ['chart', 'view'],
  data () {
    return {
      count: 1,
      chartHeight: 400,
      chartWidth: '100%',
      chartThemeOptions: ['light', 'dark', 'vintage', 'westeros', 'essos', 'wonderland', 'walden', 'chalk', 'infographic', 'macarons', 'roma', 'shine', 'purple-passion', 'halloween', 'ovilia-green'],
      chartTheme: 'light',
      xAxis: null,
      series: [],
      gregOptions: ['average', 'sum'],
      title: {text: '', left: 'center'},
      legendOption: {show: true, top: 'bottom'},
      showCode: false,
      rows: [],
      xDuplicated: false
    }
  },
  computed: {
    viewVersion () {
      return this.view.version
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
      op.xAxis  = {type: 'category'}
      var xAxisData = this.collectXData()
      op.xAxis .data = xAxisData.values
      var series = this.collectSeriesData(xAxisData)
      op.xAxis = this.hasPieKind ? undefined : op.xAxis
      op.yAxis = this.hasPieKind ? undefined : {
          type: 'value'
      }
      op.series = series

      const c = this.$refs['chart-' + this.chart.id]
      if (c) {
        c.setOption(op, true)
      }
      return op
    },
    optionCode () {
      var op = JSON.parse(JSON.stringify(this.option));
      op.xAxis.data = '${' + this.xAxis.columnName + '}'
      for (var i=0;i<this.series.length;i++) {
        op.series[i].data = '${' + this.series[i].columnName + '}'
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
    viewVersion: function (val) {
      this.rows = this.$store.getters['views/getRowsByViewId'](this.view.id)
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
      if (!this.xAxis) {
        return {}
      }
      var columnName = this.xAxis.columnName
      var values = []
      var indexMap = {}
      var vm = this
      this.rows.forEach(function (r, i){
        var value = vm.xAxis.columnName == '#' ? (i + 1) : r[columnName]
        if (!indexMap[value]) {
          indexMap[value] = []
          values.push(value)
        }
        indexMap[value].push(i)
      })
      this.xDuplicated = values.length < this.rows.length
      return {values: values, indexMap: indexMap}
    },
    collectSeriesData (xAxisData) {
      var vm = this
      if (!vm.xAxis || !xAxisData || !vm.series.length) {
        return []
      }
      var seriesData = vm.series.map(function (s) {
        if (cache[vm.xAxis.columnName] && cache[vm.xAxis.columnName][s.columnName]) {
          console.log('hit cache')
          return cache[vm.xAxis.columnName][s.columnName]
        }
        if (s.columnName == vm.xAxis.columnName) {
          if (vm.duplicated) {
            return xAxisData.values.map(v => ({count: xAxisData.indexMap[v].length, sum: 0, average: 0}))
          }
          return xAxisData.values.map(v => ({count: 1, sum: 0, average: 0}))
        }
        if (!vm.xDuplicated) {
          return vm.rows.map(function (r) {
            var yValue = parseFloat(r[s.columnName])
            return {count: 1, sum: yValue, average: yValue}
          })
        }
        return xAxisData.values.map(function (v, i) {
          var yValues = xAxisData.indexMap[v].map(function(index) {
            return parseFloat(vm.rows[index][s.columnName])
          })
          var sum = yValues.reduce((a,b) => a + b, 0)
          return {sum: sum, average: (sum / yValues.length)}
        })
      })

      this.updateCache(vm.xAxis, vm.series, seriesData)

      return vm.series.map(function (s, i) {
        return {
          type: s.chartType,
          data: seriesData[i].map(function (d, j) {
            var value = d[s.greg]
            if (s.columnName == vm.xAxis.columnName) {
              value = d.count
            }
            if (vm.isPieKind(s)) {
              return {value: value, name: xAxisData.values[j]}
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
    updateCache (xAxis, series, seriesData) {
      if (!cache[xAxis.columnName]) {
        cache[xAxis.columnName] = {}
      }
      series.forEach(function(s, i) {
        cache[xAxis.columnName][s.columnName] = seriesData[i]
      })
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
    this.rows = this.$store.getters['views/getRowsByViewId'](this.view.id)
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

.button-line {
  position: relative;

  .code-button {
    position: absolute;
    right: 0px;
  }
}

</style>