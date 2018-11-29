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
    if (err) {
      return null;
    }
    console.log("MySQL Connected!");
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
    if (err){
      return callback(-1, err);
    }
    if (!result.length){
      console.log("invalid username")
      return callback(-1, null);
    }
    var pw_hash = result[0]["Password"];
    var userType = result[0]["UserType"];
    bcrypt.compare(password, pw_hash, function(err, res) {
      if (res){
        console.log("authenticated");
        return callback(userType, null);
      } else {
        console.log("invalid password")
        return callback(-1, null);
      }
    });
  });
}

//registers new user
//
//returns
// 0    success
// 1    failure
exports.register = function(con, username, email, password, usertype, callback) {
  var verify_email = "SELECT * FROM User WHERE Email = '" + email + "';";
  var verify_username = "SELECT * FROM User WHERE Username = '" + username + "';";
  bcrypt.hash(password, 10, function(err, hash) {
    console.log(hash)
    var regisiter_query = "INSERT INTO User (Username, Password, Email, Usertype) VALUES ('" + username + "', '" + hash + "', '" + email + "', '" + usertype + "');"
    con.query(regisiter_query, function (err, result) {
      if (err){
        return callback(1);
      } else {
        return callback(0);
      }
    });
  });

}
