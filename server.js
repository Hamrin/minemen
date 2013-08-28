var http = require('http')
	,	app = require('http').createServer(handler)
    , 	io = require('socket.io').listen(app, { log:false})
    , 	fs = require('fs');

io.sockets.on('connection', function (socket) {

    socket.on('access_token', function (data){

    var reqLong_Token = http.get(long_token, function (token) {

    						token.on('data', function (chunk) {

        					});

	        				token.on('end', function (res){

        					});

	    });
    reqLong_Token.end();       
    });
});
    
function handler(req, res) { 
		var data = "Hello Everyone Welcome to the HACK TIME FUN Project... !!";
        res.writeHead(200);
        res.end(data);
}    

var port = process.env.PORT || 5000;
app.listen(port, function() {
  	console.log("Listening on " + port);
});


var gameSetings = {
    botTimeout:"100", //ms
    gameLenth:5000, //turns
    boardSize:{x:5, y:5}
};

var botExample = {
    id:0,
    name:"sampleBot2000",
    url:"http://yourIP.com:4000",
    startPosition:{x:0,y:0},
    points:0
};

var exampleBoard =
    [
        ["e","e","e","e","e"],
        ["e","e","e","e","e"],
        ["e","e","g","b","e"],
        ["e","e","e","e","e"],
        ["e","e","e","e","e"]
    ];
// "e" = empty
// "b" = bomb
// "g" = gold
// id/index = player

function newGame() {
    var board = [];
    for (var i = 0; i < gameSetings.boardSize.x; i++){
        board[i] = [];
        for (var j = 0; j < gameSetings.boardSize.y; j++){
            board[i][j] = "e";
        }
    }
    return {
        round : 0,
        bots: [botExample],
        board: exampleBoard,
        timer: gameSetings.gameLenth,
        settings: gameSetings
    };
};
