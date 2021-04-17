<template>
  <div id="app">
    <my-header/>
    <div>
      <router-view/>
    </div>
    <confirm-modal></confirm-modal>
  </div>
</template>

<script>
import MyHeader from '@/components/MyHeader'
import ConfirmModal from '@/components/modals/ConfirmModal'
import 'parcoord-es/dist/parcoords.css';
import "c3/c3.css";

export default {
  name: 'App',
  components: {
    MyHeader,
    ConfirmModal
  }
}
</script>

<style lang="scss">
@import "~bulma";

</style>
