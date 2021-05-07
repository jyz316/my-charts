function executeCmd (fullpath, cmd, callback) {
  var sqlite3 = require('sqlite3').verbose();
  var db = new sqlite3.Database(fullpath);
  db.serialize(function() {
    db.all(cmd, function(err, rows){
      callback(err, rows);
    });
  })
  db.close();
}
 
module.exports = {
  executeCmd: executeCmd,
};
