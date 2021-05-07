<template>
  <div>
    <article class="message is-info mb-3">
      <div class="message-body">
         请输入HTTP请求来产生数据。<br/>
         HTTP返回的数据应该是JSON格式，提取在你设定的路径上。
      </div>
    </article>

    <div class="field">
      <label class="label">URL</label>
      <div class="control">
        <input class="input my-text-input" type="text" placeholder="HTTP Address" v-model="source.url">
      </div>
    </div>

    <div class="field">
      <label class="label">数据路径</label>
      <div class="control">
        <input class="input my-text-input" type="text" placeholder="如何在HTTP返回的对象中找到数据，比如'path/to/data'" v-model="dataPath">
      </div>
    </div>

    <div class="field">
      <div class="control">
        <label class="checkbox">
          <input type="checkbox" v-model="withHeader">
          Reqest headers?
        </label>
      </div>
    </div>

    <div class="field" v-if="withHeader">
      <my-editor :editor-id="'http1-' + view.id" :editor-height="200"
        @code-changed="updateHeaderCode" :language="'javascript'"></my-editor>
    </div>

    <div class="field is-grouped">
      <div class="control">
        <button class="button is-link" :class="{'is-loading': loading}" @click="makeHttpRequest">提交</button>
      </div>
    </div>

    <div class="notification is-danger is-light" v-if="error">
      <button class="delete" @click="error = '', dataError = ''"></button>
      {{error}}
    </div>

    <div v-show="dataError">
      <my-editor :editor-id="'http2-' + view.id" :editor-height="240"
        :fixed="dataError" :language="'javascript'"></my-editor>
    </div>
  </div>
</template>

<script>
import MyEditor from '@/components/MyEditor'

export default {
  name: 'http-source',
  components: {
    MyEditor
  },
  props: ['view'],
  data () {
    return {
      source: {},
      loading: false,
      error: '',
      output: '',
      withHeader: false,
      header: '',
      dataPath: '',
      dataError: ''
    }
  },
  computed: {
    defaultHttpSource () {
      return this.$store.state.views.httpSource
    }
  },
  methods: {
    updateHeaderCode (code) {
      this.header = code
    },
    makeHttpRequest () {
      this.error = ''
      this.dataError = ''
      if (!this.source.url || !this.source.url.trim()) {
        this.error = 'URL cannot be empty'
        return
      }
      var headers = {}
      if (this.withHeader) {
        try {
          headers = JSON.parse(this.header)
        } catch (err) {
          this.error = 'Failed to parse header as JSON object'
          return
        }
      }
      this.loading = true
      this.$http.get(this.source.url, {headers: headers}).then(resp => {
        if (resp.status != 200) {
          this.error = resp
        } else {
          var path = this.dataPath.split('/').map(s => s.trim()).filter(s => s)
          var data = resp.body
          path.forEach(function(p) {
            data = data[p]
          })
          if (!Array.isArray(data) || !data.length) {
            this.error = 'Failed to load data on data path: ' + this.dataPath
            this.dataError = 'RESPONSE DATA: \n' + JSON.stringify(resp.body, null, 2)
          } else {
            this.output = JSON.stringify(data)
            this.commitData('.json')
            this.commitSource()
          }
          this.loading = false
        }
      }, resp => {
        this.error = 'Failed to make the Http request'
        this.loading = false
      })
    },
    commitData (dataType) {
      var data = {
        viewId: this.view.id,
        text: this.output,
        filename: dataType
      }
      this.$store.commit('views/loadFileData', data)
    },
    commitSource () {
      this.source.label = this.source.url.length > 10 ? this.source.url.slice(0, 10) + '...' : this.source.url
      var data = {
        viewId: this.view.id,
        source: JSON.parse(JSON.stringify(this.source))
      }
      this.$store.commit('views/updateSource', data)
    },
  },
  mounted () {
    if (this.view.source.category == 'http') {
      this.source = JSON.parse(JSON.stringify(this.view.source))
    } else {
      this.source = JSON.parse(JSON.stringify(this.defaultHttpSource))
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.cmd-line {
  font-weight: bold;
  margin-bottom: 5px;
}

.my-columns {
  margin-bottom: 0px;
}

.my-text-input {
  max-width: 600px;
}
</style>
