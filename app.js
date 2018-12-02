var express = require('express');
var path = require('path')
var mysql = require('./js/mysql.js');
const bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
const validator  = require('express-validator')

var app = express();

app.use('/css', express.static('css'));
app.use(express.static('html'));
app.use('/js', express.static('js'));
app.use(validator());

var api = express.Router();

var con;
var cur_user = null;
var cur_exhibit_detail = null;

while (con == null){
  console.log('attempting sql connection')
  con = mysql.connect();
}



//loads home page
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname,'./html/login.html'));
});

//authenticates login
app.post('/',urlencodedParser,  function(req, res) {
  var username = req.body.email;
  var password = req.body.password;
  console.log("post received: Username: %s Password: %s", username, password);

  mysql.verify_login(con, username, password, function(UserType, username, err){
      if (err) {
        res.redirect(req.get('referer'));
      } else if (UserType == -1){
        res.redirect(req.get('referer'));
      } else if (UserType == 0){
        cur_user = username;
        res.sendFile(path.join(__dirname,'./html/admin-index.html'));
      } else if (UserType == 1){
        cur_user = username;
        console.log(cur_user)
        res.sendFile(path.join(__dirname,'./html/visitor-index.html'));
      } else if (UserType == 2){
        cur_user = username;
        res.sendFile(path.join(__dirname,'./html/staff-index.html'));
      }
    });
  });

app.post('/register', urlencodedParser, function(req, res){
  console.log("Register Request received")
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;
  var usertype = req.body.clicked_button;

  req.checkBody("email", 'Invalid email address.').isEmail();
  req.checkBody('username', 'Username cannot be empty').notEmpty();
  req.checkBody("password", 'Password cannot be empty.').notEmpty();
  req.checkBody("password2", 'Passwords entered do not match!').equals(password);

  var pageErrors = req.validationErrors();

  if(!pageErrors){
    mysql.register(con, username, email, password, parseInt(usertype), function(response, err) {
      if (err) {
        res.redirect(req.get('referer'));
      } else if (response == 0) {
        console.log("registration success");
        res.sendFile(path.join(__dirname,'./html/login.html'));
      } else if (response == 1) {
        console.log("Registration attempt failed")
        res.redirect(req.get('referer'));
      }
    });
  } else {
    console.log("invalid input")
    res.redirect(req.get('referer'));
  }

});

app.post('/addAnimal', urlencodedParser, function(req, res){
  console.log("Add Animal Request received")
  var name = req.body.name;
  var age = req.body.age;
  var exhibitSelect = req.body.exhibitSelect;
  var genus = req.body.typeSelect;
  var species = req.body.species;

  console.log("name" + name)
  console.log("age" + age)
  console.log("exhibitSelect" + exhibitSelect)
  console.log("genus" + genus)
  console.log("species" + species)

  req.checkBody('name', 'name cannot be empty').notEmpty();
  req.checkBody('species', 'species cannot be empty').notEmpty();
  req.checkBody('age', 'age cannot be empty').notEmpty();
  req.checkBody('exhibitSelect', 'exhibitSelect cannot be empty').notEmpty();


  var pageErrors = req.validationErrors();
  console.log(pageErrors);

  if(!pageErrors){
    mysql.addAnimal(con, name, age, exhibitSelect, genus, species, function(response, err) {
      if (err) {
        res.redirect(req.get('referer'));
      } else if (response == 0) {
        console.log("Add animal success");
        res.sendFile(path.join(__dirname,'./html/add-animal.html'));
      } else if (response == 1) {
        console.log("Add animal attempt failed")
        res.redirect(req.get('referer'));
      }
    });
  } else {
    console.log("invalid input")
    res.redirect(req.get('referer'));
  }

});

