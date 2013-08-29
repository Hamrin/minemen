//setup Dependencies
var express = require('express')
    , io = require('socket.io')
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


var port = 8081;
var httpServer = server.listen(port);
var gameSettings = {
    botTimeout:"100", //ms
    gameLength:5000, //turns
    boardSize:{x:10, y:10},
    maxPlayers: 4
};
var game = newGame();

// register testBots
for (var i = 0; i < game.settings.maxPlayers; i++) {
    registerBot("127.0.0.1", 1337 + i, function(){
        if (bots.length == game.settings.maxPlayers)
        takeTurn();
    });


}

//Setup Socket.IO
io = io.listen(httpServer);
io.sockets.on('connection', function(socket){
    console.log('Client Connected');
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




var botTemplate = {
    id:0,
    name:"noName",
    version: "0.1",
    host:"yourIP.com",
    port:1337,
    position:{x:0,y:0},
    color:0xFF00FF,
    avatar: 'http://www.patchtogether.com/media/members/icons/MEMBER_ICON_4964098027bdb_mewshaw.gif',
    points:0
};


function registerBot(host, port, callback){
    postToBot(host, port, "start", game, function(response){
//        response = {
//            name : "testBot",
//            version : "0.1"
//        }
        if (response.name && response.version) {

            // find position
            var position = {
                x:Math.floor((Math.random()* game.settings.boardSize.x)),
                y:Math.floor((Math.random()* game.settings.boardSize.y))
            };
            while (game.board[position.x][position.y] != 'e')
            {
                position.x = Math.floor((Math.random()* game.settings.boardSize.x));
                position.y = Math.floor((Math.random()* game.settings.boardSize.y));
            }

            var bot = {
                id: bots.length,
                name: response.name,
                version: response.version,
                host: host,
                port: port,
                position: {}


            };
            game.bots.push();
        }
        callback();
    });
}
function takeTurn(){

    var botsMoved = 0;
//    moves = [];

    for (var i = 0; i < game.bots.length; i++) {
        var bot = game.bots[i];

        postToBot(bot.host,bot.port,"move",game,function(response){
//            response = {
//                direction: direction,
//                mine: Math.floor(Math.random()*2) // 0 || 1
//            }
            // todo : check for legal move

            if (response.mine){
                game.board[bot.position.x][bot.position.y] = "b";
            }else {
                game.board[bot.position.x][bot.position.y] = "e";
            }

            bot.position.x += response.x;
            bot.position.y += response.y;

//            response.bot = bot;
//            moves.push(response);

            botsMoved ++;

            if (botsMoved == game.bots.length) {

                for (var j = 0; j < game.bots.length; j++) {
                    var bot = game.bots[j];

                    // walked in to bomb
                    if (game.board[bot.position.x][bot.position.y] == 'b'){
                        //todo:// bot: die!!!
                    }
                    for (var k = j + 1; k < game.bots.length; k++) {
                        var bot2 = game.bots[k];
                        // samma ruta
                        if (bot.position.x == bot2.position.x && bot.position.y == bot2.position.y){
                            // todo: bot and bot2 die
                        }
                    }
                    //todo:cahnge
                    game.board[bot.position.x][bot.position.y] = bot.id

                }

                game.round++;
                game.timer--;
                io.sockets.emit('updateGame', game);
                takeTurn();
            }


        });

    }

}
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
    var types = ["e","g","b","0"];
    var board = [];
    for (var i = 0; i < gameSettings.boardSize.x; i++){
        board[i] = [];
        for (var j = 0; j < gameSettings.boardSize.y; j++){
            board[i][j] = types[Math.round(Math.random() * 3)];
        }
    }
    return {
        round : 0,
        bots: [],
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
