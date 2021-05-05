const { dialog } = require('electron')
const fs = require('fs')
const path = require( "path" );

function selectAndOpenFile (name, extensions) {
  console.log('selectAndOpenFile')
  var options = {
    filters: [{ name: name, extensions: extensions }],
    properties: ['openFile']
  }
  var selected = dialog.showOpenDialogSync(options)
  console.log(selected)
  if (selected) {
    const fullpath = selected[0]
    const data = fs.readFileSync(fullpath, 'utf8')
    console.log(data)
    return {
      fullpath: fullpath,
      filepath: path.dirname(fullpath),
      filename: path.basename(fullpath),
      data: data
    }
  }
}

function selectAndWriteFile(name, extensions, content) {
  var options = {
    filters: [{ name: name, extensions: extensions }],
    properties: ['showOverwriteConfirmation']
  }
  var fullpath = dialog.showSaveDialogSync(options)
  if (fullpath) {
    fs.writeFileSync(fullpath, content);
    console.log('saved')
    return {
      fullpath: fullpath,
      filepath: path.dirname(fullpath),
      filename: path.basename(fullpath)
    }
  }
}

function writeFile(filePath, content) {
  console.log(filePath)
  console.log(content)
  fs.writeFileSync(filePath, content);
  console.log('wrote')
}

module.exports = {
  selectAndOpenFile: selectAndOpenFile,
  selectAndWriteFile: selectAndWriteFile,
  writeFile: writeFile,
};