app.post('/add_show', urlencodedParser, function(req, res){
  console.log("Add Show Request received")
  var name = req.body.name;
  var exhibit = req.body.exhibitSelect;
  var staff = req.body.staffSelect;
  var dateTime = req.body.date + " " +req.body.time;
  console.log(dateTime);

  req.checkBody('name', 'name cannot be empty').notEmpty();
  req.checkBody('exhibitSelect', 'exhibit cannot be empty').notEmpty();
  req.checkBody('staffSelect', 'staff cannot be empty').notEmpty();
  req.checkBody('date', 'date cannot be empty').notEmpty();
  req.checkBody('time', 'time cannot be empty').notEmpty();


  var pageErrors = req.validationErrors();

  if(!pageErrors){
    console.log("no errors");
  //   con.query('SELECT Username, Email FROM User WHERE UserType = "1"', function(err,rows) {
  //     if (err) throw err;
  //     console.log('Data received from Db:\n');
  //     console.log(rows);
  //     res.json(rows)
  // });
    mysql.addShow(con, name, exhibit, staff, dateTime, function(response, err) {
      if (err) {
        res.redirect(req.get('referer'));
      } else if (response == 0) {
        console.log("Add Show success");
        res.sendFile(path.join(__dirname,'./html/add-show.html'));
      } else if (response == 1) {
        console.log("Add show attempt failed")
        res.redirect(req.get('referer'));
      }
    });
  } else {
    console.log("invalid input")
    res.redirect(req.get('referer'));
  }

});

app.get("/exhibit_detail/:query", urlencodedParser,  function(req, res) {
    cur_exhibit_detail = req.params.query;
    console.log(cur_exhibit_detail);
    res.sendFile(path.join(__dirname,'./html/exhibit-detail.html'));
});

app.get("/pull_exhibit_detail", urlencodedParser,  function(req, res) {
    con.query("SELECT Exhibit.Name, Size, COUNT(*) AS \"NumAnimals\", Water_Feature FROM Exhibit INNER JOIN Animal ON Exhibit.Name = Animal.Exhibit WHERE Exhibit.Name = '" + cur_exhibit_detail + "' GROUP BY Animal.Exhibit", function(err,rows) {
        if (err) throw err;
        console.log('Data received from Db:\n');
        console.log(rows);
        res.json(rows)
    });
});

app.get("/pull_exhibit_detail_animals", urlencodedParser,  function(req, res) {
    con.query("SELECT Name, Species FROM Animal WHERE Exhibit = '" + cur_exhibit_detail + "'", function(err,rows) {
        if (err) throw err;
        console.log('Data received from Db:\n');
        console.log(rows);
        res.json(rows)
    });
});

app.get("/pull_exhibits", urlencodedParser,  function(req, res) {
    con.query('SELECT Exhibit.Name, Size, COUNT(*) AS "NumAnimals", Water_Feature FROM Exhibit INNER JOIN Animal ON Exhibit.Name = Animal.Exhibit GROUP BY Animal.Exhibit', function(err,rows) {
        if (err) throw err;
        console.log('Data received from Db:\n');
        console.log(rows);
        res.json(rows)
    });
});

app.get("/sort_exhibits", urlencodedParser,  function(req, res) {
    var column = req.query.column;
    var order = req.query.order;
    con.query('SELECT Exhibit.Name, Size, COUNT(*) AS "NumAnimals", Water_Feature FROM Exhibit INNER JOIN Animal ON Exhibit.Name = Animal.Exhibit GROUP BY Animal.Exhibit ORDER BY ' + column + ' ' + order, function(err,rows) {
        if (err) throw err;
        console.log('Data received from Db:\n');
        console.log(rows);
        res.json(rows);
    });
});

