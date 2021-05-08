<template>
  <div>
    <div class="box">
      <button class="delete is-pulled-right" @click="deleteChart"></button>
      <div class="field is-grouped is-grouped-multiline">
        <div class="control">
          <span class="is-size-7">直方图</span>
        </div>
        <div class="control" v-if="variables.length == 1 && groupOptions && groupOptions.length">
          <span class="is-size-7">Split points by:</span>
        </div>
        <div class="control"  v-if="variables.length == 1 && groupOptions && groupOptions.length">
          <div class="select is-small">
            <select v-model="groupOptionIndex">
              <option v-for="(opt, i) in groupOptions" v-bind:value="i"
                :key="'view-' + view.id + '-chart-' + chart.id + '-histo-group-option-' + i">
                {{opt.name}}
              </option>}
            </select>
          </div>
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
      </div>

      <div :id="'chart'+chart.id" :style="{'height': chartHeight + 'px', 'width': chartWidthStyle}">
        histro
      </div>

      <div class="field is-grouped is-grouped-multiline" v-for="(v, i) in variables" 
        :key="'view-' + view.id + '-chart-' + chart.id + '-histo-var-' + i">
        <div class="control">
          <div class="select is-small">
            <select v-model="v.dataIndex" @change="dataIndexChanged(v)">
              <option v-for="(h, j) in format" v-bind:value="j" v-show="h.columnType == 'num'"
                :key="'view-' + view.id + '-chart-' + chart.id + '-paral-coord-var-option-' + i + '-' + j">
                {{h.columnName}}
              </option>
            </select>
          </div>
        </div>
        <div class="control">
          <div class="select is-small">
            <select class="select" v-model="v.lineType" @change="lineTypeChanged(v)">
              <option>line</option>
              <option>area</option>
              <option>spline</option>
              <option>area-spline</option>
              <option>step</option>
              <option>area-step</option>
              <option>bar</option>
            </select>
          </div>
        </div>
      </div>

      <div class="field is-grouped is-grouped-multiline">
        <div class="control">
          <a class="button is-info is-small" @click="addVariable">
            添加数据
          </a>
        </div>
        <div class="control">
          <span class="is-size-7">分布：</span>
        </div>
        <div class="control">
          <input class="input is-small bins-input" type="text" placeholder="如,a,b,表示[<a][a-b][>=b]" v-model="binsInput" @dblclick="binsChanged">
        </div>
        <div class="control">
          <a class="button is-primary is-small" v-show="variables.length && binsInput.length" @click="binsChanged">
            计算
          </a>
        </div>
      </div>
      
     </div>
  </div>
</template>

<script>
import c3 from 'c3'

