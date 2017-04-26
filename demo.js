var server = require('http').createServer(),
    io = require('socket.io')(server),
    port = 1337,
    connections = {};
    server.listen(port);

var request = require('request');
var Memcached = require('memcached');
var PHPUnserialize = require('php-unserialize');

var url = require('url');

console.info('SocketIO > listening on port ' + port);

io.sockets.on('connection', function (socket) {

    socket.on('join', function (data) {
        connections[socket.id] = data.currentUserId;
        socket.join(data.currentUserId); // create socket io room
    });

    socket.on('sendMessage', function (message) {
        if (message.id) {
            io.sockets.in(message.id).emit('onMessage', message); //emit on exact room
        }
    });

    socket.on('disconnect', function () {
        var memcached = new Memcached('localhost:11211');
        var sessionId = socket.request._query['sesssionId'];
        memcached.get('memc.sess.'+ sessionId , function (err, result) {
            var urlStatus = 'https://xyzaffiliates.betcoapps.com/global/api/User/change-login-status/?session=' + sessionId;
            // if (!result) {
            //     changeLoginStatus(urlStatus)
            // } else {
            //     try {
                    cookieData = PHPUnserialize.unserializeSession(result);
                    console.log(cookieData);
                    if (!cookieData.isLogged) {
                        changeLoginStatus(urlStatus)
                    }
                // } catch (err) {
                //     console.log(err);
                // }
            // }
        });

        socket.leave(connections[socket.id]);
        delete connections[socket.id];
        console.info('SocketIO > disconnect on port ' + port);
    });
});

server.on('request', function (req, res) {

    if (req.method == 'POST') {
        var data = '';
        req.on('data', function (chunk) {
            console.log("Received body data:");
            data += chunk;
        });

        req.on('end', function () {
            if(isJson(data)) {
                var obj = JSON.parse(data);
                for(var i=0; i<obj.length; i++) {
                    if (obj[i].id && obj[i].unread && obj[i].all) {
                        var message = {
                            id: obj[i].id,
                            unread: obj[i].unread,
                            all: obj[i].all
                        };
                        // console.log(message.id, message.unread.totalRecordsCount);
                        io.sockets.in(message.id).emit('onMessage', message); //emit on exact room
                    }
                }
            }

            res.writeHead(200);
            res.end();
        });
    }
});

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function changeLoginStatus(urlStatus) {
    request(urlStatus, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
        }
    });
}

