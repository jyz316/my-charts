<template>
  <div>
    <div class="box">
      <button class="delete is-pulled-right" @click="deleteChart"></button>
      <div class="field is-grouped is-grouped-multiline">
        <div class="control">
          <span class="is-size-7">PCA Chart</span>
        </div>
        <div class="control" v-if="pca && groupOptions && groupOptions.length">
          <span class="is-size-7">Split points by:</span>
        </div>
        <div class="control"  v-if="pca && groupOptions && groupOptions.length">
          <div class="select is-small">
            <select v-model="groupOptionIndex">
              <option v-for="(opt, i) in groupOptions" v-bind:value="i"
                :key="'view-' + view.id + '-chart-' + chart.id + '-pca-group-option-' + i">
                {{opt.name}}
              </option>}
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
      </div>

      <div :id="'chart'+chart.id" @mouseup="chartMouseUp" :style="{'height': chartHeight + 'px', 'width': chartWidthStyle}">
      </div>

      <div class="notification is-success is-light" v-if="variances || xyVectors">
        <p v-if="variances">Variances: {{variances}}</p>
        <p v-if="xyVectors">X Vector: {{xyVectors[0]}}</p>
        <p v-if="xyVectors">Y Vector: {{xyVectors[1]}}</p>
      </div>

      <div class="field is-grouped is-grouped-multiline">
        <div class="control">
          <a class="button is-info is-small" @click="addVariable">
            添加数据
          </a>
        </div>
        <div class="control"  v-for="(v, i) in variables" :key="'view-' + view.id + '-chart-' + chart.id + '-pca-var-' + i">
          <div class="select is-small" :class="{'my-select-div': i > 0}">
            <select v-model="v.dataIndex" @change="dataIndexChanged(v)">
              <option v-for="(h, j) in format" v-bind:value="j" v-show="h.columnType == 'num'"
                :key="'view-' + view.id + '-chart-' + chart.id + '-pca-var-option-' + i + '-' + j">
                {{h.columnName}}
              </option>
            </select>
            <a v-if="i > 0" class="delete delete-variable-button" @click="deleteVariable(v)"></a>
          </div>
        </div>
         <div class="control">
          <a class="button is-primary is-small" :class="{'is-loading': computing}" v-show="showCompute" @click="computePCA">
            计算PCA
          </a>
        </div>
      </div>

      <div class="field is-grouped is-grouped-multiline" v-if="groups.length && !groupOptionIndex">
        <div class="control">
          <span class="group-label">Select points to split groups:</span>
        </div>
        <div class="control">
          <span v-for="(g, i) in groups" :key="'view-' + view.id + '-chart-' + chart.id + '-pca-manual-group-option-' + i">
            <label class="radio group-label">
              <input type="radio" :value="i" v-model="activeGroup">
              Group{{i}}
            </label>
            <a v-if="i > 0" class="delete delete-group-button" @click="deleteGroup(i)"></a>
            &nbsp;&nbsp;
          </span>
        </div>
        <div class="control">
          <a class="button is-small" @click="addGroup">
            Add group
          </a>
        </div>
        <div class="control">
          <a class="button is-info is-small" @click="exportGroup">
            Export data with group info
          </a>
        </div>
      </div>
     </div>
  </div>
</template>

<script>
import c3 from 'c3'
import PCA from 'ml-pca'

