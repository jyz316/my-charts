<template>
  <div>
    <div class="box">
      <button class="delete is-pulled-right" @click="deleteChart"></button>
      <div class="field is-grouped is-grouped-multiline">
        <div class="control">
          <span class="is-size-7">平行坐标图</span>
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
          <input class="input is-small number-input" type="text" placeholder="height" v-model="chartWidth">
        </div>
        <div class="control">
          <label class="checkbox is-size-7">
            <input type="checkbox" class="my-checkbox" v-model="showSamples">
            展示样本
          </label>
        </div>
      </div>

      <div :id="'chart'+chart.id" class="parcoords" style="width:100%;" :style="{'height': chartHeight+'px', 'width': chartWidthStyle}"></div>

      <div v-show="showSamples" class="sample-table">
        <table class="table is-narrow is-fullwidth">
          <thead>
            <tr>
              <th v-for="(v,i) in variables" :key="'view-' + view.id + '-chart-' + chart.id + '-paral-coord-table-header-' + i">
                <div class="has-text-right">
                  {{format[v.dataIndex].columnName}}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in table" @mouseover="mouseoverRow(row)" @mouseout="mouseoutRow(row)"
              :key="'view-' + view.id + '-chart-' + chart.id + '-paral-coord-table-row-' + i">
              <td v-for="(cell, j) in row" class="has-text-right"
                :key="'view-' + view.id + '-chart-' + chart.id + '-paral-coord-table-row-' + i + '-' + j">
                {{cell}}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="field is-grouped is-grouped-multiline">
        <div class="control">
          <span class="is-size-7">变量：</span>
        </div>
      </div>

      <div class="field is-grouped is-grouped-multiline" v-for="(v, i) in variables" 
        :key="'view-' + view.id + '-chart-' + chart.id + '-paral-coord-var-' + i">
        <div class="control">
          <label class="checkbox is-size-7">
            <input type="checkbox" class="my-checkbox" v-model="v.show" @change="toggleShow()">
          </label>
        </div>
        <div class="control">
          <div class="select is-small">
            <select v-model="v.dataIndex" @change="dataIndexChanged(v)">
              <option v-for="(h, j) in format" v-bind:value="j"
                :key="'view-' + view.id + '-chart-' + chart.id + '-paral-coord-var-option-' + i + '-' + j">
                {{h.columnName}}
              </option>
            </select>
          </div>
        </div>
        <div class="control">
          <label class="radio">
            <input type="radio" name="colorBy" :value="i" v-model="colorBy">
            上色
          </label>
        </div>
      </div>

      <div class="field is-grouped is-grouped-multiline">
        <div class="control">
          <a class="button is-info is-small" @click="addVariable">
            添加变量
          </a>
        </div>
      </div>

      
     </div>
  </div>
</template>

<script>
import * as d3 from "d3"
import ParCoords from 'parcoord-es';

export default {
  name: 'parallel-coord-chart',
  props: ['chart', 'view'],
  data () {
    return {
      chartHeight: 400,
      chartWidth: '100%',
      variables: [],
      dimensions: {},
      data: [],
      colorBy: 0,
      table: [],
      parcoords: null,
      showSamples: false
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
    colorBy: function(val) {
      this.$nextTick(function(){
        this.rerender()
      })
    },
    chartHeight: function(val) {
      this.$nextTick(function(){
        this.rerender()
      })
    }
  },
  methods: {
    initOptions () {
      this.series = []
      this.addVariable()
    },
    addVariable () {
      var variable = {
        index: this.variables.length,
        dataIndex: 0,
        show: true
      }
      this.variables.push(variable)
      this.updateData(variable)
      this.rerender()
    },
    updateData (v) {
      delete v.max
      delete v.min
      for(var i=0;i<this.data.length;i++){
        var row = this.data[i]
        var value = this.rows[i][this.format[v.dataIndex].columnName]
        if(this.format[v.dataIndex].columnType == 'str'){
          v.type = 'string'
        }else{
          v.type = 'number'
          value = Number(value)
          v.max = v.max == undefined ? value : Math.max(v.max, value)
          v.min = v.min == undefined ? value : Math.min(v.min, value)
        }
        if(v.index < row.length){
          row[v.index] = value
        }else{
          row.push(value)
        }
      }
      this.sample(this.data)

      this.dimensions[v.index] = {
        type: v.type,
        title: this.format[v.dataIndex].columnName
      }
    },
    sample (rows) {
      this.table = []
      if(rows.length <= 10) {
        this.table = rows.slice()
        return
      }
      var interval = Math.floor(rows.length / 10)
      var i = 0
      while(i < rows.length){
        this.table.push(rows[i])
        i += interval
      }
    },
    rerender () {
      document.getElementById("chart"+this.chart.id).innerHTML = ""
      var hideAxis = []
      for(var i=0;i<this.variables.length;i++){
        var variable = this.variables[i]
        if(!variable.show){
          hideAxis.push(variable.index)
        }
      }

      this.parcoords = ParCoords()("#chart"+this.chart.id)
        .color(this.color)
        .alpha(0.4)
        .data(this.data)
        .dimensions(this.dimensions)
        .hideAxis(hideAxis)
        .composite("darker")
        .margin({ top: 30, left: 100, bottom: 30, right: 100 })
        .render()
        .shadows()
        .brushMode("1D-axes")

      this.parcoords.svg.selectAll(".dimension")
        .selectAll(".label")
        .style("font-size", "14px")

      this.parcoords.on("brush", this.onBrush)
    },
    color (d) {
      var v = this.variables[this.colorBy]
      var val = d[this.colorBy]
      var band = d3.scale.linear()
        .domain([v.min, v.max])
        .range(["steelblue", "brown"])
        .interpolate(d3.interpolateLab)
      return band(val)
    },
    dataIndexChanged (v) {
      this.updateData(v)
      this.rerender()
    },
    resizeChart (height) {
      this.rerender()
    },
    toggleShow () {
      this.$nextTick(function(){
        this.rerender()
      })
    },
    mouseoverRow (row) {
      this.parcoords.highlight([row])
    },
    mouseoutRow (row) {
      this.parcoords.unhighlight()
    },
    onBrush (rows) {
      this.sample(rows)
    },
    sample (rows) {
      this.table = []
      if(rows.length <= 10) {
        this.table = rows.slice()
        return
      }
      var interval = Math.floor(rows.length / 10)
      var i = 0
      while(i < rows.length){
        this.table.push(rows[i])
        i += interval
      }
    },
    deleteChart () {
      this.$emit('delete-chart', this.chart)
    },
  },
  mounted () {
    var v = {index: 0, dataIndex: 0, type: 'number', show: true}
    this.variables.push(v)
    for(var i=0;i<this.rows.length;i++){
      var value = Number(this.rows[i][this.format[v.dataIndex].columnName])
      this.data.push([value])
      v.max = v.max == undefined ? value : Math.max(v.max, value)
      v.min = v.min == undefined ? value : Math.min(v.min, value)
    }
    this.sample(this.data)
    this.dimensions[0] = {
      type: 'number',
      title: '#'
    }
    this.rerender()
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

</style>