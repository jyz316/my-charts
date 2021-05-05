// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import VueResource from 'vue-resource'
Vue.use(VueResource)

Vue.config.productionTip = false

import 'vue-awesome/icons/folder-plus'
import 'vue-awesome/icons/file'
import 'vue-awesome/icons/upload'
import 'vue-awesome/icons/sort-up'
import 'vue-awesome/icons/sort-down'
import 'vue-awesome/icons/angle-double-down'
import 'vue-awesome/icons/plus'
import 'vue-awesome/icons/code'
import 'vue-awesome/icons/question'
import 'vue-awesome/icons/terminal'
import 'vue-awesome/icons/brands/python'
import Icon from 'vue-awesome/components/Icon'
Vue.component('v-icon', Icon)


import ECharts from 'vue-echarts'
import { use, registerTheme } from 'echarts/core'
// 手动引入 ECharts 各模块来减小打包体积
import {
  SVGRenderer,
  CanvasRenderer
} from 'echarts/renderers'
import {
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  RadarChart,
  MapChart,
  TreeChart,
  TreemapChart,
  GraphChart,
  GaugeChart,
  FunnelChart,
  ParallelChart,
  SankeyChart,
  BoxplotChart,
  CandlestickChart,
  EffectScatterChart,
  LinesChart,
  HeatmapChart,
  PictorialBarChart,
  ThemeRiverChart,
  SunburstChart,
  CustomChart
} from 'echarts/charts'
import {
  GridComponent,
  PolarComponent,
  GeoComponent,
  SingleAxisComponent,
  ParallelComponent,
  CalendarComponent,
  GraphicComponent,
  ToolboxComponent,
  TooltipComponent,
  AxisPointerComponent,
  BrushComponent,
  TitleComponent,
  TimelineComponent,
  MarkPointComponent,
  MarkLineComponent,
  MarkAreaComponent,
  LegendComponent,
  DataZoomComponent,
  DataZoomInsideComponent,
  DataZoomSliderComponent,
  VisualMapComponent,
  VisualMapContinuousComponent,
  VisualMapPiecewiseComponent,
  AriaComponent,
  DatasetComponent,
  TransformComponent
} from 'echarts/components'

use([
  CanvasRenderer,
  SVGRenderer,
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  RadarChart,
  MapChart,
  TreeChart,
  TreemapChart,
  GraphChart,
  GaugeChart,
  FunnelChart,
  ParallelChart,
  SankeyChart,
  BoxplotChart,
  CandlestickChart,
  EffectScatterChart,
  LinesChart,
  HeatmapChart,
  PictorialBarChart,
  ThemeRiverChart,
  SunburstChart,
  CustomChart,
  GridComponent,
  PolarComponent,
  GeoComponent,
  SingleAxisComponent,
  ParallelComponent,
  CalendarComponent,
  GraphicComponent,
  ToolboxComponent,
  TooltipComponent,
  AxisPointerComponent,
  BrushComponent,
  TitleComponent,
  TimelineComponent,
  MarkPointComponent,
  MarkLineComponent,
  MarkAreaComponent,
  LegendComponent,
  DataZoomComponent,
  DataZoomInsideComponent,
  DataZoomSliderComponent,
  VisualMapComponent,
  VisualMapContinuousComponent,
  VisualMapPiecewiseComponent,
  AriaComponent,
  DatasetComponent,
  TransformComponent
]);

import chalk from "./assets/echart-themes/chalk.json";
registerTheme("chalk", chalk);
import essos from "./assets/echart-themes/essos.json";
registerTheme("essos", essos);
import halloween from "./assets/echart-themes/halloween.json";
registerTheme("halloween", halloween);
import infographic from "./assets/echart-themes/infographic.json";
registerTheme("infographic", infographic);
import macarons from "./assets/echart-themes/macarons.json";
registerTheme("macarons", macarons);
import oviliaGreen from "./assets/echart-themes/ovilia-green.json";
registerTheme("ovilia-green", oviliaGreen);
import purplePassion from "./assets/echart-themes/purple-passion.json";
registerTheme("purple-passion", purplePassion);
import roma from "./assets/echart-themes/roma.json";
registerTheme("roma", roma);
import shine from "./assets/echart-themes/shine.json";
registerTheme("shine", shine);
import vintage from "./assets/echart-themes/vintage.json";
registerTheme("vintage", vintage);
import walden from "./assets/echart-themes/walden.json";
registerTheme("walden", walden);
import westeros from "./assets/echart-themes/westeros.json";
registerTheme("westeros", westeros);
import wonderland from "./assets/echart-themes/wonderland.json";
registerTheme("wonderland", wonderland);


// 全局注册组件（也可以使用局部注册）
Vue.component('v-chart', ECharts)


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