app.post("/exhibit_results/:query", urlencodedParser, function(req, res) {
  console.log("Exhibit Search Request Received");
  var params = req.params.query.split(",");
  var name = params[0];
  var numMin = params[1];
  var numMax = params[2];
  var sizeMin = params[3];
  var sizeMax = params[4];
  var water = null;
  if (params[5] == "Yes"){
    water = 1;
  } else if (params[5] == "No"){
    water = 0;
  }
  var query = 'SELECT Exhibit.Name, Size, COUNT(*) AS "NumAnimals", Water_Feature FROM Exhibit INNER JOIN Animal ON Exhibit.Name = Animal.Exhibit ';
    if (sizeMin != '' && sizeMax != '') {
      query = query + "WHERE Size BETWEEN '" + sizeMin + "' AND '"+sizeMax+"' ";
    } else if (sizeMax != '') {
      query = query + "WHERE Size <= '" + sizeMax +"' ";
    } else if (sizeMin != '') {
      query = query + "WHERE Size >= '" + sizeMin + "' ";
    } else {
      query = query + "WHERE TRUE ";
    }

    if (name != '') {
      query = query + "AND Exhibit.Name = '" + name +"' ";
    }
    if (water != null) {
      query = query + "AND Water_Feature = '" + water + "' ";
    }

    query = query + "GROUP BY Animal.Exhibit";

    if (numMin != '' && numMax != '') {
      query = query + " HAVING COUNT(*) BETWEEN '"+ numMin + "' AND '" + numMax + "' ";
    } else if (numMin != '') {
      query = query + " HAVING COUNT(*) >= '" + numMin +"' ";
    } else if (numMax != '') {
      query = query + " HAVING COUNT(*) <= '" + numMax + "' ";
    }

    console.log("query " + query);
    con.query(query, function (err, result) {
      if (err) throw err;
      console.log('Data received from Db:\n');
      console.log(result);
      res.json(result);
    });
  // mysql.search_exhibits(con, name, amin, amax, smin, smax, water, function(dat) {
  //   if (dat == -1) {
  //     res.send("sql error")
  //   } else {
  //     // res.json(dat)
  //     res.sendFile(path.join(__dirname,'./html/exhibit-search.html'));
  //   }
  // });
  // res.sendFile(path.join(__dirname,'./html/exhibit-search.html'));
});

app.get("/pull_exhibit_history", urlencodedParser,  function(req, res) {
    con.query("SELECT *, Count(*) as \"NumVisits\" FROM Exhibit_Visits WHERE Visitor = '" + cur_user + "' GROUP BY Name", function(err,rows) {
        if (err) throw err;
        console.log('Data received from Db:\n');
        console.log(rows);
        res.json(rows)
    });
});

app.post("/exhibit_history/:query", urlencodedParser, function(req, res) {
  console.log("Exhibit history search Request Received");
  var params = req.params.query.split(",");
  var name = params[0];
  var amin = params[1];
  var amax = params[2];
  var date = params[3];
  mysql.search_exhibits_history(con, cur_user, name, amin, amax, date, function(dat) {
    if (dat == -1) {
      res.send("sql error")
    } else {
      console.log('Data received from Db:\n');
      console.log(dat);
      res.json(dat);
    }
  });
});

app.get("/pull_show_history", urlencodedParser,  function(req, res) {
    con.query("SELECT Show_Visits.Name, Show_Visits.DateTime, Animal_Show.Exhibit FROM Show_Visits INNER JOIN Animal_Show ON Show_Visits.Name = Animal_Show.Name WHERE Visitor = '" + cur_user + "'", function(err,rows) {
        if (err) throw err;
        console.log('Data received from Db:\n');
        console.log(rows);
        res.json(rows)
    });
});

app.post("/show_history/:query", urlencodedParser,  function(req, res) {
  console.log("Show history search Request Received");
  var params = req.params.query.split(",");
  var name = params[0];
  var exhibit = params[1];
  var date = params[2];

  var query = "SELECT Show_Visits.Name, Show_Visits.DateTime, Exhibit FROM Show_Visits INNER JOIN Animal_Show ON Show_Visits.Name = Animal_Show.Name WHERE Visitor = '" + cur_user + "'";
  if (name != '') {
    query = query + " AND Show_Visits.Name = '" + name + "' "
  }
  if (exhibit != '') {
    query = query + " AND Exhibit = '" + exhibit + "' "
  }
  if (date != '') {
    query = query + " AND Show_Visits.DateTime LIKE '" + date + "%' "
  }
  console.log("query =" + query);
  con.query(query , function(err,rows) {
      if (err) throw err;
      console.log('Data received from Db:\n');
      console.log(rows);
      res.json(rows);
  });
});

