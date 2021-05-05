<template>
  <div class="editor-container">
    <button class="delete clear-button" v-if="fixed === undefined" @click="clearCode"></button>
    <div :id="editorId" class="my-editor" :style="{'height': editorHeight + 'px', 'tab-size': tabSize}"></div>
  </div>
</template>

<script>
import {CodeJar} from 'codejar'
import {withLineNumbers} from 'codejar/linenumbers';
import Prism from 'prismjs'
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';


export default {
  name: 'my-editor',
  props: ['editorId', 'editorHeight', 'language', 'fixed', 'initCode'],
  data () {
    return {
      jar: null
    }
  },
  computed: {
    tabSize () {
      return this.language == 'python' ? 4 : 2
    },
  },
  watch: {
    fixed: function (val) {
      this.jar.updateCode(val)
    },
    initCode: function (val) {
      this.jar.updateCode(val)
    }
  },
  methods: {
    clearCode () {
      this.jar.updateCode('')
    }
  },
  mounted () {
    var vm = this
    vm.jar = CodeJar(document.querySelector('#' + this.editorId), withLineNumbers(function(div) {
      var code = div.textContent
      div.innerHTML = Prism.highlight(code, Prism.languages[vm.language], vm.language)
    }), {tab: ' '.repeat(vm.tabSize)})
    vm.jar.onUpdate(code => {
      vm.$emit('code-changed', code)
    })
    vm.$nextTick(function(){
      if (vm.fixed !== undefined) {
        var div = document.getElementById(vm.editorId);
        div.removeAttribute('contenteditable')
        vm.jar.updateCode(vm.fixed)
      }
    })
  }
}
</script>

<style lang="scss" scoped>

.my-editor {
  border-radius: 6px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: normal;
  line-height: 18px;
  padding: 10px;
}

.editor-container {
  position: relative;

  .clear-button {
    position: absolute;
    right: 20px;
    top: 10px;
    z-index: 100;
  }
}


</style>
