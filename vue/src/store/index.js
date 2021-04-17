import Vue from 'vue'
import Vuex from 'vuex'
import views from './modules/views'
import modals from './modules/modals'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    views: views,
    modals: modals
  }
})