export default {
  name: 'histogram-chart',
  props: ['chart', 'view', 'groupOptions', 'groupColors'],
  data () {
    return {
      chartHeight: 400,
      chartWidth: '100%',
      variables: [],
      dataMap: {},
      bins: [],
      binsInput: '',
      self: {},
      groupOptionIndex: 0
    }
  },
  computed: {
    format () {
      return this.view.data.format
    },
    rows () {
      var vm = this
      return vm.view.data.rows.map(function (row) {
        return vm.format.map(function (h) {
          return row[h.columnName]
        })
      })
    },
    headers () {
      return this.format.map(function (h) {
        return h.columnName
      })
    },
    chartWidthStyle () {
      if (this.chartWidth.endsWith('%')) {
        return this.chartWidth
      }
      return this.chartWidth + 'px'
    },
  },
  watch: {
    groupOptionIndex: function (val) {
      this.self.chart.unload()
      var vm = this
      setTimeout(function(){
        if(val){
          var groupOption = vm.groupOptions[vm.groupOptionIndex]
          var groupValues = Object.keys(groupOption.values)
          var groupRows = {}
          for(var i=0;i<groupValues.length;i++){
            var groupValue = groupValues[i]
            groupRows[groupValue] = []
          }
          for(var i=0;i<vm.rows.length;i++){
            var row = vm.rows[i]
            var groupValue = row[groupOption.dataIndex]
            groupRows[groupValue].push(row)
          }
          vm.groupRows = groupRows
        }
        for(var i=0;i<vm.variables.length;i++){
          var variable = vm.variables[i]
          vm.updateColumn(variable)
        }
      }, 500)
    },
    chartHeight: function (val) {
      this.$nextTick(function(){
        this.resizeChart(this.chartHeight)
      })
    },
    chartWidthStyle: function (val) {
      this.$nextTick(function(){
        this.resizeChart(this.chartHeight)
      })
    }
  },
  methods: {
    deleteChart () {
      this.$emit('delete-chart', this.chart)
    },
    updateColumn (variable) {
      //this.self.chart.unload()
      var vm = this
      setTimeout(function(){
        var histogram
        var data
        if(vm.groupOptionIndex){
          histogram = vm.computeHistogramWithGroup(variable)
          data = histogram.data
        }else{
          data = vm.computeHistogram(variable)
        }

        data = ['data' + variable.index].concat(data)

        vm.self.chart.load({ columns: [ data ]})
        var names = {}
        names['data' + variable.index] = variable.name
        vm.self.chart.data.names(names)

        if(vm.groupOptionIndex){
          var columns = []
          var colors = {}
          var names = {}
          var types = {}
          var groupOption = vm.groupOptions[vm.groupOptionIndex]
          var groupValues = Object.keys(groupOption.values)
          for(var i=0;i<groupValues.length;i++){
            var groupValue = groupValues[i]
            var column = histogram.groupData[groupValue]
            column.unshift('data' + variable.index + '_' + i)
            columns.push(column)
            colors['data' + variable.index + '_' + i] = vm.groupColors[i]
            names['data' + variable.index + '_' + i] = groupValue
            types['data' + variable.index + '_' + i] = variable.lineType
          }
          vm.self.chart.load({ columns: columns, colors: colors, types: types })
          vm.self.chart.data.names(names)
        }

        vm.self.chart.axis.range({
          min: {y: 0}
        })
      }, 500)
    },
    dataIndexChanged (variable) {
      var name = this.headers[variable.dataIndex]
      variable.name = name
      this.loadData(variable)
      this.updateColumn(variable)
    },
    addVariable () {
      var variable = {
        index: this.variables.length,
        dataIndex: 0,
        name: '#',
        lineType: 'line'
      }
      this.variables.push(variable)
      this.loadData(variable)
      if(this.variables.length > 1 && this.groupOptionIndex){
        this.groupOptionIndex = 0
      }else{
        this.updateColumn(variable)
      }
    },
    loadData (variable) {
      if(!this.dataMap[variable.dataIndex]){
        var data = []
        for(var i=0;i<this.rows.length;i++){
          data.push(Number(this.rows[i][variable.dataIndex]))
        }
        this.dataMap[variable.dataIndex] = data
      }
    },
    resizeChart (height) {
      if(height){
        this.self.chart.resize({height: height})
      }else{
        this.self.chart.resize()
      }
    },
    lineTypeChanged (variable) {
      this.$nextTick(function(){
        var v = this.variables[variable.index]
        this.self.chart.transform(v.lineType, 'data' + v.index)
        if(this.groupOptionIndex){
          var groupOption = this.groupOptions[this.groupOptionIndex]
          var groupValues = Object.keys(groupOption.values)
          for(var i=0;i<groupValues.length;i++){
            this.self.chart.transform(v.lineType, 'data' + v.index + '_' + i)
          }
        }
      })
    },
    chartHeightChanged () {
      this.$nextTick(function(){
        this.resizeChart(this.chartHeight)
      })
    },
    binsChanged () {
      var ss = this.binsInput.split(',')
      if(ss.length < 2) return
      var minRange = (ss[0].trim() == '')
      var maxRange = (ss[ss.length-1].trim() == '')
      if(minRange){
        ss.splice(0, 1)
      }
      if(maxRange){
        ss.splice(ss.length-1, 1)
      }

      var pts = []
      for(var i=0;i<ss.length;i++){
        var s = ss[i].trim()
        if(s == '') return
        if(s[0] == '(' && s[s.length-1] == ')'){
          var sp = Number(s.slice(1, -1))
          if(sp === NaN) return
          if(i == 0 || i == ss.length - 1) return
          if(sp <= 0) return

          var scale = 1
          while(Math.round(sp * scale) != sp * scale){
            scale *= 10
          }
          var min = pts[pts.length - 1]
          if(!ss[i+1].length || ss[i+1][0] == '(') return
          var max = Number(ss[i+1])
          if(max === NaN) return
          if(max <= min) return
          var pt = Math.round((min + sp) * scale) / scale
          while(pt < max){
            pts.push(pt)
            pt = Math.round((pt + sp) * scale) / scale
          }

        }else{
          var n = Number(s)
          if(n === NaN) return
          if(n <= pts[pts.length-1]) return
          pts.push(n)
        }
      }

      if(!pts.length) return
      var bins = []
      if(minRange){
        bins.push([null, pts[0]])
      }
      for(var i=0;i<pts.length-1;i++){
        bins.push([pts[i], pts[i+1]])
      }
      if(maxRange){
        bins.push([pts[pts.length-1], null])
      }

      this.bins = bins
      this.updateAllColumns()
    },
    updateAllColumns () {
      for(var i=0;i<this.variables.length;i++){
        this.updateColumn(this.variables[i])
      }
    },
    computeHistogram (variable) {
      var data = this.dataMap[variable.dataIndex]
      var counts = this.bins.map(function(b){
        return 0
      })
      for(var i=0;i<data.length;i++){
        var d = data[i]
        for(var j=0;j<this.bins.length;j++){
          var b = this.bins[j]
          if(b[0] === null){
            if(d < b[1]){
              counts[j] = counts[j] + 1
              break
            }
          }else if(b[1] === null){
            if(d >= b[0]){
              counts[j] = counts[j] + 1
              break
            }
          }else{
            if(d >= b[0] && d < b[1]){
              counts[j] = counts[j] + 1
              break
            }else if(j == this.bins.length-1 && d == b[1]){
              counts[j] = counts[j] + 1
              break
            }
          }
        }
      }

      var len = data.length

      return counts.map(function(c){
        return Math.round(c / len * 10000) / 100
      })
    },
    computeHistogramWithGroup (variable) {
      var counts = this.bins.map(function(b){
        return 0
      })

      var groupOption = this.groupOptions[this.groupOptionIndex]
      var groupValues = Object.keys(groupOption.values)
      var groupCounts = {}
      for(var i=0;i<groupValues.length;i++){
        var groupValue = groupValues[i]
        groupCounts[groupValue] = counts.slice()
      }

      for(var i=0;i<this.rows.length;i++){
        var row = this.rows[i]
        var d = Number(row[variable.dataIndex])
        if(isNaN(d)) continue
        var groupValue = row[groupOption.dataIndex]
        for(var j=0;j<this.bins.length;j++){
          var b = this.bins[j]
          if(b[0] === null){
            if(d < b[1]){
              counts[j] = counts[j] + 1
              groupCounts[groupValue][j] = groupCounts[groupValue][j] + 1
              break
            }
          }else if(b[1] === null){
            if(d >= b[0]){
              counts[j] = counts[j] + 1
              groupCounts[groupValue][j] = groupCounts[groupValue][j] + 1
              break
            }
          }else{
            if(d >= b[0] && d < b[1]){
              counts[j] = counts[j] + 1
              groupCounts[groupValue][j] = groupCounts[groupValue][j] + 1
              break
            }else if(j == this.bins.length-1 && d == b[1]){
              counts[j] = counts[j] + 1
              groupCounts[groupValue][j] = groupCounts[groupValue][j] + 1
              break
            }
          }
        }
      }

      var len = this.rows.length

      var data = counts.map(function(c){
        return Math.round(c / len * 10000) / 100
      })

      var groupData = {}
      for(var i=0;i<groupValues.length;i++){
        var groupValue = groupValues[i]
        groupData[groupValue] = groupCounts[groupValue].map(function(c){
          return Math.round(c / len * 10000) / 100
        })
      }

      return {data: data, groupData: groupData}
    },
    formatXAxis (d) {
      var b = this.bins[d]
      if(b[0] === null) return '<' + b[1]
      if(b[1] === null) return '>=' + b[0]
      return b[0] + '~' + b[1]
    }
  },
  mounted () {
    this.$nextTick(function(){
      this.self.chart = c3.generate({
        bindto: '#chart' + this.chart.id,
        axis: {
          x: {
            tick: { format: this.formatXAxis },
            padding: {right: 0.5},
          },
          y: {
            tick: {
              format: function(d){
                return Math.round(d*100) / 100
              }
            },
            label: {
              text: '%',
              position: 'outer-middle'
            }
          }
        },
        data: { columns: [] },
        point: { show: false }
      })
    })
  }
}
</script>

<style lang="scss" scoped>

.number-input {
  width: 80px;
}

</style>