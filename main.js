var express = require('express');
var app = express();
var path = require('path')



app.use(express.static('css'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname,'./html/login.html'));
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
