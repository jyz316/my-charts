<template>
  <div>
    <article class="message is-info mb-3">
      <div class="message-body">
         请在本地选择一个SQLite数据库文件，并用SQL命令查询产生数据。
      </div>
    </article>

    <div class="field is-grouped">
      <div class="control">
        <a class="button is-info is-light" @click="openFile">
          选择SQLite数据库文件
        </a>
      </div>
      <div class="control is-expanded">
         <input class="input is-static" type="text" readonly v-model="fullpath">
      </div>
   </div>

    <div class="columns my-columns">
      <div class="column is-half">
        <div class="cmd-line">SQL输入：</div>
        <my-editor :editor-id="'sqlite1-' + view.id"
          :editor-height="240" :language="'sql'"
          @code-changed="updateCmdCode"></my-editor>
        <div class="buttons mt-3">
          <button class="button is-info" :class="{'is-loading': loading}" :disabled="!cmd.trim()" @click="runCmd">
            运行
          </button>
        </div>
      </div>
      <div class="column is-half">
        <div class="cmd-line">DB输出：</div>
        <my-editor :editor-id="'sqlite2-' + view.id"
          :editor-height="240" :language="'bash'"
          :fixed="output"></my-editor>
      </div>
    </div>

    <div class="notification is-danger is-light" v-if="error">
      <button class="delete" @click="error = ''"></button>
      {{error}}
    </div>
  </div>
</template>

<script>
import MyEditor from '@/components/MyEditor'

export default {
  name: 'sqlite-source',
  components: {
    MyEditor
  },
  props: ['view'],
  data () {
    return {
      source: null,
      loading: false,
      error: '',
      output: ''
    }
  },
  computed: {
    defaultSqliteSource () {
      return this.$store.state.views.sqliteSource
    },
    fullpath () {
      return this.source && this.source.fullpath
    },
    cmd () {
      if (this.source) {
        return this.source.cmd
      }
      return ''
    }
  },
  methods: {
    openFile () {
      var fileService = window.require('electron').remote.require('./services/file.service.js')
      var result = fileService.selectFile()
      if (result) {
        this.source.filename = result.filename
        this.source.fullpath = result.fullpath
        this.commitSource()
      }
    },
    updateCmdCode (code) {
      this.source.cmd = code
    },
    runCmd () {
      this.loading = true
      this.error = ''
      var cmdService = window.require('electron').remote.require('./services/sqlite.service.js')
      var vm = this
      cmdService.executeCmd(this.fullpath, this.cmd, function(err, rows){
        if (err) {
          vm.output = JSON.stringify(err, null, 2)
        } else if (!Array.isArray(rows) || !rows.length) {
          vm.err = 'Failed to load data from the output!'
        } else {
          vm.output = JSON.stringify(rows, null, 2)
          vm.commitData('.json')
          vm.commitSource()
        }
        vm.loading = false
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
      this.source.label = this.source.filename
      var data = {
        viewId: this.view.id,
        source: JSON.parse(JSON.stringify(this.source))
      }
      this.$store.commit('views/updateSource', data)
    }
  },
  mounted () {
    if (this.view.source.category == 'sqlite') {
      this.source = JSON.parse(JSON.stringify(this.view.source))
    } else {
      this.source = JSON.parse(JSON.stringify(this.defaultSqliteSource))
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
</style>