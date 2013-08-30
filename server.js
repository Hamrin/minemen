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

var viewConnected = false;
var game = newGame();

io = io.listen(httpServer);
io.sockets.on('connection', function(socket){
    console.log('Client Connected');

    socket.emit('updateGame', game);
    logToView('updateGame');

    // register testBots
    for (var i = 0; i < game.settings.maxPlayers; i++) {
        registerBot("127.0.0.1", 1337 + i, function(){
            console.log("register");

            console.log(game.bots.length + ":" + game.settings.maxPlayers);

            if (game.bots.length == game.settings.maxPlayers)
                setInterval(function(){
                    takeTurn();
                    console.log("turn");
                    logToView('new turn');
                },2000);
        });
    }


//
//    setInterval(function(){
//        socket.emit('updateGame', game);
//        console.log("SENDING VIEW"); //TODO: ONLY SENd when turn done
//    },3000);
//    socket.on('message', function(data){
//        socket.broadcast.emit('server_message',data);
//    });
    socket.on('disconnect', function(){
      console.log('Client Disconnected.');
    });
});

server.post('/register', function(req, res) {
    console.log('-- Register Bot: --');
    console.log(req.body.name + "@" + req.body.ip + ":" + req.body.port);
    console.log('-------------------');
    logToView('Bot registered:\n\t ' + req.body.name + "@" + req.body.ip + ":" + req.body.port);
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

var logToView = function(logMsg) {
    io.sockets.emit('debug', {log:logMsg});
};


var botTemplate = {
    id:0,
    name:"noName",
    version: "0.1",
    host:"yourIP.com",
    port:1337,
    position:{x:0,y:0},
    color:0xFF00FF,
    avatar: 'http://qph.is.quoracdn.net/main-thumb-t-320337-50-6cPmQu84LkMbOYDGaRXbK2vP4vV4SnBq.jpeg',
    points:0
};

var botExample2 = {
    id:1,
    name:"sampleBot2001",
    host:"yourIP1.com",
    port:5353,
    startPosition:{x:1,y:1},
    color:0xFF00FF,
    avatar: '',
    points:0
};


function registerBot(host, port, callback){
    tmpBot = {host:host, port:port, position:{x:0,y:0}};
    postToBot(tmpBot, "start", game, function(bot, response){
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
                id: game.bots.length,
                name: response.name,
                version: response.version,
                host: host,
                port: port,
                position: position,
                alive: true


            };
            game.bots.push(bot);
        }
        callback();
    });
}
function takeTurn(){

    getBotMoves(handleMoves);

    function getBotMoves(callback){
        var movesCollected = 0;
        var moves = [];
        for (var i = 0; i < game.bots.length; i++) {
            var bot = game.bots[i];

            if (!bot.alive) {
                movesCollected++;
                moves[bot.id] = undefined;
            }

            postToBot(bot, "move" ,game, function(bot, move) {
                // validate response
                if (move.direction && move.direction.x && move.direction.y &&
                    Math.abs(move.direction.x) + Math.abs(move.direction.y) == 1 &&
                    move.mine && (move.mine == 1 || move.mine == 0)){
                    moves.push(undefined);
                    //todo:message
                }else {
                    moves[bot.id] = move;
                }

                movesCollected ++;
                if (movesCollected == game.bots.length) {
                    callback(moves);
                }
            });
        }
    }

    function handleMoves(moves){
        // update old position on map('b' or 'e') && update bot position.
        for (var i = 0; i < moves.length; i++) {
            var move = moves[i];
            var bot = game.bots[i];

            if (bot.alive){

                // todo: now invalid move kills the bot
                // validate response
                if (move == undefined){
                    // todo: bot feedback
                    bot.alive = false;
                    game.board[bot.position.x][bot.position.y] = "e";
                    logToView("bot" + bot.id + " died by sending an illegal move");
                }
                else {

                    //clear old position
                    if (move.mine){
                        game.board[bot.position.x][bot.position.y] = "b";
                    }else {
                        game.board[bot.position.x][bot.position.y] = "e";
                    }

                    logToView("bot" + bot.id + " moves x:" + move.direction.x + ", y: " + move.direction.y);
                    bot.position.x += move.direction.x;
                    bot.position.y += move.direction.y;

                }
            }
        }

        // check if someone died and put there new position on the map
        for (var j = 0; j < game.bots.length; j++) {
            var bot = game.bots[j];

            if (bot.alive){
                // end of board
                if (bot.position.x >= game.board.length || bot.position.x < 0 ||
                    bot.position.y >= game.board[0].length || bot.position.y < 0){
                    bot.alive = false;
                    logToView("bot" + bot.id + " died by stepping of the board");
                }

                // walked in to mine
                else if (game.board[bot.position.x][bot.position.y] == 'b'){
                    bot.alive = false;
                    logToView("bot" + bot.id + " died by walking in to a mine" );
                }
                else {
                    for (var k = j + 1; k < game.bots.length; k++) {
                        var bot2 = game.bots[k];
                        // samma ruta
                        if (bot.position.x == bot2.position.x && bot.position.y == bot2.position.y){
    //                        && bot.alive && bot2.alive){
                            bot.alive = false;
                            bot2.alive = false;
                            logToView("bot" + bot.id + "and bot" + bot2.id + " died by walking in to a each other");
                        }
                    }
                }

                if (bot.alive)
                {
                    game.board[bot.position.x][bot.position.y] = bot.id;
                }
                console.log(game.board);//todo: find
            }
        }


//        //todo: maybe keep them
//        // remove dead bots
//        game.bots = game.bots.filter(function (bot) {
//            return bot.alive;
//        });

        game.round++;
        game.timer--;
        io.sockets.emit('updateGame', game);
        console.log("update view");
    }
}


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
//            board[i][j] = types[Math.round(Math.random() * 3)];
            board[i][j] = types[0];
        }
    }
    return {
        round : 0,
        bots: [],
        timer: gameSettings.gameLength,
        board: board,
        settings: gameSettings
    };
}

/**
 * to post messages to bots
 * usage:
 * postToBot("127.0.0.1",1337,"ping",{data:"cool data"}, function(response){});
 * todo:timeout
 */

function postToBot(bot, message, data, callback) {

    data = JSON.stringify(data);

    var options = {
        hostname: bot.host,
        port: bot.port,
        path: '/' + message,
        method: 'POST'
    };

    var request = http.request(options, function(response) {
        console.log('STATUS: ' + response.statusCode);
        console.log('HEADERS: ' + JSON.stringify(response.headers));
        response.setEncoding('utf8');

        var responseData = '';
        response.on('data', function(chunk) {
            responseData += chunk;
        });
        response.on('end', function() {
            console.log('responce:');
            console.log(responseData);
            responseData = JSON.parse(responseData);
            console.log(responseData);
            callback(bot, responseData);
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

//    var responseData = '';
//    request.on('response', function(response) {
//        console.log('onResponce:');
//        response.on('data', function(chunk) {
//            console.log('onData2:');
//            responseData += chunk;
//        });
//        response.on('end', function() {
//            console.log('onend2:');
//            responseData = JSON.parse(responseData);
//            callback(responseData);
//        });
//    });

    request.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    // write data to request body
    request.write(data);
    request.end();
}
