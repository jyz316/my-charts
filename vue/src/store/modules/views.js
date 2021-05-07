// helpers
var fileSource = {category: 'file', categoryLabel: '文件', file: null, icon: 'file', label: ''}
var commandSource = {category: 'cmd', categoryLabel: '命令', cmd: '', icon: 'terminal', label: ''}
var pythonSource = {category: 'python', categoryLabel: 'Python', fullpath: '', filepath: '', filename: '', code: '', icon: 'brands/python', label: ''}
var sqliteSource = {category: 'sqlite', categoryLabel: 'SQLite', fullpath: '', filename: '', cmd: '', icon: 'database', label: ''}
var httpSource = {category: 'http', categoryLabel: 'HTTP', url: null, icon: 'bolt', label: ''}

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

function parseJsonData (text) {
  var data = {rows: [], format: [{columnName: '#', columnType: 'num'}], sortBy: [0, true]}
  var obj = JSON.parse(text)
  if (Array.isArray(obj) && obj.length && typeof obj[0] === 'object') {
    var first = obj[0]
    var format = Object.keys(first).map(function(k) {
      return {
        columnName: k,
        columnType: typeof first[k] === 'number' ? 'num' : 'str'
      }
    })
    var rows = []
    for (var i=0;i<obj.length;i++) {
      var row = {'#': i + 1}
      format.forEach(function(f) {
        var val = obj[i][f.columnName]
        if (f.columnType == 'num') {
          val = Number(val)
          row[f.columnName] = isNaN(val) ? 0 : val
        } else if (f.columnType == 'str') {
          if (typeof val === 'object') {
            row[f.columnName] = JSON.stringify(val)
          } else {
            row[f.columnName] = String(val)
          }
        }
      })
      rows.push(row)
    }
    format.unshift({columnName: '#', columnType: 'num'})
    data = {rows: rows, format: format, sortBy: [0, true]}
  }
  return data
}

// initial state
export const state = {
  count: 1,
  views: [firstView],
  activeView: firstView,
  sources: [fileSource, commandSource, pythonSource, sqliteSource, httpSource],
  fileSource: fileSource,
  commandSource: commandSource,
  pythonSource: pythonSource,
  sqliteSource: sqliteSource,
  httpSource: httpSource
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

  loadFileData (state, data) {
    var index = findViewIndex(data.viewId, state.views)
    if (index != undefined) {
      var filename = data.filename.toLowerCase()
      if (filename.endsWith('.json')) {
        state.views[index].data  = parseJsonData(data.text)
      } else if (filename.endsWith('.csv') || filename.endsWith('.tsv')) {
        state.views[index].data = parseCsvData(data.text, data.filename)
      }
    }
  },

  sortData (state, data) {
    var index = findViewIndex(data.viewId, state.views)
    if (index != undefined) {
      sortDataByColumnIndex(state.views[index], data.columnIndex)
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations
}


