let {PythonShell} = require('python-shell')
const path = require( "path" );
const fs = require('fs')

function executePython (script, onerr, onresults) {
  console.log(script)
  let options = {mode: 'text'};
  if (script.args) {
    options.args = script.args.split(' ').map(a => a.trim()).filter(a => a);
  }
  if (script.scriptPath) {
    options.scriptPath = script.scriptPath;
    // put code in temp file
    const randomInt = getRandomInt();
    const tempFile = 'pythonShellFile' + randomInt.toString() + '.py'
    const filePath = path.join(script.scriptPath, tempFile)
    fs.writeFileSync(filePath, script.code);
    PythonShell.run(tempFile, options, function (err, results) {
      fs.unlinkSync(filePath)
      if (err) {
        onerr(err);
        return;
      }
      onresults(results);
    });
  } else {
    PythonShell.runString(script.code, options, function (err, results) {
      if (err) {
        onerr(err);
        return;
      }
      onresults(results);
    });
  }
}

function getRandomInt() {
  return Math.floor(Math.random() * 10000000000);
}

module.exports = {
  executePython: executePython,
};
