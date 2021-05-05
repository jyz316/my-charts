<template>
  <div>
    <div class="notification is-success is-light rows-count">
      <span>找到{{rowsLength}}行数据。</span>
      <span v-if="maxRows && rowsLength > maxRows">显示前{{maxRows}}行数据。</span> 
      <button v-if="shouldCut" class="button is-text is-small" @click="toggleCut">{{cut ? '展开所有' : '收起'}}</button>
    </div>

    <div class="table-container" :class="{'cut-off': cut}">
      <table class="table is-striped is-hoverable is-narrow" :id="'view-' + view.id + '-table'">
        <thead>
          <tr>
            <th v-for="(h, i) in format" :key="'view-' + view.id + '-th-' + i" 
              class="clickable" :class="{'has-text-right': h.columnType == 'num'}"
              @click="sortData(i)">
              <span>{{h.columnName}}</span>
              <span v-if="sortBy[0] == i">
                <v-icon name="sort-up" v-if="sortBy[1]"></v-icon>
                <v-icon name="sort-down" v-if="!sortBy[1]"></v-icon>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, j) in showingRows" :key="'view-' + view.id + '-tr-' + j">
            <td v-for="(c, k) in format" :key="'view-' + view.id + '-td-' + j + '-' + k" :class="{'has-text-right': c.columnType == 'num'}">
              <span>{{r[c.columnName]}}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="table-cover" v-if="false" @click="toggleCut">
        <span class="icon-text">
          <span class="icon">
            <v-icon name="angle-double-down"/>
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'my-table',
  props: ['view'],
  data () {
    return {
      maxHeight: 500,
      tableHeight: 0,
      cut: true,
      maxRows: 1000
    }
  },
  computed: {
    rowsLength () {
      return this.view.data.rows.length
    },
    showingRows () {
      if (this.maxRows && this.rowsLength > this.maxRows) {
        return this.view.data.rows.slice(0, 1000)
      }
      return this.view.data.rows
    },
    format () {
      return this.view.data.format
    },
    sortBy () {
      return this.view.data.sortBy
    },
    shouldCut () {
      return this.tableHeight > this.maxHeight
    }
  },
  watch: {
    rowsLength: function (val) {
      console.log('rowslength changed')
      this.$nextTick(this.initTableContainer)
    }
  },
  methods: {
    sortData (index) {
      var data = {
        viewId: this.view.id,
        columnIndex: index
      }
      this.$store.commit('views/sortData', data)
    },
    toggleCut () {
      if (this.cut) {
        this.maxRows = 0
      } else {
        this.maxRows = 1000
      }
      this.cut = !this.cut
    },
    initTableContainer () {
      var table = document.getElementById('view-' + this.view.id + '-table')
      this.tableHeight = table.offsetHeight
      if (this.tableHeight > this.maxHeight) {
        this.cut = true
      } else {
        this.cut = false
      }
      console.log('done initTableContainer')
    }
  },
  mounted () {
    this.initTableContainer()
  }
}
</script>

<style lang="scss" scoped>
.rows-count {
  display: inline-block;
  margin-top: 20px;
  margin-bottom: 10px;
}

.clickable {
  cursor: pointer;
}

.table-container {
  overflow-x: auto;
}

.cut-off {
  max-height: 500px;
  overflow-y: auto;
}

.table-cover {
  position: absolute;
  height: 40px;
  top: 460px;
  width: 100%;
  background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
  cursor: pointer;
  text-align: center;
}

</style>
