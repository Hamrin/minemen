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

var maxBots = 10;
var botsRegistered = 10;

//Setup Socket.IO
io = io.listen(httpServer);
io.sockets.on('connection', function(socket){
    console.log('Client Connected');
    if(botsRegistered == maxBots) {
        socket.emit('updateGame',newGame());
    }
//
//    setInterval(function(){
//        socket.emit('updateGame',newGame());
//    },3000);
//    socket.on('message', function(data){
//        socket.broadcast.emit('server_message',data);
//    });
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


var gameSettings = {
    botTimeout:"100", //ms
    gameLength:5000, //turns
    boardSize:{x:10, y:10}
};

var botExample = {
    id:0,
    name:"sampleBot2000",
    host:"yourIP.com",
    port:5353,
    startPosition:{x:0,y:0},
    color:0xFF00FF,
    points:0
};

var exampleBoard =
    [
        ["e","e","e","b","b","g","e","e","e","b"],
        ["e","b","e","e","e","e","e","e","e","e"],
        ["e","e","e","e","e","e","e","e","e","b"],
        ["e","e","g","e","0","e","e","e","e","b"],
        ["e","e","e","e","e","e","e","e","e","g"],
        ["e","b","e","b","e","e","e","e","e","e"],
        ["e","b","e","e","e","e","e","e","e","e"],
        ["e","b","e","e","e","e","e","e","e","e"],
        ["e","e","e","e","e","e","e","g","b","e"],
        ["e","b","e","e","e","e","e","e","e","b"]
    ];

// "e" = empty
// "b" = bomb
// "g" = gold
// id/index = player

function newGame() {
    var board = [];
    for (var i = 0; i < gameSettings.boardSize.x; i++){
        board[i] = [];
        for (var j = 0; j < gameSettings.boardSize.y; j++){
            board[i][j] = "e";
        }
    }
    return {
        round : 0,
        bots: [botExample],
        board: board,
        timer: gameSettings.gameLength,
        settings: gameSettings
    };
}


/**
 * to post messages to bots
 * usage:
 * postToBot("127.0.0.1",1337,"ping",{data:"cool data"}, function(response){});
 * todo:timeout
 */

function postToBot(host, port, message, data, callback) {
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

//    // todo check if ths works...
//    var myTimeout = 1000;
//    request.on('socket', function (socket) {
//        socket.setTimeout(myTimeout);
//        socket.on('timeout', function() {
//            console.log('TIMEOUT:');
//            request.abort();
//        });
//    });

    var responseData = '';
    request.on('response', function(response) {
        response.on('data', function(chunk) {
            responseData += chunk;
        });
        response.on('end', function() {
            responseData = JSON.parse(responseData);
            callback(responseData);
        });
    });

    request.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    // write data to request body
    request.write(data);
    request.end();
}

//postToBot("127.0.0.1",1337,"ping",{data:"cool data"}, function(response){
//    console.log("responce: ");
//    console.log(response);
//});
//postToBot("127.0.0.1",1337,"move",{data:"this should be the game"}, function(response){
//    console.log("responce: ");
//    console.log(response);
//});


console.log('Listening on http://0.0.0.0:' + port );
