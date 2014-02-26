/* jshint browser: true */
/* global define: true, expect: true, equal: true, test: true*/

define(['../lib/imap.js', '../bower_components/mimefuncs/mimefuncs.js'], function(imap, mimefuncs){

    "use strict";

    module("ondata");

    test("normal", function(){
        var client = imap("localhost", 143);

        expect(3);

        var list = [
            "* 1 FETCH (UID 1)",
            "* 2 FETCH (UID 2)",
            "* 3 FETCH (UID 3)",
        ], pos = 0;

        client._addToServerQueue = function(cmd){
            equal(cmd, list[pos++], cmd);
        };

        for(var i=0; i<list.length; i++){
            client._onData({data: mimefuncs.toArrayBuffer(list[i] + "\r\n").buffer});
        }

    });

    test("chunked", function(){
        var client = imap("localhost", 143);

        expect(3);

        var input = ["* 1 FETCH (UID 1)\r\n* 2 F", "ETCH (UID 2)\r\n* 3 FETCH (UID 3", ")\r\n"];

        var output = [
            "* 1 FETCH (UID 1)",
            "* 2 FETCH (UID 2)",
            "* 3 FETCH (UID 3)"
        ], pos = 0;

        client._addToServerQueue = function(cmd){
            equal(cmd, output[pos++], cmd);
        };

        for(var i=0; i<input.length; i++){
            client._onData({data: mimefuncs.toArrayBuffer(input[i]).buffer});
        }

    });

    test("split", function(){
        var client = imap("localhost", 143);

        expect(1);

        var input = ["* 1 ", "F", "ETCH (", "UID 1)", "\r", "\n"];

        var output = [
            "* 1 FETCH (UID 1)"
        ], pos = 0;

        client._addToServerQueue = function(cmd){
            equal(cmd, output[pos++], cmd);
        };

        for(var i=0; i<input.length; i++){
            client._onData({data: mimefuncs.toArrayBuffer(input[i]).buffer});
        }

    });

    test("chunked literal", function(){
        var client = imap("localhost", 143);

        expect(3);

        var input = [
            "* 1 FETCH (UID {1}\r\n1)\r\n* 2 FETCH (UID {4}\r\n2345)\r\n* 3 FETCH (UID {4}","\r\n3789)\r\n"
        ];

        var output = [
            "* 1 FETCH (UID {1}\r\n1)",
            "* 2 FETCH (UID {4}\r\n2345)",
            "* 3 FETCH (UID {4}\r\n3789)"
        ], pos = 0;

        client._addToServerQueue = function(cmd){
            equal(cmd, output[pos++], cmd);
        };

        for(var i=0; i<input.length; i++){
            client._onData({data: mimefuncs.toArrayBuffer(input[i]).buffer});
        }

    });

});