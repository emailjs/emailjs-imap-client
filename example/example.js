require(["../browserbox"], function(browserbox) {

    window.connect = function(){
        var host = document.getElementById("host").value,
            port = Number(document.getElementById("port").value) || undefined;

        window.log("Connecting to " + host + ":" + port + "...");

        var imap = browserbox(
            host, 
            port,
            {
                auth: {
                    user: document.getElementById("user").value,
                    pass: document.getElementById("pass").value
                }
            });

        imap.onerror = window.log.bind(window);
        imap.onclose = function(){
            window.log("Connection to server closed");
        }

        imap.connect();
    }

    window.log = function(data){
        var str;
        if(data && data.data){
            data = data.data;
        }
        if(/ArrayBuffer/.test(Object.prototype.toString.call(data))){
            str = (new TextDecoder("utf-8")).decode(new Uint8Array(data));
        }else if(/Error\]$/.test(Object.prototype.toString.call(data))){
            str = data.message || data.name || data;
        }else if(typeof data == "object"){
            str = JSON.stringify(data, false, 4);
        }else{
            str = data;
        }

        document.getElementById("log").innerHTML += str + "\n";
    }

    document.getElementById("connect").addEventListener("click", window.connect.bind(connect), false);
});
