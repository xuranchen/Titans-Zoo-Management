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



  var request = "SELECT Username, Password, UserType FROM User WHERE Email = '" + username + "'";
  con.query(request, function (err, result) {
    if (err){
      return callback(-1, null, err);
    }
    if (!result.length){
      console.log("invalid username")
      return callback(-1, null, null);
    }
    var pw_hash = result[0]["Password"];
    var userType = result[0]["UserType"];
    var username = result[0]["Username"];
    bcrypt.compare(password, pw_hash, function(err, res) {
      if (res){
        console.log("authenticated");
        return callback(userType, username, null);
      } else {
        console.log("invalid password")
        return callback(-1, null, null);
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
    console.log(usertype)
    console.log("attempting to add")
    if (usertype == 1) {
       var register_query = "INSERT INTO User (Username, Password, Email, Usertype) VALUES ('" + username + "', '" + hash + "', '" + email + "', '" + usertype + "');"
       var register_query1 = "INSERT INTO Visitor (Username) VALUES ('" + username + "');"
    }
    else if (usertype == 2){
      var register_query = "INSERT INTO User (Username, Password, Email, Usertype) VALUES ('" + username + "', '" + hash + "', '" + email + "', '" + usertype + "');"
      var register_query1 = "INSERT INTO Staff (Username) VALUES ('" + username + "');"
    }
    else if (usertype == 0){
      var register_query = "INSERT INTO User (Username, Password, Email, Usertype) VALUES ('" + username + "', '" + hash + "', '" + email + "', '" + usertype + "');"
      var register_query1 = "INSERT INTO Admin (Username) VALUES ('" + username + "');"
    }
    console.log(register_query)
    console.log(register_query1)
    con.query(register_query, function (err, result) {
      if (err){
        return callback(1);
      } else {
        return callback(0);
      }
    });
    con.query(register_query1, function (err, result) {
      if (err){
        return callback(1);
      } else {
        return callback(0);
      }
    });
  });
}


exports.addAnimal = function(con, name, age, exhibit, genus, species , callback) {
    console.log("attempting to add")
    var register_query = "INSERT INTO Animal (Name, Age, Exhibit, Genus, Species) VALUES ('" + name + "', '" + age + "', '" + exhibit + "', '" + genus + "', '" + species + "');"
    console.log(register_query)
    con.query(register_query, function (err, result) {
      if (err){
        return callback(1);
      } else {
        return callback(0);
      }
    });
}

exports.addShow = function(con, name, exhibit, staff, dateTime , callback) {
  console.log("attempting to add")
  var checker_query = "SELECT * FROM Animal_Show WHERE Host ='" + staff + "' AND DateTime = '" + dateTime + "'";
  var register_query = "INSERT INTO Animal_Show (Name, DateTime, Exhibit, Host) VALUES ('" + name + "', '" + dateTime + "', '" + exhibit + "', '" + staff + "');";
  console.log(register_query)
  console.log(checker_query)
  con.query(checker_query, function (err, result) {
    console.log("result =" +  result)
    if (result.length == 0) {
      con.query(register_query, function (err, result2) {
        if (err){
          return callback(1);
        } else {
          return callback(0);
        }
      });
    }
    else {
      console.log("Insertion failed. Staff has a different show at that time already.");
      return callback(1);
    }
    if (err) {
      return callback(1);
    }
  });
}

//exhibit search_shows
//
//returns
// -1 if error
// result if no erorr
exports.search_exhibits = function(con, name, numMin, numMax, sizeMin, sizeMax, water, callback) {

  var query = 'SELECT Exhibit.Name, Size, COUNT(*) AS "NumAnimals", Water_Feature FROM Exhibit INNER JOIN Animal ON Exhibit.Name = Animal.Exhibit';

    if (sizeMin != '' && sizeMax != '') {
      query = query + "WHERE Size BETWEEN '" + sizeMin + "' AND '"+sizeMax+"' "
    } else if (sizeMin != '') {
      query = query + "WHERE Size <= '" + sizeMax +"' "
    } else if (sizeMax != '') {
      query = query + "WHERE Size >= '" + sizeMin + "' "
    } else {
      query = query + "WHERE TRUE "
    }

    if (name != '') {
      query = query + "AND Exhibit.Name = '" + name +"' "
    }
    if (water != '') {
      query = query + "AND Water_Feature = '" + water + "' "
    }
    // if (numMin != '' && numMax != '') {
    //   query = query + "AND (SELECT COUNT(*) FROM Animal AS a WHERE a.Exhibit = e.Name) BETWEEN '"+ numMin + "' AND '" + numMax + "';"
    // } else if (numMin != '') {
    //   query = query + "AND (SELECT COUNT(*) FROM Animal AS a WHERE a.Exhibit = e.Name) <= '" + numMax +"';"
    // } else if (numMax != '') {
    //   query = query + "AND (SELECT COUNT(*) FROM Animal AS a WHERE a.Exhibit = e.Name) >= '" + numMin + "';"
    // } else {
    //   query = query + "AND (SELECT COUNT(*) FROM Animal AS a WHERE a.Exhibit = e.Name);"
    // }
    query = query + "GROUP BY Animal.Exhibit"
    console.log("query" + query);
    con.query(query, function (err, result) {
      if (err){
        return callback(-1);
      } else {
        return callback(result);
      }
    });
}

//exhibit history
//
//returns
// -1 if error
// result if no erorr
exports.search_exhibits_history = function(con, cur_user, name, visitMin, visitMax, date, callback) {
  query = "SELECT *, Count(*) FROM Exhibit_Visits WHERE Visitor = '" + cur_user + "' ";
  if (name != '') {
    query = query + "AND Name = '" + name + "' "
  }
  if (date != '') {
    query = query + "AND DateTime LIKE '" + date + "%' "
  }
  query = query + "GROUP BY Name "

  if (visitMin != '' && visitMax != '') {
    query = query + "Having Count(*) BETWEEN " + visitMin + " and " + visitMax + ";"
  } else if (visitMin != '') {
    query = query + "Having Count(*) >= " + visitMin + ";";
  } else if (visitMax != '') {
    query = query + "Having Count(*) <= " + visitMax + ";";
  }
  console.log(query)
  con.query(query, function (err, result) {
    if (err){
      return callback(-1);
    } else {
      return callback(result);
    }
  });

}
