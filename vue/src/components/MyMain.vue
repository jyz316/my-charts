<template>
  <div>
    <div v-for="v in views" :key="'view-' + v.id" v-show="v.id == activeView.id">
      <my-view :view="v"></my-view>
    </div>
  </div>
</template>

<script>
import MyView from '@/components/MyView'

export default {
  name: 'my-main',
  components: {
    MyView
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  computed: {
    views () {
      return this.$store.state.views.views
    },
    activeView () {
      console.log(xTARGETx)
      return this.$store.state.views.activeView
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