export default {
  name: 'pca-chart',
  props: ['chart', 'view', 'groupOptions', 'groupColors'],
  data () {
    return {
      chartHeight: 400,
      chartWidth: '100%',
      variables: [],
      self: {},
      showCompute: false,
      computing: false,
      pca: null,
      groups: [],
      activeGroup: 0,
      variances: null,
      xyVectors: null,
      showPoints: true,
      showErrors: false,
      xRange: null,
      yRange: null,
      exportUrl: null,
      groupOptionIndex: 0,
    }
  },
  computed: {
    rows () {
      return this.view.data.rows
    },
    format () {
      return this.view.data.format
    },
    chartWidthStyle () {
      if (this.chartWidth.endsWith('%')) {
        return this.chartWidth
      }
      return this.chartWidth + 'px'
    },
  },
  watch: {
    showPoints: function (val) {
      this.unselectAll()
      if(!this.pca) return
      for(var i=0;i<this.groups.length;i++){
        if(val){
          this.self.chart.show(['G' + i])
        }else{
          this.self.chart.hide(['G' + i])
        }
      }
    },
    showErrors: function (val) {
      this.unselectAll()
      if(!this.pca) return
      for(var i=0;i<this.groups.length;i++){
        if(val){
          this.self.chart.show(['G' + i + '_error'])
        }else{
          this.self.chart.hide(['G' + i + '_error'])
        }
      }
    },
    groupOptionIndex: function (val) {
      this.self.chart.unload()
      var vm = this
      setTimeout(function(){
        vm.drawPCA()
      }, 500)
    },
    chartWidthStyle: function (val) {
      this.chartHeightChanged()
    },
    chartHeight: function (val) {
      this.chartHeightChanged()
    },
  },
  methods: {
    deleteChart () {
      this.$emit('delete-chart', this.chart)
    },
    resizeChart (height) {
      if(height){
        this.self.chart.resize({height: height})
      }else{
        this.self.chart.resize()
      }
      var vm = this
      setTimeout(function(){
        vm.rescaleChart()
      }, 500)
    },
    chartHeightChanged () {
      this.resizeChart(this.chartHeight)
    },
    dataIndexChanged (variable) {
      if(this.variables.length > 1){
        this.showCompute = true
      }
      this.$nextTick(function(){
        variable.max = null
        variable.min = null
        for(var i=0;i<this.rows.length;i++){
          var row = this.rows[i]
          var cell = Number(row[this.format[variable.dataIndex].columnName])
          if(variable.max === null){
            variable.max = cell
            variable.min = cell
          }else{
            variable.max = Math.max(variable.max, cell)
            variable.min = Math.min(variable.min, cell)
          }
        }
      })
    },
    addVariable () {
      var variable = {
        dataIndex: 0,
        min: 0,
        max: this.rows.length - 1
      }
      this.variables.push(variable)
      if(this.variables.length > 1){
        this.showCompute = true
      }
    },
    deleteVariable (v) {
      var index = this.variables.indexOf(v)
      if(index > -1){
        this.variables.splice(index, 1)
      }
      if(this.variables.length > 1){
        this.showCompute = true
      }
    },
    computePCA () {
      this.groups = []
      this.activeGroup = 0
      this.xRange = null
      this.yRange = null
      this.self.chart.unload()

      this.computing = true
      var dataset = this.makeDataSet()
      this.pca = new PCA(dataset)
      this.variances = this.pca.getExplainedVariance()
      this.xyVectors = this.pca.getEigenvectors().slice(0, 2)
      var vectors = this.pca.predict(dataset)
      var group = {}
      for(var i=0;i<vectors.length;i++){
        var vector = vectors[i]
        var point = {}
        var rowNum = this.rows[i]['#'] - 1
        point.rowNum = rowNum
        point.index = i
        point.x = vector[0]
        point.y = vector[1]
        if(this.xRange){
          this.xRange[0] = Math.min(this.xRange[0], point.x)
          this.xRange[1] = Math.max(this.xRange[1], point.x)
          this.yRange[0] = Math.min(this.yRange[0], point.y)
          this.yRange[1] = Math.max(this.yRange[1], point.y)
        }else{
          this.xRange = [point.x, point.x]
          this.yRange = [point.y, point.y]
        }
        var sum = 0
        for(var j=2;j<vector.length;j++){
          sum += vector[j]*vector[j]
        }
        point.error = Math.sqrt(sum)
        var key = point.x + '_' + point.y
        if(!group[key]){
          group[key] = [point]
        }else{
          group[key].push(point)
        }
      }
      this.groups.push(group)

      var vm = this
      setTimeout(function(){
        vm.drawPCA()
        vm.rescaleChart()
        vm.computing = false
        vm.showCompute = false
      }, 500)
    },
    makeDataSet () {
      var dataset = []
      for(var i=0;i<this.rows.length;i++){
        var row = this.rows[i]
        var data = []
        for(var j=0;j<this.variables.length;j++){
          var variable = this.variables[j]
          var cell = Number(row[this.format[variable.dataIndex].columnName])
          cell = (cell - variable.min) / (variable.max - variable.min)
          data.push(cell)
        }
        dataset.push(data)
      }
      return dataset
    },
    drawPCA () {
      if(this.groupOptionIndex){
        this.drawPCAWithGroup()
      }else{
        for(var i=0;i<this.groups.length;i++){
          var points = []
          Object.values(this.groups[i]).forEach(function(pg){
            points = points.concat(pg)
          })

          var xData = points.map(function(p){
            return p.x
          })
          var xError = ['G'+i+'_error_x'].concat(xData)
          xData.unshift('G'+i+'_x')
          var yData = points.map(function(p){
            return p.y
          })
          yData.unshift('G'+i)
          var zError = points.map(function(p){
            return p.error
          })
          zError.unshift('G'+i+'_error')
          var xs = {}
          xs['G'+i] = 'G'+i+'_x'
          //xs['G'+i+'_error'] = 'G'+i+'_error_x'
          this.self.chart.load({ xs: xs, columns: [ xData, yData], type: 'scatter' })
          /*
          if(this.showPoints){
            this.self.chart.show(['G' + i])
          }else{
            this.self.chart.hide(['G' + i])
          }
          if(this.showErrors){
            this.self.chart.show(['G' + i + '_error'])
          }else{
            this.self.chart.hide(['G' + i + '_error'])
          }
          */
        }
      }
    },
    drawPCAWithGroup () {
      var allPoints = []
      for(var i=0;i<this.groups.length;i++){
        Object.values(this.groups[i]).forEach(function(pg){
          allPoints = allPoints.concat(pg)
        })
      }
      var groupOption = this.groupOptions[this.groupOptionIndex]
      var groupValues = Object.keys(groupOption.values)
      var groupPoints = {}
      for(var i=0;i<groupValues.length;i++){
        var groupValue = groupValues[i]
        groupPoints[groupValue] = []
      }
      for(var i=0;i<allPoints.length;i++){
        var point = allPoints[i]
        var row = this.rows[point.index]
        var groupValue = row[this.format[groupOption.dataIndex].columnName]
        groupPoints[groupValue].push(point)
      }
      for(var i=0;i<groupValues.length;i++){
        var groupValue = groupValues[i]
        var points = groupPoints[groupValue]
        var xData = points.map(function(p){
          return p.x
        })
        xData.unshift('data'+i+'_x')
        var yData = points.map(function(p){
          return p.y
        })
        yData.unshift('data'+i)
        var xs = {}
        xs['data' + i] = 'data' + i + '_x'
        var colors = {}
        colors['data' + i] = this.groupColors[i]
        this.self.chart.load({ xs: xs, columns: [ xData, yData ], colors: colors })
        var names = {}
        names['data' + i] = 'G(' + groupValue + ')'
        this.self.chart.data.names(names)
      }
    },
    rescaleChart () {
      var el = this.$el.querySelector('rect.c3-event-rect')
      if(!el) return
      var width = el.getAttribute('width')
      var height = el.getAttribute('height')
      var xInterval = (width - 10) / (this.xRange[1] - this.xRange[0])
      var yInterval = (height - 40) / (this.yRange[1] - this.yRange[0])
      if(xInterval > yInterval){
        var xCenter = (this.xRange[1] + this.xRange[0])/2
        var xRadius = (width - 10) / yInterval / 2
        var xRange = [xCenter - xRadius, xCenter + xRadius]
        this.self.chart.axis.range({
          max: {x: xRange[1], y: this.yRange[1]},
          min: {x: xRange[0], y: this.yRange[0]}
        })
      }else{
        var yCenter = (this.yRange[1] + this.yRange[0])/2
        var yRadius = (height - 40) / xInterval / 2
        var yRange = [yCenter - yRadius, yCenter + yRadius]
        this.self.chart.axis.range({
          max: {x: this.xRange[1], y: yRange[1]},
          min: {x: this.xRange[0], y: yRange[0]}
        })
      }
    },
    unselectAll () {
      if(this.groupOptionIndex){
        var groupOption = this.groupOptions[this.groupOptionIndex]
        var groupValues = Object.keys(groupOption.values)
        for(var i=0;i<groupValues.length;i++){
          this.self.chart.unselect(['data'+i])
        }
      }else{
        for(var i=0;i<this.groups.length;i++){
          this.self.chart.unselect(['G'+i, 'G'+i+'_error'])
        }
      }
    },
    chartMouseUp () {
      var vm = this
      setTimeout(function(){
        var selected = vm.self.chart.selected()
        if(selected.length){
          if(vm.groupOptionIndex){
            vm.unselectAll()
          }else{
            var aGroup = vm.groups[vm.activeGroup]
            for(var i=0;i<selected.length;i++){
              var pt = selected[i]
              if(pt.id.indexOf('error') > -1)
                continue
              var key = pt.x + '_' + pt.value
              if(aGroup[key])
                continue
              for(var j=0;j<vm.groups.length;j++){
                var g = vm.groups[j]
                if(g[key]){
                  aGroup[key] = g[key]
                  delete g[key]
                  break;
                }
              }
            }
            vm.unselectAll()
            setTimeout(function(){
              vm.drawPCA ()
            }, 500)
          }
        }
      }, 500)
    },
    addGroup () {
      this.groups.push({})
    },
    deleteGroup (index) {
      var group0 = this.groups[0]
      var group = this.groups[index]
      var keys = Object.keys(group)
      for(var i=0;i<keys.length;i++){
        var key = keys[i]
        group0[key] = group[key]
      }
      this.groups.splice(index, 1)
      this.activeGroup = 0
      
      this.self.chart.unload()
      var vm = this
      setTimeout(function(){
        vm.drawPCA ()
      }, 500)
    },
    exportGroup () {
      var points = {}
      for(var i=0;i<this.groups.length;i++){
        var group = this.groups[i]
        var pts = []
        Object.values(group).forEach(function(g){
          pts = pts.concat(g)
        })
        pts.forEach(function(p){
          points[p.rowNum] = i
        })
      }

      var rows = {}
      var vm = this
      for(var i=0;i<this.rows.length;i++){
        var r = this.format.map(function (h) {
          return vm.rows[i][h.columnName]
        })
        var row = r.slice(1)
        row.push(points[r[0] - 1])
        rows[r[0]-1] = row
      }

      var keys = Object.keys(rows)
      keys.sort(function(a, b){
        return Number(a) - Number(b)
      })
      var headers = this.format.slice(1).map(function (h) {
        return h.columnName
      })
      headers.push('group')
      var csv = headers.join(',') + '\r\n'
      for(var i=0;i<keys.length;i++){
        csv += rows[keys[i]].join(',') + '\r\n'
      }
      var blob = new Blob([csv], {type: 'file'})
      var exportUrl = URL.createObjectURL(blob)
      var a = document.createElement('a')
      a.href = exportUrl
      a.target = '_blank'
      a.download = 'groups.csv'
      a.click()
    }
  },
  mounted () {
    this.$nextTick(function(){
      this.self.chart = c3.generate({
        bindto: '#chart' + this.chart.id,
        data: { 
          columns: [], 
          selection: {
            enabled: true,
            draggable: true
          },
          type: 'scatter'
        },
        axis: {
          x: {
            tick: {
              fit: false,
              format: function (x) { return x.toPrecision(3) }
            },
          },
          y: {
            tick: {
              fit: false,
              format: function (y) { return y.toPrecision(3) }
            },
          },
        }
      })
      this.addVariable()
      this.addVariable()
    })
  }
}
</script>

<style lang="scss" scoped>

.number-input {
  width: 80px;
}

.my-checkbox {
  position: relative;
  top: 3px;
}

.my-select-div {
  margin-right:30px;
  position: relative;
}

.delete-variable-button {
  position: absolute;
  right: -25px;
  top: 5px;
}

.group-label {
  margin-top: 5px;
  font-size: 14px;
}

.delete-group-button {
  position: relative;
  top: 5px;
}

</style>