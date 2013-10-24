/**

server UI:  (to prevent image flickering run in firefox)
    http://staff.videoplaza.org:8081/
    press new game
    register your bots (the game id is in the url path)

to register a bot go a game to:
    http://staff.videoplaza.org:8081/register.html


bot API:
your bot need to respond to the following Json post calls:
    on "http://yourIp:yourPort/start" you should return yor bot details in json
        {
            name : "Your bot name",
            version : "0.1",
            avatar : "http://yourBotImageUrl30x30px.png"
        }

    on "http://yourIp:yourPort/move" you should return yor move in json
        {
            direction: {x:1,y:0}, // possible directions: {x:1,y:0} || {x:-1,y:0} || {x:0,y:1} || {x:0,y:-1}
            mine: layMine  // 1 || 0
        }


 the json posted to your bot will contain the game state
 the most important parts you need use are:
     board
        2d array with the mines/bombs, bots and gold.
        possible values:
            'g' = gold
            'e' = empty
            'b' = bomb
            [integer] = bot id. The id is also the bots index in the bots array

      yourID
        your bot id. You can access your bot position on the board by: bots[yourID].position

     settings.botTimeout
        make sure your bot responds fast. if it doesn't, it will die!

 this is the json object posted to your bot:
    {
        "id": 0,
        "round": 60, // game ends when round hits settings.gameLength
        "bots": [
            {
                "id": 0,
                "name": "Jesper testBot",
                "version": "0.1",
                "avatar": "http://a.deviantart.net/avatars/d/r/dr-robot.png?1",
                "host": "127.0.0.1",
                "port": 1337,
                "position": {
                    "x": 5,
                    "y": 7
                },
                "points": 0,
                "alive": true
            },
            {
                "id": 1,
                "name": "Jesper testBot",
                "version": "0.1",
                "avatar": "http://a.deviantart.net/avatars/d/r/dr-robot.png?1",
                "host": "127.0.0.1",
                "port": 1337,
                "position": {
                    "x": 7,
                    "y": 7
                },
                "points": 0,
                "alive": true
            }],
        "timer": 440, // game ends on 0
        "board": [
            ["e","e","e","e","e","e","g","e","e","e"],
            ["b","g","g","e","e","e","e","e","e","e"],
            ["e","b","e","e","e","e","e","e","e","e"],
            ["b","e","b","b","b","e","e","e","e","e"],
            ["b","e","b","b","e","b","b","e","e","e"],
            ["e","e","b","e","e","e","e", 0 ,"e","e"],
            ["b","e","e","e","e","e","e","g","e","e"],
            ["e","e","g","e","e","e","e", 1 ,"e","e"],
            ["b","e","e","e","e","e","b","b","e","e"],
            ["b","e","e","e","e","e","b","b","e","e"],
            ["e","e","e","e","e","e","e","e","e","e"]],
         "settings":{
                "turnDuration": 200,
                "botTimeout": 2000, // if the game server don't have the response in 2000ms yor bot will die
                "gameLength": 500, // maximum turns before the game ends
                "boardSize": { "x": 15, "y": 20},
                "goldFrequency": 5 // how often gold spawn
         },
        "boardUpdates": [],
        "yourID": 1
    }

 */

var http = require('http');
var port = 1337;

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
}).listen(port, '0.0.0.0');
//}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');

function onPing(){
    return {message: "pong"};
}
function onStart(game){
    return {
        name : "Jesper testBot",
        version : "0.1",
        avatar : "http://a.deviantart.net/avatars/d/r/dr-robot.png?1"
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

