var fs = require('fs');
var client = require('socket.io-client');
var socket = client.connect('http://localhost:3000');
socket.on('connect', function() {
    console.log('connection has been established.');

    //socket.emit('message', '話してほしいこと');

    socket.on('voice', function(msg) {
        console.log("Rcv audio:" + msg.audio);

        var writeStream = fs.createWriteStream('talk.wav');
        writeStream.on('drain', function(){})
            .on('error', function(exception){
                console.log('exception:' + exception);
            })
        .on('close', function() {
            console.log('write stream closed.');
        })
        .on('pipe', function(src){});

        writeStream.write(msg.buffer, 'binary');
        writeStream.end();
    });

    socket.on('test', function(msg){
        console.log('receive message:' + msg);
    });

    socket.on('exit', function(msg){
        socket.disconnect();
        process.exit(0);
    });
});
