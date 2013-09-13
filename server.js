//setup Dependencies
var express = require('express')
    , io = require('socket.io')
    , http = require('http')
    , globalSocket = null;

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
//    boardSize:{x:50, y:50},
    boardSize:{x:15, y:20},
    maxPlayers: 3,
    goldFrequency: 5
};

var viewConnected = false;
var game = newGame();

var registeredBot1 = {
    id:0,
    name:"Kalle the Boter botter",
    version:"0.1",
    host:"yourIP.com",
    port:1337,
    position:{x:0,y:0},
    color:0xFF00FF,
    avatar:'http://qph.is.quoracdn.net/main-thumb-t-320337-50-6cPmQu84LkMbOYDGaRXbK2vP4vV4SnBq.jpeg',
    points:22
};

var registeredBot2 = {
    id:0,
    name:"Anna",
    version:"0.1",
    host:"yourIP.com",
    port:1337,
    position:{x:0,y:0},
    color:0xFF00FF,
    avatar:'http://qph.is.quoracdn.net/main-thumb-t-320337-50-6cPmQu84LkMbOYDGaRXbK2vP4vV4SnBq.jpeg',
    points:8
};

io = io.listen(httpServer);

io.sockets.on('connection', function(socket){


    console.log('Client Connected');
    globalSocket = socket;

    socket.emit('updateGame', game);
    logToView('updateGame');

//    // register testBots
//    game = newGame();
//    for (var i = 0; i < game.settings.maxPlayers; i++) {
//        registerBot("127.0.0.1", 1337 + i, function(){
//            console.log("register");
//            console.log(game.bots.length + ":" + game.settings.maxPlayers);
//
//            if (game.bots.length == game.settings.maxPlayers)
//                setInterval(function(){
//                    takeTurn();
//                    console.log("turn");
//                    logToView('new turn');
//
//                },200);
//        });
//    }


//
//    setInterval(function(){
//        socket.emit('updateGame', game);
//        console.log("SENDING VIEW"); //TODO: ONLY SENd when turn done
//    },3000);
//    socket.on('message', function(data){
//        socket.broadcast.emit('server_message',data);
//    });

    socket.on('message', function(data){
        console.log('MESSAGE TO START GAME FROM BROWSER')
        if(data.message == "startGame"){
            startGame();
        }
    });
    socket.on('disconnect', function(){
      console.log('Client Disconnected.');
    });
});

server.post('/register', function(req, res) {
    console.log('-- Register Bot: --');
    console.log(req.body.name + "@" + req.body.ip + ":" + req.body.port);
    console.log('-------------------');
    logToView('Bot registering:\n\t ' + req.body.name + "@" + req.body.ip + ":" + req.body.port);
    registerBot(req.body.ip, req.body.port, function(){
        logToView('Bot has registered:\n\t ' + req.body.name + "@" + req.body.ip + ":" + req.body.port);
    });
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
//              Stop Game              //
//////////////////////////////////////////

server.get('/stop', function(request,response,next){
    game = null;

    response.writeHead(200);
    response.end();
});

function startGame(){
    game = newGame();
    for (var i = 0; i < game.settings.maxPlayers; i++) {
        registerBot("127.0.0.1", 1337 + i, function(){
            console.log("register");
            console.log(game.bots.length + ":" + game.settings.maxPlayers);

            if (game.bots.length == game.settings.maxPlayers)
                var int = setInterval(function(){
                    takeTurn();
                    if(checkAllDead())
                    {
                        clearInterval(int);
                    }
                    console.log("turn");
                    logToView('new turn');

                },200);
        });
    }
}

function checkAllDead(){
    var status = true;
    for(var i=0; i<game.bots.length; i++){
        if(game.bots[i].alive)
        {
            status = false;
        }
    }
    return status;
}

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
                avatar: response.avatar,
                host: host,
                port: port,
                position: position,
                points: 0,
                alive: true
            };
            game.bots.push(bot);
            globalSocket.emit('botRegistered',{message: game});
        }
        callback();
    });
}
function takeTurn(){

    function getBotMoves(callback){
        var movesCollected = 0;
        var moves = [];
        for (var i = 0; i < game.bots.length; i++) {
            var bot = game.bots[i];

            if (!bot.alive) {
                movesCollected++;
                moves[bot.id] = undefined;
            }
            else {

                // tmp hack todo: change
                game.yourID = bot.id;

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
    }

    function handleMoves(moves){
        // update old position on map('b' or 'e') && update bot position.
        for (var i = 0; i < moves.length; i++) {
            var move = moves[i];
            var bot = game.bots[i];

            if (bot.alive){

                console.log("move: " + i);

                // todo: now invalid move kills the bot
                // validate response
                if (move == undefined){
                    // todo: bot feedback
                    bot.alive = false;
                    updateBoard(bot.position.x, bot.position.y, "e");
                    logToView("Bot : " + bot.name + " died by sending an illegal move");
                }
                else {

                    //clear old position
                    if (move.mine){
                        updateBoard(bot.position.x, bot.position.y, "b");
                    }else {
                        updateBoard(bot.position.x, bot.position.y, "e");
                    }

                    logToView("Bot : " + bot.name + " moves x:" + move.direction.x + ", y: " + move.direction.y);
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
                    logToView("Bot : " + bot.name + " died by stepping of the board");
                }

                // walked in to mine
                else if (game.board[bot.position.x][bot.position.y] == 'b'){
                    bot.alive = false;
                    logToView("Bot : " + bot.name + " died by walking in to a mine" );
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
                if (bot.alive && game.board[bot.position.x][bot.position.y] == 'g'){
                    bot.points ++;
                }

                if (bot.alive)
                {
                    updateBoard(bot.position.x, bot.position.y, bot.id);

                }
            }
        }
//        //todo: maybe keep them
//        // remove dead bots
//        game.bots = game.bots.filter(function (bot) {
//            return bot.alive;
//        });

        //spawn gold
        if (game.round % game.settings.goldFrequency == 0)
        {
            //find empty tiles
            var emptyTiles = [];
            for (var x = 0; x < game.board.length; x++) {
                for (var y = 0; y < game.board[0].length; y++) {
                    if (game.board[x][y] == 'e'){
                        emptyTiles.push({x:x,y:y});
                    }

                }
            }
            if (emptyTiles.length != 0)
            {
                // spawn gold!
                var spawnGoldAt = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
                updateBoard(spawnGoldAt.x, spawnGoldAt.y, "g");
            }
        }

        game.round++;
        game.timer--;
        io.sockets.emit('updateGame', game);
        console.log("update view");
    }


    function updateBoard(x,y,value){
        game.board[x][y] = value;
        game.boardUpdates.push({
            position:{x:x,y:y},
            value:value
        });
    }
    game.boardUpdates = [];
    getBotMoves(handleMoves);

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
//        console.log('STATUS: ' + response.statusCode);
//        console.log('HEADERS: ' + JSON.stringify(response.headers));
        response.setEncoding('utf8');

        var responseData = '';
        response.on('data', function(chunk) {
            responseData += chunk;
        });
        response.on('end', function() {
//            console.log('responce:');
//            console.log(responseData);
            responseData = JSON.parse(responseData);
//            console.log(responseData);
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
