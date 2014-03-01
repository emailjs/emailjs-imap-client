/* jshint browser: true */
/* global define: false, expect: false, equal: false, ok: false, test: false*/

define(["../browserbox.js"], function(browserbox){

    "use strict";

    module("check special use");

    test("SPECIAL-USE extension", function(err){
        var br = browserbox();
        br.capability = ["SPECIAL-USE"];

        equal(false, br._checkSpecialUse({}));
        equal(false, br._checkSpecialUse({flags: ["test"]}));
        equal("\\All", br._checkSpecialUse({flags: ["test", "\\All"]}));
    });

    test("No extension", function(err){
        var br = browserbox();

        equal(false, br._checkSpecialUse({name: "test"}));
        equal("\\Trash", br._checkSpecialUse({name: "Praht"}));
    });

    module("namespace");

    test("No namespace response", function(err){
        var br = browserbox();
        ok(!br._parseNAMESPACE({payload:{NAMESPACE:[]}}));
    });

    test("Single personal namespace", function(err){
        var br = browserbox();
        deepEqual(

            {
                personal: [{prefix: "INBOX.", delimiter: "."}],
                users: null,
                shared: null
            },

            br._parseNAMESPACE({payload:{
                NAMESPACE:[{attributes: [[[{type: "STRING", value: "INBOX."}, {type: "STRING", value: "."}]], null, null]}]
            }}));
    });

    test("Single personal, single users, multiple shared", function(err){
        var br = browserbox();
        deepEqual(

            {
                personal: [{prefix: "", delimiter: "/"}],
                users: [{prefix: "~", delimiter: "/"}],
                shared: [{prefix: "#shared/", delimiter: "/"},{prefix: "#public/", delimiter: "/"}]
            },

            br._parseNAMESPACE({payload:{
                NAMESPACE:[
                    {
                        attributes: [
                            // personal
                            [[{type: "STRING", value: ""}, {type: "STRING", value: "/"}]],
                            // users
                            [[{type: "STRING", value: "~"}, {type: "STRING", value: "/"}]],
                            // shared
                            [
                                [{type: "STRING", value: "#shared/"}, {type: "STRING", value: "/"}],
                                [{type: "STRING", value: "#public/"}, {type: "STRING", value: "/"}]
                            ]
                        ]
                    }
                ]
            }}));
    });

});
