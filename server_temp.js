//setup Dependencies
var express = require('express')
    , io = require('socket.io')
    , port = (process.env.PORT || 8081)
    , http = require('http');

//Setup Express
var server = express();
server.configure(function(){
    server.use(express.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "shhhhhhhhh!"}));
    server.use(express.static(__dirname + '/public'));
    server.use(server.router);
});

var httpServer = server.listen( port);

//Setup Socket.IO
io = io.listen(httpServer);
io.sockets.on('connection', function(socket){
  console.log('Client Connected');
  socket.on('message', function(data){
    socket.broadcast.emit('server_message',data);
    socket.emit('server_message',data);
  });
  socket.on('disconnect', function(){
    console.log('Client Disconnected.');
  });
});


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function(req,res){
  res.sendFile(__dirname + '/index.html');
});


console.log('Listening on http://0.0.0.0:' + port );
