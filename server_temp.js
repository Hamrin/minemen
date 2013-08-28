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

// assuming POST: name=foo&color=red
server.post('/register', function(req, res) {
    console.log('-- Register Bot: --');
    console.log('Name: ' + req.body.name);
    console.log('IP: ' + req.body.ip);
    console.log('-------------------');
    res.send('Bot registered!');
});

///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function(req,res){
  res.sendfile(__dirname + '/index.html');
});


///////////////////////////////////////////
//             other stuff               //
///////////////////////////////////////////

/**
 * to post messages to bots
 * usage:
 * postToBot("192.168.0.1",1337,"ping",{data:"cool data"});
 * todo:timeout
 */
function postToBot(host, port, message, data) {
    data = JSON.stringify(data);

    var options = {
        hostname: host,
        port: port,
        path: '/' + message,
        method: 'POST'
    };

    var request = http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
        res.on('end', function() {
            // do what you do
        });
    });
// listening to the response is optional, I suppose
    var myTimeout = 1000;
    request.on('socket', function (socket) {
        socket.setTimeout(myTimeout);
        socket.on('timeout', function() {
            console.log('TIMEOUT:');
            request.abort();
        });
    });

    request.on('response', function(response) {
        response.on('data', function(chunk) {
            // do what you do
        });
        response.on('end', function() {
            // do what you do
        });
    });

    request.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    // write data to request body
    request.write(data);
    request.end();
}




console.log('Listening on http://0.0.0.0:' + port );
