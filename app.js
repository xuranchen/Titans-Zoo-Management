var express = require('express');
var path = require('path')
var mysql = require('./js/mysql.js');
const bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var app = express();

app.use('/css', express.static('css'));
app.use(express.static('html'));
app.use('/js', express.static('js'));

var con = mysql.connect();


//loads home page
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname,'./html/login.html'));
});

//authenticates login
app.post('/',urlencodedParser,  function(req, res) {
  var username = req.body.email;
  var password = req.body.password;
  console.log("post received: Username: %s Password: %s", username, password);

  mysql.verify_login(con, username, password, function(UserType){
      if (UserType == -1){
        res.redirect(path.join(__dirname,'./html/login.html'))
      } else if (UserType == 0){
        res.sendFile(path.join(__dirname,'./html/admin-index.html'));
      } else if (UserType == 1){
        res.sendFile(path.join(__dirname,'./html/visitor-index.html'));
      } else if (UserType == 2){
        res.sendFile(path.join(__dirname,'./html/staff-index.html'));
      }
    });
  });

//app.get('/register', function(req, res){
//  res.sendFile(path.join(__dirname, './html/register.html'))
//});

//Starts application
app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
