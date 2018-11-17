var express = require('express');
var path = require('path')
var mysql = require('./js/mysql.js');


var app = express();

app.use('/css', express.static('css'));
app.use(express.static('html'));
app.use('/js', express.static('js'));

var con = mysql.connect();
//mysql.verify_login(con, 'admin1', 'adminpassword');


//loads home page
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname,'./html/login.html'));
})
//app.get('/register', function(req, res){
//  res.sendFile(path.join(__dirname, './html/register.html'))
//});

//Starts application
app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
