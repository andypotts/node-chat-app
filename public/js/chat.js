$(function() {
  var socket = io.connect('http://localhost:8080');

  socket.on('connect', function(data) {
    $('#status').show();
    nickname = prompt('What is your nickname?');
    socket.emit('join', nickname);
  });

  $('#chatForm').submit(function(e) {
    e.preventDefault();
    var message = $('#input').val();
    socket.emit('message', message);
    $('#input').val('');
    $("#messages").animate({ scrollTop: $("#messages")[0].scrollHeight}, 1000);
  });

  socket.on('message', function(data) {
    $('#messages').append('<p>'+data+'</p>');
    $("#messages").animate({ scrollTop: $("#messages")[0].scrollHeight}, 1000);
  });
});
