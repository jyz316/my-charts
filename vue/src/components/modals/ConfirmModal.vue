<template>
  <div class="modal"
      :class="{'is-active': opened}">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">{{title}}</p>
        <button class="delete" @click="close"></button>
      </header>
      <section class="modal-card-body">
          <div>{{message}}</div>
      </section>
      <footer class="modal-card-foot">
        <a class="button is-danger" @click="confirm">{{button}}</a>
        <a class="button" @click="close" v-if="callback">Cancel</a>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'confirm-modal',
  computed: {
    opened () {
      return this.$store.state.modals.confirmModal.opened
    },
    title () {
      return this.$store.state.modals.confirmModal.title
    },
    message () {
      return this.$store.state.modals.confirmModal.message
    },
    button () {
      return this.$store.state.modals.confirmModal.button
    },
    callback () {
      return this.$store.state.modals.confirmModal.callback
    }
  },
  methods: {
    close(){
      this.$store.commit('modals/closeConfirmModal')
    },
    confirm(){
      console.log(this.callback)
      if(this.callback){
        var method = this.callback.method
        var context = this.callback.context
        var args = this.callback.args
        method.apply(context, args)
      }
      this.close()
    }
  },
}
</script>

<style lang="scss" scoped>

</style>