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
		var data = "Connected !!";       
        res.writeHead(200);
        res.end(data);
}    

var port = process.env.PORT || 5000;
app.listen(port, function() {
  	console.log("Listening on " + port);
});