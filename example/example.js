require(["../browserbox"], function(browserbox) {

    try{
        var userData = JSON.parse(localStorage.userData);
        document.getElementById("host").value = userData.host;
        document.getElementById("port").value = userData.port;
        document.getElementById("user").value = userData.user;
        document.getElementById("pass").value = userData.pass;
    }catch(E){}

    try{
        chrome.storage.local.get("userData", function(result){
            if(!result || !result.userData){
                return;
            }
            var userData = result.userData;
            document.getElementById("host").value = userData.host;
            document.getElementById("port").value = userData.port;
            document.getElementById("user").value = userData.user;
            document.getElementById("pass").value = userData.pass;
        });
    }catch(E){}

    window.connect = function(){
        var userData = {
            host: document.getElementById("host").value,
            port: Number(document.getElementById("port").value) || undefined,
            user: document.getElementById("user").value,
            pass: document.getElementById("pass").value
        };

        try{
            localStorage.userData = JSON.stringify(userData);
        }catch(E){}
        try{
            chrome.storage.local.set({"userData": userData});
        }catch(E){}

        window.log("Connecting to " + userData.host + ":" + userData.port + "...");

        var client = browserbox(userData.host, userData.port, {
            auth: {
                user: userData.user,
                pass: userData.pass
            }
        });

        client.onlog = function(type, payload){
            window.log(type + ": " + payload);
        }

        client.onerror = window.log.bind(window);

        client.onclose = function(){
            window.log("Connection to server closed");
        }
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

        document.getElementById("log").value += str + "\n";
    }

    document.getElementById("connect").addEventListener("click", window.connect.bind(connect), false);
});
