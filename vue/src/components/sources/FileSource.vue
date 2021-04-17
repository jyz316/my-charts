<template>
  <div>
    <article class="message is-info mb-3">
      <div class="message-body">
         请从本地选择一个CSV（每行一组数据，行内数据由逗号“,”分隔，文件名后缀为.csv）或者TSV（数据由Tab分隔，文件名后缀为.tsv）文件。<br/>
         文件的首行应为各数据列的名称。数据值不能含有逗号或Tab分隔。
      </div>
    </article>

    <div class="field has-addons">
      <div class="control">
        <div class="file has-name">
          <label class="file-label">
            <input class="file-input" type="file" accept=".csv,.tsv" @change="onFileChange">
            <span class="file-cta">
              <span class="file-icon">
                <v-icon name="upload"/>
              </span>
            </span>
            <span class="file-name">
              {{file ? file.name : '请选择一个文件'}}
            </span>
          </label>
        </div>
      </div>
      <div class="control">
        <button class="button is-info" :class="{'is-loading': loading}" :disabled="!file" @click="loadData">
          加载
        </button>
      </div>
    </div>

    <div class="notification is-danger is-light" v-if="error">
      {{error}}
    </div>
  </div>
</template>

<script>
export default {
  name: 'file-source',
  props: ['view'],
  data () {
    return {
      source: null,
      file: null,
      loading: false,
      error: ''
    }
  },
  computed: {
    defaultFileSource () {
      return this.$store.state.views.fileSource
    }
  },
  methods: {
    onFileChange (e) {
      var files = e.target.files || e.dataTransfer.files
      if (!files.length)
        return
      this.file = files[0]
    },
    loadData () {
      if (!this.file) {
        return
      }
      var vm = this
      vm.loading = true
      vm.error = ''
      const reader = new FileReader();
      reader.addEventListener('load', (event) => {
        try {
          vm.commitData(event.target.result)
          vm.commitSource()
        } catch (e) {
          vm.error = e
        }
        vm.loading = false
      })
      reader.readAsText(this.file)
    },
    commitData (text) {
      var data = {
        viewId: this.view.id,
        text: text,
        filename: this.file.name
      }
      this.$store.commit('views/loadCsvData', data)
    },
    commitSource () {
      this.source.file = this.file
      this.source.label = this.file.name
      var data = {
        viewId: this.view.id,
        source: JSON.parse(JSON.stringify(this.source))
      }
      this.$store.commit('views/updateSource', data)
    }
  },
  mounted () {
    if (this.view.source.category == 'file') {
      this.source = JSON.parse(JSON.stringify(this.view.source))
      this.file = this.source.file
    } else {
      this.source = JSON.parse(JSON.stringify(this.defaultFileSource))
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>

</style>