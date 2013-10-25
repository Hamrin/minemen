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
    server.use(server.router);
    server.use(express.static(__dirname + '/public'));
});


var port = 8081;
var httpServer = server.listen(port);
var gameSettings = {
    turnDuration:200, //ms (needs to be a bit higher than bot timeout!)
    botTimeout:2000, //ms
    gameLength:500, //turns
//    boardSize:{x:50, y:50},
//    boardSize:{x:10, y:10},
    boardSize:{x:15, y:20},
    maxPlayers: 3,
    goldFrequency: 5

};

var games = [];

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

    socket.on('init', function(data){
        console.log('MESSAGE FROM BROWSER: init: ' + data.gameId );
        if (data.hasOwnProperty("gameId") && data.gameId >= 0 && data.gameId < games.length){
            socket.join(data.gameId);
            var game = games[data.gameId];
            socket.emit('updateGame', game);
        }else {
            socket.emit('debug', {log:"game not found: " + data.gameId ? data.gameId : ""});
        }
    });


    socket.on('startGame', function(data){
        console.log('MESSAGE FROM BROWSER: Start Game');

        if (data.hasOwnProperty("gameId") && data.gameId >= 0 && data.gameId < games.length){


            var game = games[data.gameId];
            io.sockets.in(game.id).emit('updateGame', game);
            logToView(game, 'updateGame');

            startGame(game);
        }
        else{
            socket.emit('debug', {log:"game not found: " + data.gameId ? data.gameId : ""});
        }
    });

    socket.on('addTestBot', function(data){
        if (data.hasOwnProperty("gameId") && data.gameId >= 0 && data.gameId < games.length){
            var game = games[data.gameId];
            registerBot(game, "127.0.0.1", 1337, function(){
                console.log("register");
                console.log(game.bots.length + ":" + game.settings.maxPlayers);

            });
        }
        else{
            socket.emit('debug', {log:"game not found: " + data.gameId ? data.gameId : ""});
        }
    });

    socket.on('disconnect', function(){
      console.log('Client Disconnected.');
    });
});

server.post('/register', function(req, res) {

    var game;
    if(req.body.gameId < 0 || req.body.gameId >= games.length){
        game = games.length - 1;
    }
    else {
        game = games[req.body.gameId];
    }

    console.log('-- Register Bot: --');
    console.log(req.body.name + "@" + req.body.ip + ":" + req.body.port + "in game: " + game.id);
    console.log('-------------------');

    logToView(game, 'Bot registering:\n\t ' + req.body.name + "@" + req.body.ip + ":" + req.body.port);
    registerBot(game, req.body.ip, req.body.port, function(){
        logToView(game, 'Bot has registered:\n\t ' + req.body.name + "@" + req.body.ip + ":" + req.body.port);
    });
    res.send('Bot registered!');
});

///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function(req, res){
    return res.redirect('/game/');
});

server.get('/game/', function(req,res){
        var game = newGame();
        return res.redirect('/game/'+ game.id);
});
server.get('/game/:id', function(req,res){
    if(games.length <= req.params.id || req.params.id < 0) {
        var game = newGame();
        return res.redirect('/game/'+ game.id);
//        res.statusCode = 404;
//        return res.send('Error 404: No game found');
    }

    return res.sendfile(__dirname + '/public/index.html');
});


///////////////////////////////////////////
//              Stop Game              //
//////////////////////////////////////////

server.get('/stop', function(request,response,next){
    game = null;

    response.writeHead(200);
    response.end();
});

function startGame(game){
    console.log("Start game: " + game.id);

//    if(checkAllDead(game))
//    {
//        var newBots = [];
//        for (var i = 0; i < game.bots.length; i++) {
//            var oldBot = game.bots[i]
//            newBots.push(oldBot);
//        }
//
//        game = newGame();
//        game.bots = newBots;
//    }

    function start(){

        var nextTurn = function(){

            var turnDone = false;
            var turnReady = false;

            var afterTurn = function(){
                if(checkAllDead(game) || game.round == game.settings.gameLength)
                {
                    console.log("Game ended");
                }else {
                    console.log("turn");
                    logToView(game, 'new turn');
                    nextTurn();
                }
            };

            setTimeout(function(){
                turnDone = true;
                if (turnReady){
                    afterTurn();
                }
            }, game.settings.turnDuration);

            takeTurn(game, function() {
                turnReady = true;
                if (turnDone){
                    afterTurn()
                }
            });

        };
        nextTurn();

    }


    if (game.bots.length > 1)
    {
        start();
    }
}

function checkAllDead(game){
    var status = true;

    try{
        for(var i=0; i<game.bots.length; i++){
            if(game.bots[i].alive)
            {
                status = false;
            }
        }
    }catch(e){
        return true;
    }
    return status;
}

