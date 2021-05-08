<template>
  <div>
    <div class="box">
      <button class="delete is-pulled-right" @click="deleteChart"></button>
      <div class="field is-grouped is-grouped-multiline">
        <div class="control">
          <span class="is-size-7">图表</span>
        </div>
        <div class="control">
          <span class="is-size-7">图高:</span>
        </div>
        <div class="control">
          <input class="input is-small number-input" type="number" placeholder="height" v-model.number="chartHeight">
        </div>
        <div class="control">
          <span class="is-size-7">图宽:</span>
        </div>
        <div class="control">
          <input class="input is-small number-input" type="text" placeholder="width" v-model="chartWidth">
        </div>
        <div class="control">
          <span class="is-size-7">主题:</span>
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

      <div class="field is-grouped is-grouped-multiline button-line">
        <div class="control">
          <a class="button is-info is-small" @click="drawChart">
            绘图
          </a>
        </div>
        <div class="code-button">
          <button class="button is-small is-text"
            @click="showHelp = !showHelp"
            :class="{'has-text-grey-light': !showHelp}">
            <span class="icon">
              <v-icon name="question"/>
            </span>
          </button>
        </div>
      </div>

      <div v-if="showHelp">
        <article class="message is-info mb-3">
          <div class="message-body">
            请输入一个Javascript object作为本图表的option变量，如同在
            <a href="https://echarts.apache.org/examples/zh/index.html" target="_blank">ECHARTS示例</a>
            中的option变量一样<br/>
            不同的是，在option变量中的数据可以引用上面的表格的列，格式为"${列名}"，可以参考简单图表的option变量中的数据。<br/>
            如果数据需用多列数据组合而成，可以使用多个列名如同"${列名1,列名2}"，可以参考散点图的option变量中的数据。
          </div>
        </article>
      </div>

      <div class="notification is-danger is-light" v-if="error">
        <button class="delete" @click="error = ''"></button>
        {{error}}
      </div>

      <div class="columns">
        <div class="column is-half">
          <my-editor :editor-id="'editor1-' + view.id + '-' + chart.id"
            :editor-height="340" :language="'javascript'"
            @code-changed="updateOptionCode"></my-editor>
        </div>
        <div class="column is-half">
          <my-editor :editor-id="'editor2-' + view.id + '-' + chart.id"
            :editor-height="340" :language="'javascript'"
            :fixed="optionComputed"></my-editor>
        </div>
      </div>
     </div>
  </div>
</template>

<script>
import MyEditor from '@/components/MyEditor'

export default {
  name: 'custom-chart',
  components: {
    MyEditor
  },
  props: ['chart', 'view'],
  data () {
    return {
      chartHeight: 400,
      chartWidth: '100%',
      chartThemeOptions: ['light', 'dark', 'vintage', 'westeros', 'essos', 'wonderland', 'walden', 'chalk', 'infographic', 'macarons', 'roma', 'shine', 'purple-passion', 'halloween', 'ovilia-green'],
      chartTheme: 'light',
      optionCode: '',
      optionComputed: ' ',
      option: {},
      showHelp: false,
      error: ''
    }
  },
  computed: {
    format () {
      return this.view.data.format
    },
    columnMap () {
      var vm = this
      var columnMap = {}
      vm.format.forEach(function(c){
        columnMap[c.columnName] = {
          columnName: c.columnName,
          columnType: c.columnType,
          data: vm.view.data.rows.map(function (r) {
            if (c.columnType == 'num') {
              return parseFloat(r[c.columnName])
            }
            return r[c.columnName]
          })
        }
      })
      return columnMap
    },
    chartWidthStyle () {
      if (this.chartWidth.endsWith('%')) {
        return this.chartWidth
      }
      return this.chartWidth + 'px'
    },
  },
  methods: {
    updateOptionCode (code) {
      this.optionCode = code
    },
    looseJsonParse(obj){
      return Function('"use strict";return (' + obj + ')')();
    },
    drawChart () {
      this.error = ''
      var op = {}
      try {
        op = this.looseJsonParse(this.optionCode)
        this.fillData(op)
      }catch (err) {
        this.error = err
      }
      this.option = op
      this.optionComputed = JSON.stringify(op, null, 2)
      this.$nextTick(function(){
        const c = this.$refs['chart-' + this.chart.id]
        if (c) {
          c.setOption(op, true)
        }
      })
    },
    deleteChart () {
      this.$emit('delete-chart', this.chart)
    },
    fillData (op) {
      var vm = this
      Object.keys(op).forEach(function(key) {
        if (typeof op[key] === 'object' && op[key] != null) {
          vm.fillData(op[key])
        } else if (typeof op[key] === 'string' && op[key].startsWith('${') && op[key].endsWith('}')) {
          op[key] = vm.makeData(op[key])
        }
      })
    },
    makeData (s) {
      var vm = this
      var columns = s.substring(2, s.length - 1).split(',')
                     .map(n => n.trim())
                     .map(n => vm.columnMap[n])
                     .filter(c => c != undefined)
                     .map(c => c.data)
      if (!columns.length) {
        return s
      }
      var data = []
      for (var i = 0;i<columns[0].length;i++) {
        if (columns.length == 1) {
          data.push(columns[0][i])
        } else {
          data.push(columns.map(c => c[i]))
        }
      }
      return data
    }
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

.button-line {
  position: relative;

  .code-button {
    position: absolute;
    right: 0px;
  }
}

</style>