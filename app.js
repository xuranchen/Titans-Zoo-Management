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
  var type = req.body.type;
  var species = req.body.species;

  req.checkBody('name', 'name cannot be empty').notEmpty();
  req.checkBody('species', 'species cannot be empty').notEmpty();
  req.checkBody('age', 'age cannot be empty').notEmpty();
  req.checkBody('exhibitSelect', 'exhibitSelect cannot be empty').notEmpty();
  req.checkBody('type', 'type cannot be empty').notEmpty();


  var pageErrors = req.validationErrors();

  if(!pageErrors){
    mysql.addAnimal(con, name, age, exhibitSelect, type, species, function(response, err) {
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
    con.query('SELECT Username, Email FROM User WHERE UserType = "1"', function(err,rows) {
      if (err) throw err;
      console.log('Data received from Db:\n');
      console.log(rows);
      res.json(rows)
  });
    mysql.addShow(con, name, exhibit, staff, dateTime, function(response, err) {
      if (err) {
        res.redirect(req.get('referer'));
      } else if (response == 0) {
        console.log("Add Show success");
        // res.sendFile(path.join(__dirname,'./html/add-show.html'));
        res.sendFile(path.join(__dirname,'./html/login.html'));
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

app.post("/exhibit_results", urlencodedParser, function(req, res) {
  console.log("Exhibit Search Request Received");
  var name = req.body.name;
  var amin = req.body.amin;
  var amax = req.body.amax;
  var smin = req.body.smin;
  var smax = req.body.smax;
  var water
  if (req.body.wfeature == "WaterFeature"){
    water = 1;
  } else {
    water = 0;
  }
  mysql.search_exhibits(con, name, amin, amax, smin, smax, water, function(dat) {
    if (dat == -1) {
      res.send("sql error")
    } else {
      res.json(dat)
    }
  });
  res.sendFile(path.join(__dirname,'./html/exhibit-results.html'));
});

app.post("/exhibit_history", urlencodedParser, function(req, res) {
  console.log("Exhibit history search Request Received");
  var name = req.body.name;
  var amin = req.body.amin;
  var amax = req.body.amax;
  var date = req.body.date;
  mysql.search_exhibits_history(con, cur_user, name, amin, amax, date, function(dat) {
    if (dat == -1) {
      res.send("sql error")
    } else {
      res.json(dat)
    }
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
        res.json(rows)
    });
});

app.get("/search_visitors/:query", urlencodedParser,  function(req, res) {
  console.log("Visitor search Request Received");
  var name = req.params.query;
  con.query('SELECT Username, Email FROM User WHERE UserType = "1" AND Username = ?', [name] , function(err,rows) {
      if (err) throw err;
      console.log('Data received from Db:\n');
      console.log(rows);
      res.json(rows)
  });
});

app.post("/search_shows/:query", urlencodedParser,  function(req, res) {
  console.log("Show search Request Received");
  var params = req.params.query.split(",");
  var name = params[0];
  var exhibit = params[1];
  var date = params[2];

  var query = "SELECT Name, DateTime, Exhibit, FROM Animal_Show WHERE TRUE"

  if (name != '') {
    query = query + "AND Name = '" + name + "' "
  }
  if (exhibit != '') {
    query = query + "AND Exhibit = '" + exhibit + "' "
  }
  if (type != '') {
    query = query + "AND DateTime = '" + date + "' "
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
  var name = req.params.query;
  console.log(name)
  con.query('DELETE FROM Animal WHERE Name = ?', [name] , function(err,rows) {
      if (err) throw err;
      console.log('Data received from Db:\n');
      console.log(rows);
      res.json(rows)
  });
});

app.post("/delete_Show/:query", urlencodedParser,  function(req, res) {
  console.log("Show deletion Request Received");
  var name = req.params.query;
  console.log(name)
  con.query('DELETE FROM Animal_Show WHERE Name =  ?', [name] , function(err,rows) {
      if (err) throw err;
      console.log('Data received from Db:\n');
      console.log(rows);
      res.json(rows)
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
      res.json(rows)
  });
});

app.get("/sort_visitors", urlencodedParser,  function(req, res) {
    var column = req.query.column;
    var order = req.query.order;
    con.query('SELECT Username, Email FROM User WHERE UserType = 1 ORDER BY ' + column + ' ' + order, function(err,rows) {
        if (err) throw err;
        console.log('Data received from Db:\n');
        console.log(rows);
        res.json(rows)
    });
});

app.get("/pull_staff", urlencodedParser,  function(req, res) {
    con.query('SELECT Username, Email FROM User WHERE UserType = 2', function(err,rows) {
        if (err) throw err;
        console.log('Data received from Db:\n');
        console.log(rows);
        res.json(rows)
    });
});

app.get("/pull_staffName", urlencodedParser,  function(req, res) {
  con.query('SELECT DISTINCT Username FROM User WHERE UserType = 2', function(err,rows) {
      if (err) throw err;
      console.log('Data received from Db:\n');
      console.log(rows);
      res.json(rows)
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
      res.json(rows)
  });
});

app.get("/sort_staff", urlencodedParser,  function(req, res) {
    var column = req.query.column;
    var order = req.query.order;
    con.query('SELECT Username, Email FROM User WHERE UserType = 2 ORDER BY ' + column + ' ' + order, function(err,rows) {
        if (err) throw err;
        console.log('Data received from Db:\n');
        console.log(rows);
        res.json(rows)
    });
});

app.get("/view_shows", urlencodedParser,  function(req, res) {
    res.sendFile(path.join(__dirname,'./html/show-hist.html'));
});

app.get("/pull_shows/", urlencodedParser,  function(req, res) {
  console.log("Show pull Request Received");
  console.log(req.body)
  var name = req.body.name;
  var exhibit = req.body.exhibit;
  var date = req.body.date;
  console.log(name)
  console.log(exhibit)
  console.log(date)
  con.query('SELECT Username, Email FROM User WHERE UserType = "1" AND Username = ? AND ', [name, exhibit, date] , function(err,rows) {
      if (err) throw err;
      console.log('Data received from Db:\n');
      console.log(rows);
      res.json(rows)
  });
});

app.get("/pull_all_shows", urlencodedParser,  function(req, res) {
    con.query('SELECT Name, DateTime, Exhibit FROM Animal_Show', function(err,rows) {
        if (err) throw err;
        console.log('Data received from Db:\n');
        console.log(rows);
        res.json(rows)
    });
});

app.get("/pull_Exhibits", urlencodedParser,  function(req, res) {
  con.query('SELECT DISTINCT Exhibit FROM Animal_Show', function(err,rows) {
      if (err) throw err;
      console.log('Data received from Db:\n');
      console.log(rows);
      res.json(rows)
  });
});

app.get("/pull_Exhibits", urlencodedParser,  function(req, res) {
  con.query('SELECT DISTINCT Exhibit FROM Animal_Show', function(err,rows) {
      if (err) throw err;
      console.log('Data received from Db:\n');
      console.log(rows);
      res.json(rows)
  });
});

app.get("/pull_animals", urlencodedParser,  function(req, res) {
  con.query('SELECT * FROM Animal', function(err,rows) {
      if (err) throw err;
      console.log('Data received from Db:\n');
      console.log(rows);
      res.json(rows)
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
  console.log('Zoo Management app listening on port 3000!')
});
