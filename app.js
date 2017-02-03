var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
app.use(express.static(__dirname + '/public'));


io.on('connection', function(client) {
  console.log('client connected');

  client.on('join', function(name){
    client.nickname = name;
  });

  client.on('message', function(data){
    var nickname = client.nickname;
    client.broadcast.emit("message", nickname + ": " + data);
    client.emit("message", nickname + ": " + data);
  });
});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

http.listen(8080);