app.get("/view_visitors", urlencodedParser,  function(req, res) {
    res.sendFile(path.join(__dirname,'./html/view-visitors.html'));
});

app.get("/pull_visitors", urlencodedParser,  function(req, res) {
    con.query('SELECT Username, Email FROM User WHERE UserType = "1"', function(err,rows) {
        if (err) throw err;
        console.log('Data received from Db:\n');
        console.log(rows);
        res.json(rows);
    });
});

app.get("/search_visitors/:query", urlencodedParser,  function(req, res) {
  console.log("Visitor search Request Received");
  var name = req.params.query;
  con.query('SELECT Username, Email FROM User WHERE UserType = "1" AND Username = ?', [name] , function(err,rows) {
      if (err) throw err;
      console.log('Data received from Db:\n');
      console.log(rows);
      res.json(rows);
  });
});

app.post("/search_shows/:query", urlencodedParser,  function(req, res) {
  console.log("Show search Request Received");
  var params = req.params.query.split(",");
  var name = params[0];
  var exhibit = params[1];
  var date = params[2];

  var query = "SELECT Name, DateTime, Exhibit FROM Animal_Show WHERE TRUE "
  if (name != '') {
    query = query + "AND Name = '" + name + "' "
  }
  if (exhibit != '') {
    query = query + "AND Exhibit = '" + exhibit + "' "
  }
  if (date != '') {
    query = query + "AND DateTime LIKE '" + date + "%' "
  }
  console.log("query =" + query);
  con.query(query , function(err,rows) {
      if (err) throw err;
      console.log('Data received from Db:\n');
      console.log(rows);
      res.json(rows);
  });
});


app.post("/search_animals/:query", urlencodedParser,  function(req, res) {
  console.log("Show search Request Received");
  var params = req.params.query.split(",");
  var name = params[0];
  var species = params[1];
  var min = params[2];
  var max = params[3];
  var exhibit = params[4];
  var type = params[5];

  var query = "SELECT Name, Species, Exhibit, Age, Genus FROM Animal "


  if (min != '' && max != '') {
    query = query + "WHERE Age BETWEEN '" + min + "' AND '"+max+"' "
  } else if (min != '') {
    query = query + "WHERE Age <= '" + max +"' "
  } else if (max != '') {
    query = query + "WHERE Age >= '" + min + "' "
  } else {
    query = query + "WHERE TRUE "
  }

  if (name != '') {
    query = query + "AND Name = '" + name + "' "
  }
  if (species != '') {
    query = query + "AND Species = '" + species + "' "
  }
  if (exhibit != '') {
    query = query + "AND Exhibit = '" + exhibit + "' "
  }
  if (type != '') {
    query = query + "AND Genus = '" + type + "' "
  }

  console.log("query =" + query);
  con.query(query , function(err,rows) {
      if (err) throw err;
      console.log('Data received from Db:\n');
      console.log(rows);
      res.json(rows)
  });
});

app.post("/delete_visitors/:query", urlencodedParser,  function(req, res) {
  console.log("Visitor deletion Request Received");
  var name = req.params.query;
  console.log(name)
  con.query('DELETE FROM User WHERE Usertype = 1 AND Username = ?', [name] , function(err,rows) {
      if (err) throw err;
      console.log('Data received from Db:\n');
      console.log(rows);
      res.json(rows)
  });
});

app.post("/delete_animal/:query", urlencodedParser,  function(req, res) {
  console.log("Animal deletion Request Received");
    var params = req.params.query.split(",");
    var name = params[0];
    var species = params[1];
    con.query('DELETE FROM Animal WHERE Name = ? AND Species = ?', [name, species] , function(err,rows) {
        if (err) throw err;
        console.log('Deleted');
        res.json(rows);
    });

});