///////////////////////////////////////////
//             other stuff               //
///////////////////////////////////////////

var logToView = function(game, logMsg) {
    io.sockets.in(game.id).emit('debug', {log:logMsg});
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

function createBot(game, botData){

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
    return {
        id: game.bots.length,
        name: botData.name,
        version: botData.version,
        avatar: botData.avatar,
        host: botData.host,
        port: botData.port,
        position: position,
        points: 0,
        alive: true
    };
}
function registerBot(game, host, port, callback){
    var tmpBot = {host:host, port:port, position:{x:0,y:0}};
    postToBot(tmpBot, "start", game, function(bot, response){
//        response = {
//            name : "testBot",
//            version : "0.1",
//            avatar : "url"
//        }


        if (response.name && response.version) {

            bot.avatar = response.avatar;
            bot.name = response.name;
            bot.version = response.version;

            var newBot = createBot(game, bot);


            game.bots.push(newBot);
            io.sockets.in(game.id).emit('botRegistered',{message: game});
        }
        callback();
    });
}
function takeTurn(game, callback){

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


                var turnEnded = false;
                setTimeout(function(){
                    if (!turnEnded){
                        turnEnded = true;

                        var playersTimedOut = [];
                        for (var j = 0; j < game.bots.length; j++) {
                            if (moves[j] == undefined && game.bots[j].alive)
                            {
                                game.bots[j].alive = false;
                                playersTimedOut.push(j);
                            }
                        }
                        logToView(game,"some bots didn't respond in time: " + playersTimedOut.toString());
                        callback();

                    }
                }, game.settings.botTimeout);

                postToBot(bot, "move" ,game, function(bot, move) {
                    if (turnEnded){
                        return;
                    }
                    // validate response
                    if (move.direction && move.direction.x && move.direction.y &&
                        Math.abs(move.direction.x) + Math.abs(move.direction.y) == 1 &&
                        move.mine && (move.mine == 1 || move.mine == 0)){
                        moves[bot.id] = undefined;
                        //todo:message
                    }else {
                        moves[bot.id] = move;
                    }

                    movesCollected ++;
                    if (movesCollected == game.bots.length) {
                        turnEnded = true;
                        callback(moves);
                    }
                });
            }

        }
    }


    function handleMoves(moves){
        if (moves == undefined){
            moves = [];
        }

        // update old position on map('b' or 'e') && update bot position.
        for (var i = 0; i < moves.length; i++) {
            var bot = game.bots[i];

            if (bot.alive){
                try {
                    var move = moves[i];
                    console.log("move: " + i);
                    //clear old position
                    if (move.mine){
                        updateBoard(bot.position.x, bot.position.y, "b");
                    }else {
                        updateBoard(bot.position.x, bot.position.y, "e");
                    }
                    //                    logToView(game, "Bot : " + bot.name + " moves x:" + move.direction.x + ", y: " + move.direction.y);
                    bot.position.x += move.direction.x;
                    bot.position.y += move.direction.y;
                } catch(err) {
                    bot.alive = false;
                    updateBoard(bot.position.x, bot.position.y, "e");
                    logToView(game, "Bot : " + bot.name + " died by sending an illegal move, caused: " + err);
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
                    logToView(game, "Bot : " + bot.name + " died by stepping of the board");
                }

                // walked in to mine
                else if (game.board[bot.position.x][bot.position.y] == 'b'){
                    bot.alive = false;
                    logToView(game, "Bot : " + bot.name + " died by walking in to a mine" );
                }
                else {
                    for (var k = j + 1; k < game.bots.length; k++) {
                        var bot2 = game.bots[k];
                        // samma ruta
                        if (bot.position.x == bot2.position.x && bot.position.y == bot2.position.y && bot.alive && bot2.alive){
    //                        && bot.alive && bot2.alive){
                            bot.alive = false;
                            bot2.alive = false;
                            logToView(game, "bot" + bot.id + "and bot" + bot2.id + " died by walking in to a each other");
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
        io.sockets.in(game.id).emit('updateGame', game);
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
    getBotMoves(function(moves){
        handleMoves(moves);
        callback();
    });

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

    var game = {
        id: games.length,
        round : 0,
        bots: [],
        timer: gameSettings.gameLength,
        board: board,
        settings: gameSettings
    };
    games.push(game);
    return game;
}

/**
 * to post messages to bots
 * usage:
 * postToBot("127.0.0.1",1337,"ping",{data:"cool data"}, function(response){});
 */

function postToBot(bot, message, data, callback) {

    data = JSON.stringify(data);

    var options = {
        hostname: bot.host,
        port: bot.port,
        path: '/' + message,
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        }
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
        console.log('problem with request: ' +  JSON.stringify(options));
    });

    // write data to request body
    request.write(data);
    request.end();
}
