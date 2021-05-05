<template>
  <div>
    <article class="message is-info mb-3">
      <div class="message-body">
         请输入一个命令将在本地执行用标准输出来产生数据。<br/>
         产生的数据可以是JSON或者CSV或者TSV格式
      </div>
    </article>

    <div class="columns my-columns">
      <div class="column is-half">
        <div class="cmd-line">命令行输入：</div>
        <my-editor :editor-id="'cmd1-' + view.id"
          :editor-height="240" :language="'bash'"
          @code-changed="updateCmdCode"></my-editor>
        <div class="buttons mt-3">
          <button class="button is-info" :class="{'is-loading': loading}" :disabled="!cmd.trim()" @click="runCmd">
            运行
          </button>
        </div>
      </div>
      <div class="column is-half">
        <div class="cmd-line">命令行输出：</div>
        <my-editor :editor-id="'cmd2-' + view.id"
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
  name: 'command-source',
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
    defaultCommandSource () {
      return this.$store.state.views.commandSource
    },
    cmd () {
      if (this.source) {
        return this.source.cmd
      }
      return ''
    }
  },
  methods: {
    updateCmdCode (code) {
      this.source.cmd = code
    },
    runCmd () {
      this.loading = true
      this.error = ''
      var cmdService = window.require('electron').remote.require('./services/cmd.service.js')
      var output = cmdService.executeCmd(this.source.cmd).output
      this.output = output
      var dataType = this.checkOutput()
      if (dataType) {
        this.commitData(dataType)
        this.commitSource()
      } else {
        this.error = 'Failed to load data from the output!'
      }
      this.loading = false
    },
    checkOutput () {
      var dataType = ''
      try {
        var obj = JSON.parse(this.output)
        if (Array.isArray(obj) && obj.length && typeof obj[0] === 'object') {
          dataType = '.json'
        }
      } finally {
        if (dataType) {
          return dataType
        }
        var re=/\r\n|\n\r|\n|\r/g
        var lines = this.output.trim().replace(re, '\n').split('\n').filter(function(l){
          return l.trim()
        })
        if (lines.length < 2) {
          return ''
        }
        if (lines[0].includes('\t') && lines[0].includes('\t') && lines[0].split('\t').length == lines[1].split('\t').length) {
          return '.tsv'
        }
        if (lines[0].includes(',') && lines[0].includes(',') && lines[0].split(',').length == lines[1].split(',').length) {
          return '.csv'
        }
        return ''
      }
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
      this.source.label = this.cmd.length > 10 ? this.cmd.slice(0, 10) + '...' : this.cmd
      var data = {
        viewId: this.view.id,
        source: JSON.parse(JSON.stringify(this.source))
      }
      this.$store.commit('views/updateSource', data)
    }
  },
  mounted () {
    if (this.view.source.category == 'command') {
      this.source = JSON.parse(JSON.stringify(this.view.source))
    } else {
      this.source = JSON.parse(JSON.stringify(this.defaultCommandSource))
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