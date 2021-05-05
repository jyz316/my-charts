<template>
  <div>
    <article class="message is-info mb-3">
      <div class="message-body">
         请选择或输入Python脚本，并在本地执行用标准输出来产生数据。<br/>
         产生的数据可以是JSON或者CSV或者TSV格式
      </div>
    </article>

    <div class="field is-grouped">
      <p class="control">
        <a class="button is-info is-light" @click="openFile">
          打开
        </a>
      </p>
      <p class="control">
        <button class="button is-danger is-light" @click="saveCode">
          保存
        </button>
      </p>
    </div>

    <div class="field" v-if="fullpath">
      <div class="control">
        <input class="input is-static" type="text" readonly :value="fullpath">
      </div>
    </div>

    <div class="columns my-columns">
      <div class="column is-half">
        <div class="cmd-line">Python脚本：{{fullpath}}</div>
        <my-editor :editor-id="'cmd1-' + view.id"
          :editor-height="600" :language="'python'"
          :init-code="initCode"
          @code-changed="updatePythonCode"></my-editor>
        <div class="field has-addons mt-3">
          <p class="control">
            <span class="select">
              <select v-model="runWithArgument">
                <option :value="false">无命令行参数</option>
                <option :value="true">带命令行参数</option>
              </select>
            </span>
          </p>
          <p class="control is-expanded" v-if="runWithArgument">
            <input class="input" type="text" placeholder="命令行参数用空格分开" v-model="args">
          </p>
          <p class="control">
            <a class="button is-info" @click="runPython">
              运行
            </a>
          </p>
        </div>
      </div>
      <div class="column is-half">
        <div class="cmd-line">标准输出：</div>
        <my-editor :editor-id="'cmd2-' + view.id"
          :editor-height="600" :language="'bash'"
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
  name: 'python-source',
  components: {
    MyEditor
  },
  props: ['view'],
  data () {
    return {
      source: null,
      loading: false,
      error: '',
      output: '',
      runWithArgument: false,
      args: '',
      initCode: ''
    }
  },
  computed: {
    defaultPythonSource () {
      return this.$store.state.views.pythonSource
    },
    sourceLabel () {
      if (!this.source) {
        return ''
      }
      if (!this.source.filename) {
        return '新Python脚本'
      }
      if (this.source.filename) {
        return this.source.filename
      }
    },
    fullpath () {
      return this.source && this.source.fullpath
    },
    scriptPath () {
      return this.source && this.source.filepath
    },
    code () {
      return this.source && this.source.code
    }
  },
  methods: {
    updatePythonCode (code) {
      this.source.code = code
    },
    runPython () {
      var vm = this
      vm.loading = true
      vm.error = ''
      var script = {
        scriptPath: vm.scriptPath,
        args: vm.runWithArgument ? vm.args : '',
        code: vm.code
      }
      var pythonService = window.require('electron').remote.require('./services/python.service.js')
      console.log(script)
      pythonService.executePython(script, function(err) {
        vm.error = err
        vm.loading = false
      }, function (results) {
        vm.output = results.join('\n')
        var dataType = vm.checkOutput()
        if (dataType) {
          vm.commitData(dataType)
          vm.commitSource()
        } else {
          vm.error = 'Failed to load data from the output!'
        }
        vm.loading = false
      })
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
      this.source.label = this.sourceLabel
      var data = {
        viewId: this.view.id,
        source: JSON.parse(JSON.stringify(this.source))
      }
      this.$store.commit('views/updateSource', data)
    },
    saveCode () {
      var fileService = window.require('electron').remote.require('./services/file.service.js')
      if (this.fullpath) {
        fileService.writeFile(this.fullpath, this.code)
      } else {
        var result = fileService.selectAndWriteFile('Python file', ['py'], this.code)
        this.source.filename = result.filename
        this.source.filepath = result.filepath
        this.source.fullpath = result.fullpath
      }
    },
    openFile () {
      console.log('openFile')
      var fileService = window.require('electron').remote.require('./services/file.service.js')
      var result = fileService.selectAndOpenFile('Python file', ['py'])
      console.log(result)
      this.source.filename = result.filename
      this.source.filepath = result.filepath
      this.source.fullpath = result.fullpath
      this.source.code = result.data
      this.initCode = result.data
    }
  },
  mounted () {
    if (this.view.source.category == 'command') {
      this.source = JSON.parse(JSON.stringify(this.view.source))
    } else {
      this.source = JSON.parse(JSON.stringify(this.defaultPythonSource))
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