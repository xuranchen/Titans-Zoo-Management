var mysql = require('mysql')
var path = require('path')
const bcrypt = require('bcrypt');
var appDir = path.dirname(require.main.filename);
require('dotenv').config({path: appDir + '\\.env'});

//connects to georgia tech MySQL Server
exports.connect = function(){
  var con = mysql.createConnection({
    host: 'academic-mysql.cc.gatech.edu',
    user: 'cs4400_group36',
    password: 'ERubgnsI',
    database: 'cs4400_group36'
  });
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });
  return con;
};

//checks login against database
//
//returns
//-1   invalid
//0    user is admin
//1    user is visitor
//2    user is staff
exports.verify_login = function(con, username, password, callback) {
  var request = "SELECT Password, UserType FROM User WHERE Email = '" + username + "'";
  con.query(request, function (err, result) {
    if (err) throw err;
    if (!result.length){
      console.log("invalid username")
      return callback(-1);
    }
    var pw_hash = result[0]["Password"];
    var userType = result[0]["UserType"];
    bcrypt.compare(password, pw_hash, function(err, res) {
      if (res){
        console.log("authenticated");
        return callback(userType);
      } else {
        console.log("invalid password")
        return callback(-1);
      }
    });
  });
}