app.post("/delete_Show/:query", urlencodedParser,  function(req, res) {
  console.log("Show deletion Request Received");
    var params = req.params.query.split(",");
    var name = params[0];
    var date = new Date(params[1]);
    date.setHours(date.getHours() - 5);
    console.log(date);
    con.query('DELETE FROM Animal_Show WHERE Name =  ? AND DateTime = ?', [name, date] , function(err,rows) {
      if (err) throw err;
      console.log('Deleted:\n');
      console.log(rows);
      res.json(rows);
  });
});

app.post("/delete_staff/:query", urlencodedParser,  function(req, res) {
  console.log("Staff deletion Request Received");
  var name = req.params.query;
  console.log(name)
  con.query('DELETE FROM User WHERE Usertype = 2 AND Username = ?', [name] , function(err,rows) {
      if (err) throw err;
      console.log('Data received from Db:\n');
      console.log(rows);
      res.json(rows);
  });
});

app.get("/sort_visitors", urlencodedParser,  function(req, res) {
    var column = req.query.column;
    var order = req.query.order;
    con.query('SELECT Username, Email FROM User WHERE UserType = 1 ORDER BY ' + column + ' ' + order, function(err,rows) {
        if (err) throw err;
        console.log('Data received from Db:\n');
        console.log(rows);
        res.json(rows);
    });
});

app.get("/pull_staff", urlencodedParser,  function(req, res) {
    con.query('SELECT Username, Email FROM User WHERE UserType = 2', function(err,rows) {
        if (err) throw err;
        console.log('Data received from Db:\n');
        console.log(rows);
        res.json(rows);
    });
});

app.get("/pull_staffName", urlencodedParser,  function(req, res) {
  con.query('SELECT DISTINCT Username FROM User WHERE UserType = 2', function(err,rows) {
      if (err) throw err;
      console.log('Data received from Db:\n');
      console.log(rows);
      res.json(rows);
  });
});

app.get("/search_staff/:query", urlencodedParser,  function(req, res) {
  console.log("Staff search Request Received");
  var name = req.params.query;
  console.log(name)
  con.query('SELECT Username, Email FROM User WHERE UserType = "2" AND Username = ?', [name] , function(err,rows) {
      if (err) throw err;
      console.log('Data received from Db:\n');
      console.log(rows);
      res.json(rows);
  });
});

app.get("/sort_staff", urlencodedParser,  function(req, res) {
    var column = req.query.column;
    var order = req.query.order;
    con.query('SELECT Username, Email FROM User WHERE UserType = 2 ORDER BY ' + column + ' ' + order, function(err,rows) {
        if (err) throw err;
        console.log('Data received from Db:\n');
        console.log(rows);
        res.json(rows);
    });
});

app.get("/view_shows", urlencodedParser,  function(req, res) {
    res.sendFile(path.join(__dirname,'./html/show-hist.html'));
});

app.get("/pull_shows/", urlencodedParser,  function(req, res) {
  console.log("Show pull Request Received");
  console.log(req.body);
  var name = req.body.name;
  var exhibit = req.body.exhibit;
  var date = req.body.date;
  console.log(name);
  console.log(exhibit);
  console.log(date);
  con.query('SELECT Username, Email FROM User WHERE UserType = "1" AND Username = ? AND ', [name, exhibit, date] , function(err,rows) {
      if (err) throw err;
      console.log('Data received from Db:\n');
      console.log(rows);
      res.json(rows);
  });
});

app.get("/pull_staff_shows", urlencodedParser, function(req, res) {
    console.log("Staff show history Request Received");
    con.query('SELECT Name, DateTime, Exhibit FROM Animal_Show WHERE Host = "' + cur_user + '"', function(err,rows) {
        if (err) throw err;
        console.log('Data received from Db:\n');
        console.log(rows);
        res.json(rows);
    });
});

