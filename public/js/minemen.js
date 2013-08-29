function getBotHSLColor(botIndex) {
    var h = parseInt(++botIndex) * 40;
    var s = 100;
    var l = 80;
    return 'hsl(' + h + '0,' + s + '%,' + l + '%)';
}

window.onload = function() {
    console.log('window on load');

    var socket = io.connect('http://localhost:8081');
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
                    var obj = data.board[i][j];
                    var isnum = /^\d+$/.test(obj);
                    if(isnum) {
                        for(var bot in bots) {
                            if(obj == bots[bot].id.toString()) {
                                console.log("Found bot " + bots[bot].id + " on board at " + "x:" + j + ", y:" + i);
                            }
                        }

                        console.log("Avatar: " + bots[parseInt(data.board[i][j])].avatar);

                        // If the bot has an avatar: show that, otherwise assign it a colour.
                        if(bots[bot].hasOwnProperty('avatar') && bots[bot].avatar.length > 1)
                        {
                            wrapper.innerHTML += "<div class='bot' style='background-image: url(" + bots[parseInt(data.board[i][j])].avatar + "); width: 50px; height:50px;'</div>";
                        }
                        else
                        {
                            wrapper.innerHTML += "<div class='bot' name='bot"+data.board[i][j]+"' style='background-color:" + getBotHSLColor(data.board[i][j]) + "; width: 50px; height:50px;'</div>";
                        }
                    } else {
                        wrapper.innerHTML += "<div class='" + data.board[i][j] + "' id='x" + j + "'</div>";
                    }
                }
            }
        } else {
            console.log("There is a problem:", data);
        }
    });

}