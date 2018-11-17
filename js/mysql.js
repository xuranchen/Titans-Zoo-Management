var mysql = require('mysql')
var path = require('path')
const bcrypt = require('bcrypt');
var appDir = path.dirname(require.main.filename);
require('dotenv').config({path: appDir + '\\.env'});

//connects to georgia tech MySQL Server
exports.connect = function(){
  var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_USERNAME
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
exports.verify_login = function(con, username, password) {
  var request = "SELECT Password, UserType FROM User WHERE Username = '" + username + "'";
  con.query(request, function (err, result) {
    if (err) throw err;
    var pw_hash = result[0]["Password"];
    var userType = result[0]["UserType"];
    bcrypt.compare(password, pw_hash, function(err, res) {
      if (res){
        console.log(userType);
        return userType;
      } else {
        return -1;
      }
    });
  });
}
