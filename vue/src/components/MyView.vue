<template>
  <div class="view-container">
    <button class="delete is-media delete-view-btn" @click="deleteView" v-if="views.length > 1"></button>

    <div class="field">
      <label class="label">数据源类型：</label>
      <div class="control">
        <div class="select">
          <select v-model="sourceCategory">
            <option v-for="s in sourceOptions" :key="'source-option-' + s.category" :value="s.category">
              {{s.categoryLabel}}
            </option>
          </select>
        </div>
      </div>
    </div>

    <file-source v-if="sourceCategory == 'file'" :view="view"></file-source>

    <my-table v-if="view.data" :view="view"></my-table>

    <div class="mt-6 mb-6" v-if="view.data">
      <div class="field has-addons">
        <div class="control">
          <span class="select">
            <select v-model="chartTypeInput">
              <option v-for="(co, i) in chartOptions" :key="'view-' + view.id + '-chart-option-' + i" :value="co.name">
                {{co.label}}
              </option>
            </select>
          </span>
        </div>
        <div class="control">
          <a class="button is-info" @click="addChart">
            <span class="icon-text">
              <span class="icon">
                <v-icon name="plus" />
              </span>
              <span>添加</span>
            </span>
          </a>
        </div>
      </div>

      <div v-show='false'>{{groupOptions}}</div>

      <div v-for="c in charts" :key="'view-' + view.id + '-chart-' + c.id" class="mt-5">
        <simple-chart v-if="c.chartType == 'simple'" :chart="c" :view="view" @delete-chart="deleteChart"></simple-chart>
        <simple-xy-chart v-if="c.chartType == 'xy'" :chart="c" :view="view" @delete-chart="deleteChart"></simple-xy-chart>
        <parallel-coord-chart v-if="c.chartType == 'paral-coord'" :chart="c" :view="view" @delete-chart="deleteChart"></parallel-coord-chart>
        <pca-chart v-if="c.chartType == 'pca'" :chart="c" :view="view" :groupOptions="groupOptions" :groupColors="groupColors" @delete-chart="deleteChart"></pca-chart>
        <histogram-chart v-if="c.chartType == 'histogram'" :chart="c" :view="view" :groupOptions="groupOptions" :groupColors="groupColors" @delete-chart="deleteChart"></histogram-chart>
        <histogram-array v-if="c.chartType == 'histogram-array'" :chart="c" :view="view" :groupOptions="groupOptions" :groupColors="groupColors" @delete-chart="deleteChart"></histogram-array>
        <correlation-matrix v-if="c.chartType == 'correlation-metrix'" :chart="c" :view="view" @delete-chart="deleteChart"></correlation-matrix>
      </div>
    </div>
  </div>
</template>

<script>
import FileSource from '@/components/sources/FileSource'
import MyTable from '@/components/MyTable'
import SimpleChart from '@/components/charts/SimpleChart'
import SimpleXyChart from '@/components/charts/SimpleXyChart'
import ParallelCoordChart from '@/components/charts/ParallelCoordChart'
import PcaChart from '@/components/charts/PcaChart'
import HistogramChart from '@/components/charts/HistogramChart'
import HistogramArray from '@/components/charts/HistogramArray'
import CorrelationMatrix from '@/components/charts/CorrelationMatrix'


export default {
  name: 'my-view',
  components: {
    FileSource,
    MyTable,
    SimpleChart,
    SimpleXyChart,
    ParallelCoordChart,
    PcaChart,
    HistogramChart,
    HistogramArray,
    CorrelationMatrix
  },
  props: ['view'],
  data () {
    return {
      sourceCategory: 'file',
      chartOptions: [
        {name: 'simple', label: '简单图表'},
        {name: 'xy', label: '散点图'},
        {name: 'paral-coord', label: '平行坐标图'},
        {name: 'pca', label: 'PCA分析'},
        {name: 'histogram', label: '直方图'},
        {name: 'histogram-array', label: '数据分布图'},
        {name: 'correlation-metrix', label: '相关性矩阵'},
      ],
      chartTypeInput: 'simple',
      count: 0,
      charts: [],
      groupColors: ['#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf', '#1f77b4']
    }
  },
  computed: {
    views () {
      return this.$store.state.views.views
    },
    sourceOptions () {
      return this.$store.state.views.sources
    },
    rows () {
      return this.view.data.rows
    },
    format () {
      return this.view.data.format
    },
    groupOptions () {
      var groupOptions = []
      if(this.rows.length > 10){
        for(var i=0;i<this.format.length;i++){
          var opt = {name: this.format[i].columnName, dataIndex: i, values: {}}
          groupOptions.push(opt)
        }
        for(var i=0;i<this.rows.length;i++){
          var row = this.rows[i]
          for(var j=0;j<this.format.length;j++){
            var value = row[this.format[j].columnName]
            var opt = groupOptions[j]
            if(!opt.values) continue
            if(opt.values[value]) continue
            opt.values[value] = true
            if(Object.keys(opt.values).length > 10){
              opt.values = null
            }
          }
        }
        for(var i=groupOptions.length-1;i>=0;i--){
          var opt = groupOptions[i]
          if(!opt.values){
            groupOptions.splice(i, 1)
          }
        }
        groupOptions.unshift({name: 'none'})
      }
      return groupOptions
    }
  },
  methods: {
    deleteView () {
      var confirm = {
        title: '删除窗口',
        message: '确认删除本窗口?',
        button: '确认',
        callback: {
          context: this,
          method: this.deleteViewConfirmed,
          args: []
        }
      }
      this.$store.commit('modals/openConfirmModal', confirm)
    },
    deleteViewConfirmed () {
      this.$store.commit('views/deleteView', this.view.id)
    },
    addChart () {
      this.count += 1
      this.charts.unshift({
        id: this.count,
        chartType: this.chartTypeInput
      })
    },
    deleteChart (chart) {
      var index = this.charts.indexOf(chart)
      if(index > -1){
        this.charts.splice(index, 1)
      }
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.view-container {
  padding-top: 20px;
  padding-bottom: 20px;
  padding-left: 24px;
  padding-right:24px;
}
.delete-view-btn {
   float: right;
   position: relative;
   right: 10px;
}
</style>