app.get("/sort_all_shows", urlencodedParser,  function(req, res) {
    var column = req.query.column;
    var order = req.query.order;
    con.query('SELECT Name, DateTime, Exhibit FROM Animal_Show ORDER BY ' + column + ' ' + order, function(err,rows) {
        if (err) throw err;
        console.log('Data received from Db:\n');
        console.log(rows);
        res.json(rows);
    });
});

app.get("/pull_all_shows", urlencodedParser,  function(req, res) {
    con.query('SELECT Name, DateTime, Exhibit FROM Animal_Show', function(err,rows) {
        if (err) throw err;
        console.log('Data received from Db:\n');
        console.log(rows);
        res.json(rows);
    });
});

app.get("/sort_animals", urlencodedParser,  function(req, res) {
    var column = req.query.column;
    var order = req.query.order;
    con.query('SELECT * FROM Animal ORDER BY ' + column + ' ' + order, function(err,rows) {
        if (err) throw err;
        console.log('Data received from Db:\n');
        console.log(rows);
        res.json(rows);
    });
});

app.get("/pull_animals", urlencodedParser,  function(req, res) {
  con.query('SELECT * FROM Animal', function(err,rows) {
      if (err) throw err;
      console.log('Data received from Db:\n');
      console.log(rows);
      res.json(rows);
  });
});

app.get("/add_show", urlencodedParser,  function(req, res) {
    res.sendFile(path.join(__dirname,'./html/add-show.html'));
});

app.get("/add_animals", urlencodedParser,  function(req, res) {
    res.sendFile(path.join(__dirname,'./html/add-animal.html'));
});

app.get("/view_staff", urlencodedParser,  function(req, res) {
    res.sendFile(path.join(__dirname,'./html/view-staff.html'));
});

app.get("/view_animals", urlencodedParser,  function(req, res) {
    res.sendFile(path.join(__dirname,'./html/animal-results.html'));
});

app.get("/view_animals_visitor", urlencodedParser,  function(req, res) {
    res.sendFile(path.join(__dirname,'./html/animal-results-visitor.html'));
});

app.get("/view_animals_staff", urlencodedParser,  function(req, res) {
    res.sendFile(path.join(__dirname,'./html/animal-results-staff.html'));
});

app.get("/search_exhibits", urlencodedParser,  function(req, res) {
    res.sendFile(path.join(__dirname,'./html/exhibit-search.html'));
});

app.get("/exhibit_results", urlencodedParser,  function(req, res) {
    res.sendFile(path.join(__dirname,'./html/exhibit-results.html'));
});

app.get("/exhibit_detail", urlencodedParser,  function(req, res) {
    res.sendFile(path.join(__dirname,'./html/exhibit-detail.html'));
});

app.get("/search_shows", urlencodedParser,  function(req, res) {
    res.sendFile(path.join(__dirname,'./html/show-search.html'));
});

app.get("/search_animals", urlencodedParser,  function(req, res) {
    res.sendFile(path.join(__dirname,'./html/animal-search.html'));
});

app.get("/exhibit_history", urlencodedParser,  function(req, res) {
    res.sendFile(path.join(__dirname,'./html/exhibit-hist.html'));
});

app.get("/show_history", urlencodedParser,  function(req, res) {
    res.sendFile(path.join(__dirname,'./html/show-hist.html'));
});

app.get("/show_history_visitor", urlencodedParser,  function(req, res) {
    res.sendFile(path.join(__dirname,'./html/show-hist-visitor.html'));
});

app.get("/staff_show_history", urlencodedParser,  function(req, res) {
    res.sendFile(path.join(__dirname,'./html/staff-show-hist.html'));
});

app.get("/logout", urlencodedParser,  function(req, res) {
    res.sendFile(path.join(__dirname,'./html/login.html'));
});

//Starts application
app.listen(3000, function () {
  console.log('Zoo Management app listening on port 3000!');
});
