
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
                console.log(body);

                var response = {};

                if (request.url == '/ping'){

                    response.message = "pong";

                }
                else if (request.url == '/start'){
                    var game = body;
                    response = {
                        name : "testBot",
                        version : "0.1"
                    }
                }
                else if (request.url == '/move'){

                    var game = body;

                    var direction = {x:0, y:0};
                    while (direction.x == 0 && direction.y == 0) // we cant stand still
                    {
                        direction.x = Math.floor((Math.random()*3)-1); // -1 || 0 || 1
                        direction.y = Math.floor((Math.random()*3)-1); // -1 || 0 || 1
                    }

                    response = {
                        direction: direction,
                        mine: Math.floor(Math.random()*2) // 0 || 1
                    }
                }
                else if (request.url == '/log'){
                    var data = {
                        message : "just a message",
                        error : "if error"
                    };

                    data = body;
                    if (data.message){
                        console.log("server message: " + data.message);
                    }
                    if (data.error){
                        console.log("===== server error: " + data.error);
                    }
                }
                res.write(JSON.stringify(response));

//            res.writeHead(200, {'Content-Type': 'text/plain'});
//            res.end('Bot says thank you.\n');
            });
        }
        else {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Hello THis is Tha BOT.\n');
        }
    }).listen(port + i, '0.0.0.0');
}


//}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
