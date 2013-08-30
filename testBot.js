
var http = require('http');

var port = 1337;
var serverHost = "127.0.0.1";



for (var i = 0; i < 4; i++) {
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
                console.log(body);

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
        name : "testBot",
        version : "0.1"
    }
}
function onMove(game){

    var direction = {x:0, y:0};

    while (Math.abs(direction.x) + Math.abs(direction.y) != 1) // we cant stand still
    {
        direction.x = Math.floor((Math.random()*3)-1); // -1 || 0 || 1
        direction.y = Math.floor((Math.random()*3)-1); // -1 || 0 || 1
    }

    return {
        direction: direction,
        mine: Math.floor(Math.random()*2) // 0 || 1
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
