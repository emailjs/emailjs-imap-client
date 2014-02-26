var net = require('net'),
    tls = require('tls'),
    fs = require("fs");

var targetHost = "imap.gmail.com", // "imap-mail.outlook.com",
    targetPort = "993",
    targetSecure = true,
    logfile = false,
    proxyPort = 1143;

var sessionCounter = 0,
    logStream = logfile ? fs.createWriteStream(logfile) : false,

    server = net.createServer(function(client) { //'connection' listener
        console.log('Client connected');

        var socket, target, session = ++sessionCounter;

        client.on('end', function() {
            console.log('Client disconnected');
            if(socket && !socket.destroyed){
                socket.end();
            }
        });

        client.on('data', function(chunk) {
            var str = (chunk || "").toString("utf-8").trim();
            if(str){
                console.log("CLIENT ("+session+"): " + str);
                if(logStream){
                    logStream.write("~~~~~~~~~~~~~~~~~= CLIENT ("+session+") =~~~~~~~~~~~~~~~~~~\r\n"+str+"\r\n");
                }
            }
        });

        client.on('error', function(err) {
            console.log("Client error");
            console.log(err);
            if(socket && !socket.destroyed){
                socket.end();
            }
        });
    console.log(targetPort, targetHost)
        var params = [targetPort, targetHost, function() {

                console.log("Server connected");

                socket = targetSecure ? target.socket : target;

                socket.setKeepAlive(true);

                if(client && !client.destroyed){
                    client.pipe(target);
                }else{
                    socket.end();
                }

            }];

        if(targetSecure){
            params.shift();
            params.shift();
            params.unshift({
                port: targetPort,
                host: targetHost
            });
        }

        var target = (targetSecure?tls:net).connect.apply((targetSecure?tls:net), params);

        target.on('data', function(chunk) {
            var str = (chunk || "").toString("utf-8").trim();
            if(str){
                console.log("SERVER ("+session+"): " + str);
                if(logStream){
                    logStream.write("~~~~~~~~~~~~~~~~~= SERVER ("+session+") =~~~~~~~~~~~~~~~~~~\r\n"+str+"\r\n");
                }
            }

            // do not announce compression support on IMAP
            if(str.match(/\bCOMPRESS\=[\w]+/)){
                chunk = new Buffer(str.replace(/COMPRESS\=[\w]+/g, "").trim()+"\r\n", "utf-8");
            }

            client.write(chunk);
        });

        target.on('end', function() {
            console.log("Server disconnected");
            client.end();
        });

        target.on('error', function(err) {
            console.log("Server error");
            console.log(err);
            client.end();
        });

    });

server.listen(proxyPort, function() { //'listening' listener
    console.log('Proxy bound');
});
