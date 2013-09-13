var socket=null;

function getBotHSLColor(botIndex) {
    var h = parseInt(++botIndex) * 40;
    var s = 100;
    var l = 80;
    return 'hsl(' + h + '0,' + s + '%,' + l + '%)';
}

function startGAME(){
    if(socket){
        socket.emit("message",{message:"startGAME"});
    }
}

window.onload = function() {
    console.log('window on load');
    socket = io.connect('http://localhost:8081');
    var content = document.getElementById("content");
    socket.emit("connection",{message:"hello from view"});
    socket.on('updateGame', function (data) {
        console.log(data.board.length);
        if(data) {
            bots = data.bots;
            content.innerHTML = "";
            for (var i = 0; i < data.board.length; i++) {
//                    console.log(data.board[i]);
                content.innerHTML += "<div class='wrapper' id='y" + i + "'</div>";
                for (var j = 0; j < data.board[i].length; j++) {
                    var wrapper = document.getElementById('y' + i);
                    var cellValue = data.board[i][j];
                    var isnum = /^\d+$/.test(cellValue);
                    if(isnum) {
                        console.log("Number of bots: " + bots.length + ": (" + bots + ")");
                        for(var bot in bots) {
                            if(cellValue == bots[bot].id.toString()) {
                                console.log("Found bot " + bots[bot].id + " on board at " + "x:" + j + ", y:" + i);
                            }
                        }

                        var theBot = bots[parseInt(cellValue)];

                        // If the bot has an avatar: show that, otherwise assign it a colour.
                        if(theBot.hasOwnProperty('avatar') && theBot.avatar.length > 1)
                        {
                            console.log("Avatar: " + theBot.avatar);

                            wrapper.innerHTML += "<div class='bot' style='background-image: url(" + theBot.avatar + "); width: 50px; height:50px;'</div>";
                        }
                        else
                        {
                            wrapper.innerHTML += "<div class='bot' name='bot" + cellValue + "' style='background-color:" + getBotHSLColor(cellValue) + "; width: 50px; height:50px;'</div>";
                        }
                    } else {
                        wrapper.innerHTML += "<div class='" + cellValue + "' id='x" + j + "'</div>";
                    }
                }
            }
        } else {
            console.log("There is a problem:", data);
        }
    });
    socket.on('debug', function (data) {
        var log = document.getElementById("logarea");
        log.innerHTML += '\n' + data.log;
    });

}