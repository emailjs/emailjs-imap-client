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
                users: false,
                shared: false
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

    module("select response");

    test("Complete response", function(err){
        var br = browserbox();
        deepEqual(

            {
                exists: 123,
                flags: ["\\Answered", "\\Flagged"],
                highestModseq: 3682918,
                permanentFlags: ["\\Answered", "\\Flagged"],
                readOnly: false,
                uidNext: 38361,
                uidValidity: 2
            },

            br._parseSELECT({
                code: "READ-WRITE",
                payload: {
                    EXISTS: [{nr: 123}],
                    FLAGS: [{attributes: [[{type: "ATOM", value: "\\Answered"}, {type: "ATOM", value: "\\Flagged"}]]}],
                    OK: [
                        {code: "PERMANENTFLAGS", permanentflags: ["\\Answered", "\\Flagged"]},
                        {code: "UIDVALIDITY", uidvalidity: "2"},
                        {code: "UIDNEXT", uidnext: "38361"},
                        {code: "HIGHESTMODSEQ", highestmodseq: "3682918"}
                    ]
                }
            }));
    });

    test("No modseq", function(err){
        var br = browserbox();
        deepEqual(

            {
                exists: 123,
                flags: ["\\Answered", "\\Flagged"],
                permanentFlags: ["\\Answered", "\\Flagged"],
                readOnly: false,
                uidNext: 38361,
                uidValidity: 2
            },

            br._parseSELECT({
                code: "READ-WRITE",
                payload: {
                    EXISTS: [{nr: 123}],
                    FLAGS: [{attributes: [[{type: "ATOM", value: "\\Answered"}, {type: "ATOM", value: "\\Flagged"}]]}],
                    OK: [
                        {code: "PERMANENTFLAGS", permanentflags: ["\\Answered", "\\Flagged"]},
                        {code: "UIDVALIDITY", uidvalidity: "2"},
                        {code: "UIDNEXT", uidnext: "38361"}
                    ]
                }
            }));
    });

    test("Read only", function(err){
        var br = browserbox();
        deepEqual(

            {
                exists: 123,
                flags: ["\\Answered", "\\Flagged"],
                permanentFlags: ["\\Answered", "\\Flagged"],
                readOnly: true,
                uidNext: 38361,
                uidValidity: 2
            },

            br._parseSELECT({
                code: "READ-ONLY",
                payload: {
                    EXISTS: [{nr: 123}],
                    FLAGS: [{attributes: [[{type: "ATOM", value: "\\Answered"}, {type: "ATOM", value: "\\Flagged"}]]}],
                    OK: [
                        {code: "PERMANENTFLAGS", permanentflags: ["\\Answered", "\\Flagged"]},
                        {code: "UIDVALIDITY", uidvalidity: "2"},
                        {code: "UIDNEXT", uidnext: "38361"}
                    ]
                }
            }));
    });

});
