
var http = require('http');

http.createServer(function (request, res) {
    // handle the routes
    if (request.method == 'POST') {


        var body = '';
        request.on('data', function (data) {
            body += data;
        });
        request.on('end', function () {

            console.log("post it real good!");
            console.log(body);

            if (request.url == '/ping'){

            }
            else if (request.url == '/start'){

            }
            else if (request.url == '/move'){

            }

            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Bot says thank you.\n');
        });
    }
    else {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Hello THis is Tha BOT.\n');
    }
}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');
