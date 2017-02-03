var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var redis = require('redis');
var redisClient = redis.createClient();
app.use(express.static(__dirname + '/public'));


// add messages to the database
var storeMessage = function(name, data) {
  var message = JSON.stringify({name: name, data:data});
  redisClient.lpush("messages", message, function(err, reply) {
    redisClient.ltrim("messages", 0, 9);
  });
}

io.on('connection', function(client) {

  client.on('join', function(name){
    client.nickname = name;

    //load users
    client.emit('add user', name);
    client.broadcast.emit('add user', name);
    redisClient.smembers('users', function(err, users) {
      users.forEach(function(user) {
        client.emit('add user', user);
      });
    });
    redisClient.sadd("users", name);

    //load messages
    redisClient.lrange("messages", 0, -1, function(err, messages) {
      messages = messages.reverse();
      messages.forEach(function(message){
        message = JSON.parse(message);
        client.emit("message", message.name + ": " + message.data);
      });
    });
  });

  //remove user
  client.on('disconnect', function() {
    client.broadcast.emit("remove user", client.nickname);
    redisClient.srem("users", client.nickname);
  });

  //update message
  client.on('message', function(data){
    var nickname = client.nickname;
    client.broadcast.emit("message", nickname + ": " + data);
    client.emit("message", nickname + ": " + data);
    storeMessage(nickname, data);
  });
});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

http.listen(8080);
