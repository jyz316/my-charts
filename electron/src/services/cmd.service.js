const { execSync } = require("child_process");

function executeCmd (cmd) {
  const stdout = execSync(cmd, {encoding: 'utf8'})
  return {output: stdout}
}

module.exports = {
  executeCmd: executeCmd,
};
