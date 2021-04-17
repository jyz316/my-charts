// helpers
var fileSource = {category: 'file', categoryLabel: '文件', file: null, icon: 'file', label: ''}

function createView (id) {
  return {
    id: id,
    source: fileSource,
    data: null
  }
}

var firstView = createView(1)

function findViewIndex (viewId, views) {
  for(var i = 0; i < views.length; i++) {
    if (viewId == views[i].id) {
      return i
    }
  }
}

function parseCsvData (text, filename) {
  var re=/\r\n|\n\r|\n|\r/g
  var lines = splitLines (text)
  var br = filename.toLowerCase().endsWith('.tsv') ? '\t' : ','
  var format = splitValues(lines[0], br).map(function (h) {
    return {columnName: h, columnType: null}
  })
  
  var rows = []
  for (var i=1;i<lines.length;i++) {
    if (lines[i].trim()) {
      var row = {'#': rows.length + 1}
      var values = splitValues(lines[i], br)
      if (values.length < format.length) {
        continue
      }
      for (var j=0;j<values.length;j++) {
        var str = values[j]
        row[format[j].columnName] = str
        if (isNaN(parseFloat(str))) {
          format[j].columnType = 'str'
        } else if (format[j].columnType == null) {
          format[j].columnType = 'num'
        }
      }
      rows.push(row)
    }
  }
  format.unshift({columnName: '#', columnType: 'num'})

  return {rows: rows, format: format, sortBy: [0, true]}
}

function sortDataByColumnIndex (view, columnIndex) {
  var column = view.data.format[columnIndex]
  var sortBy = view.data.sortBy
  var asc = sortBy[0] == columnIndex ? !sortBy[1] : true
  view.data.rows.sort(function(a, b) {
    var aVal = a[column.columnName]
    var bVal = b[column.columnName]
    if (column.columnType == 'num') {
      aVal = parseFloat(aVal)
      bVal = parseFloat(bVal)
      return asc ? (aVal - bVal) : bVal - aVal 
    }
    return asc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
  })
  view.data.sortBy = [columnIndex, asc]
}

function splitLines (text) {
  var re=/\r\n|\n\r|\n|\r/g
  return text.trim().replace(re, '\n').split('\n').filter(function(l){
    return l.trim()
  })
}

function splitValues (line, br) {
  return line.trim().split(br).map(function (v) {
    return v.trim().replace(/^("|')+|("|')+$/g, '');
  })
}

// initial state
export const state = {
  count: 1,
  views: [firstView],
  activeView: firstView,
  sources: [fileSource],
  fileSource: fileSource
}

// mutations
export const mutations = {

  setActive (state, viewId) {
    var index = findViewIndex(viewId, state.views)
    if (index != undefined) {
      state.activeView = state.views[index]
    }
  },

  addView (state) {
    state.count += 1
    var newView = createView(state.count) 
    state.views.push(newView)
    state.activeView = newView
  },

  deleteView (state, viewId) {
    var index = findViewIndex(viewId, state.views)
    if (index != undefined) {
      state.views.splice(index, 1)
    }
    if (state.views.length) {
      state.activeView = state.views[0]
    } else {
      state.activeView = null
    }
  },

  updateSource (state, data) {
    var index = findViewIndex(data.viewId, state.views)
    if (index != undefined) {
      state.views[index].source = data.source
    }
  },

  clearData (state, viewId) {
    var index = findViewIndex(data.viewId, state.views)
    if (index != undefined) {
      state.views[index].data = null
    }
  },

  loadCsvData (state, data) {
    var index = findViewIndex(data.viewId, state.views)
    if (index != undefined) {
      var data = parseCsvData(data.text, data.filename)
      state.views[index].data = data
    }
  },

  sortData (state, data) {
    var index = findViewIndex(data.viewId, state.views)
    if (index != undefined) {
      sortDataByColumnIndex(state.views[index], data.columnIndex)
      console.log(state.views[index])
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations
}


