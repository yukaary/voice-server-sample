var fs      = require('fs');
var spawn   = require('child_process').spawn
var parser  = require('body-parser');
var app     = require('express')();
var server  = require('http').Server(app);
var io      = require('socket.io')(server);
var ECT     = require('ect');

var util    = require('util');

server.listen(3000);
console.log('Server running at http://127.0.0.1:3000/');

// parse application/x-www-form-urlencoded
app.use(parser.urlencoded({ extended: false }));
// These are not working with curl on windows.
/*
// parse application/json
app.use(parser.json());
// parse application/vnd.api+json as json
app.use(parser.json({ type: 'application/vnd.api+json' }))
*/

app.engine('ect', ECT({ watch: true, root: __dirname + '/views', ext: '.ect' }).render);
app.set('view engine', 'ect');

app.get('/', function(req, res){
    res.render('index', { message: '' });
});

app.post('/talk', function(req, res){
    console.log(req.body.message);
    res.render('index', { message: req.body.message });
    var voiceroid = spawn('VoiceConsoroid.exe', ['yukari', 'record', req.body.message]);
    voiceroid.on('exit', function(code){
        console.log('process exit with code ' + code);
        fs.readFile('voice.wav', function(err, buf){
            io.sockets.emit('voice', {audio: true, buffer: buf});
        });
    });
        
    voiceroid.stderr.on('data', function(data) {
        console.log('stderr:' + data);
    });
});

app.get('/kill', function(req, res){
});

io.on('connection', function(client) {
    console.log('some client has been connected.');
    client.on('message', function(msg) {
        console.log('receive message:' + msg);

        var voiceroid = spawn('VoiceConsoroid.exe', ['yukari', 'save', msg]);
        voiceroid.on('exit', function(code){
            console.log('process exit with code ' + code);
            fs.readFile('voice.wav', function(err, buf){
                client.emit('voice', {audio: true, buffer: buf});
            });
        });
        voiceroid.stderr.on('data', function(data) {
            console.log('stderr:' + data);
        });
    });
});

