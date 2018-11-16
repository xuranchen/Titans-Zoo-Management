require('dotenv').config({path: __dirname + '/.env'});
var express = require('express');
var path = require('path')
var mysql = require('mysql')

var app = express();

app.use('/css', express.static('css'));
app.use(express.static('html'));
app.use('/js', express.static('js'));


//connects to mysql server
var con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

//loads home page
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname,'./html/login.html'));
})
//app.get('/register', function(req, res){
//  res.sendFile(path.join(__dirname, './html/register.html'))
//});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
