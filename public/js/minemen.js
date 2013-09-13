var socket=null;

function getBotHSLColor(botIndex) {
    var h = parseInt(++botIndex) * 40;
    var s = 100;
    var l = 80;
    return 'hsl(' + h + '0,' + s + '%,' + l + '%)';
}

function startGame(){
    if(socket){
        document.getElementById("logarea").innerHTML = '';
        socket.emit("message",{message:"startGame"});
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
            createBotMenu(data.bots);
            onBots({message: data.bots});
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



    function onBots(data){
        var botsBody='';
        var bots = data.message;
        for (var i=0; i<bots.length; i++)
        {
            if(bots[i].alive)
            {
                botsBody += bots[i].name + " [ ALIVE ]<br>";
            }else{
                botsBody += bots[i].name + " [ DEAD ]<br>";
            }

        }
        document.getElementById('bots').innerHTML = botsBody;
    }
    socket.on('botRegistered', function (data) {
        //data = JSON.parse(data.message);
        createBotMenu(data.message.bots);
    });

    function createBotMenu(bots)
    {

        if( bots.length > 0 )
        {
            var playersDiv = document.getElementById('players');
            var playerDiv;
            playersDiv.innerHTML = "";

            for (var i = 0; i < bots.length; i++) {
                var bot = bots[i];

                console.log("playersDiv.children.length: " + playersDiv.children.length);
                playerDiv = "<div id='players" + bot.id + "' class='player'><img src='" + (bot.avatar) + "' /><div class='score'><img src='gfx/gold_half.gif' />" + bot.points + "</div><div class='playerName'>" + bot.name + "</div></div>";
                playersDiv.innerHTML += playerDiv;
            }
        }
    }



    socket.on('debug', function (data) {
        var log = document.getElementById("logarea");
        var text = log.innerHTML;
        log.innerHTML = data.log + '\n' + text;
    });

}