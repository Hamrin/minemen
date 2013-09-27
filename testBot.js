
var http = require('http');

var port = 1337;
var serverHost = "127.0.0.1";
var players = 15;


for (var i = 0; i < players; i++) {
    http.createServer(function (request, res) {
        // handle the routes
        if (request.method == 'POST') {


            var body = '';
            request.on('data', function (data) {
                body += data;
            });
            request.on('end', function () {

                console.log("message received.");
                console.log(request.url);
//                console.log(body);
                body = JSON.parse(body);


                var response = {};

                if (request.url == '/ping'){
                    response = onPing();
                }
                else if (request.url == '/start'){
                    response = onStart(body);
                }
                else if (request.url == '/move'){

                    response = onMove(body);
                }
                else if (request.url == '/log'){
                    response = onLog(body);
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify(response));
                res.end();

            });
        }
        else {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Hello THis is Tha BOT.\n');
        }
    }).listen(port + i, '0.0.0.0');
}
function onPing(){
    return {message: "pong"};
}
function onStart(game){
    return {
        name : "Jesper testBot",
        version : "0.1"
//        avatar : "http:/imgurl.png"
    }
}
function onMove(game){

    var direction = undefined;

    var myBot = game.bots[game.yourID];

    var directions = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
    while (
        direction == undefined || // try a new direction if we have not chosen one yet or..
        (
            directions.length != 0  &&  //if we still have another choice and...
            (
                myBot.position.x + direction.x >= game.board.length || myBot.position.x + direction.x < 0|| //...or if we will step out of the board (x)
                myBot.position.y + direction.y >= game.board[0].length || myBot.position.y + direction.y < 0 ||  //...or if we will step out of the board (y)
                game.board[myBot.position.x + direction.x][myBot.position.y + direction.y] == 'b' //...or if we will step on a mine
            )
        )
        )
    {
        var pickAtIndex = Math.floor((Math.random() * directions.length));
        direction = directions.splice(pickAtIndex,1)[0];
        console.log("tried: " + directions);
        console.log("tried: " + directions.length);
        console.log("tried: " + pickAtIndex);
        console.log("tried: " + direction);
    }

    var layMine = Math.floor(Math.random() * 5 / 4);
    return {
        direction: direction,
        mine: layMine // 1 || 0
    }
}
function onLog(data){

    if (data.message){
        console.log("server message: " + data.message);
    }
    if (data.error){
        console.log("===== server error: " + data.error);
    }
    return {};
}


//}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
