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
import "prismjs/themes/prism-coy.css"

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

.token.number {
  background-color: transparent;
  font-size: 12px;
  border-radius: 0px;
  display: inline-block;
  height: auto;
  margin-right: 0px;
  padding: 0px;
  min-width: 0px;
}

</style>
