# browserbox

IMAP client for browsers

[![Build Status](https://travis-ci.org/whiteout-io/browserbox.png?branch=master)](https://travis-ci.org/whiteout-io/browserbox)

## StringEncoding API

This module requires `TextEncoder` and `TextDecoder` to exist as part of the StringEncoding API (see: [MDN](https://developer.mozilla.org/en-US/docs/WebAPI/Encoding_API) [whatwg.org](http://encoding.spec.whatwg.org/#api)). Firefox 19+ is basically the only browser that supports this at the time of writing, while [Chromium in canary, not stable](https://code.google.com/p/chromium/issues/detail?id=243354). Luckily, [there is a polyfill](https://github.com/whiteout-io/stringencoding)!

Depending on your browser, you might need [this polyfill for ArrayBuffer #slice](https://github.com/ttaubert/node-arraybuffer-slice), e.g. phantomjs.

## TCPSocket API

There is a [shim](https://github.com/whiteout-io/tcp-socket) that brings [Mozilla-flavored](https://developer.mozilla.org/en-US/docs/WebAPI/TCP_Socket) version of the [Raw Socket API](http://www.w3.org/TR/raw-sockets/) to Chromium.

## Installation

### [Bower](http://bower.io/):

    bower install git@github.com:whiteout-io/browserbox.git#0.1.0

### [npm](https://www.npmjs.org/):

    npm install https://github.com/whiteout-io/browserbox/tarball/0.1.0

## Usage

### AMD

Require [browserbox.js](src/browserbox.js) as `browserbox`

### Global context

Include following fileson the page.

```html
<script src="browserbox.js"></script>
<script src="browserbox-special-use.js"></script>
<script src="browserbox-imap.js"></script>
```

This exposes the constructor `BrowserBox` as a global variable

## API

    var BrowserBox = require('browserbox')

## Create connection to an IMAP server

```
new BrowserBox(host[, port][, options]) → IMAP client object
```

Where

  * **host** is to hostname to connect to
  * **port** (optional) is the port to connect to (defaults to 143)
  * **options** (optional) is the options object
    * **auth** is the authentication information object
      * **user** is the username of the user (also applies to Oauth2)
      * **pass** is the password of the user
      * **xoauth2** is the OAuth2 access token to be used instead of password
    * **id** (optional) is the identification object for [RFC2971](http://tools.ietf.org/html/rfc2971#section-3.3) (ex. `{name: "myclient", version: "1"}`)
    * **useSSL** (optional) enables TLS
    * **ca** (optional) (only in conjunction with this [TCPSocket shim](https://github.com/whiteout-io/tcp-socket)) if you use TLS, pin a PEM-encoded certificate as a string

Example

```javascript
var client = browserbox("localhost", 143, {
    auth: {
        user: "testuser",
        pass: "testpass"
    },
    id: {
        name: "My Client",
        version: "0.1"
    }
});
```

## Initiate connection

BrowserBox object by default does not initiate the connection, you need to call `client.connect()` to establish it

    client.connect();

This function does not take any arguments and does not return anything. See the events section to handle connection issues.

## Events

The IMAP client has several events you can attach to by setting a listener

### onerror

Is fired when something unexpected happened.

```
client.onerror = function(err){}
```

Where

  * **err** is an error object

### onclose

Is fired when the connection to the IMAP server is closed.

```
client.onerror = function(err){}
```

### onauth

Is fired when the user is successfully authenticated

## List mailboxes

List all mailboxes with `listMailboxes()` method

```
client.listMailboxes(callback)
```

Where

  * **callback** is the callback function with the following arguments
    * **err** is an error object, only set if the request failed
    * **mailboxes** is an object with the mailbox structure

Mailbox object is with the following structure

  * **root** (boolean) `true` if the node is root
  * **name** (string) unicode decoded name of the mailbox
  * **path** (string) full path to the mailbox
  * **delimiter** (string) path delimiting symbol
  * **listed** (boolean) mailbox was found in the LIST response
  * **subscribed** (boolean) mailbox was found in the LSUB response
  * **specialUse** (string) mailbox was identified as a special use mailbox ("\Trash", "\Sent", "\Junk" etc. see [RFC6154](http://tools.ietf.org/html/rfc6154#section-2))
  * **flags** (array) a list of flags
  * **children** (array) a list of child mailboxes

Example

```javascript
client.listMailboxes(function(err, mailboxes){
    console.log(err || mailboxes);
});
```

```json
{
  "root": true,
  "children": [
    {
      "name": "INBOX",
      "delimiter": "/",
      "path": "INBOX",
      "children": [],
      "flags": ["\\HasNoChildren"],
      "listed": true,
      "subscribed": true
    },
    {
      "name": "[Gmail]",
      "delimiter": "/",
      "path": "[Gmail]",
      "flags": ["\\Noselect","\\HasChildren"],
      "listed": true,
      "subscribed": true,
      "children": [
        {
          "name": "All Mail",
          "delimiter": "/",
          "path": "[Gmail]/All Mail",
          "children": [],
          "flags": ["\\HasNoChildren","\\All"],
          "listed": true,
          "specialUse": "\\All",
          "subscribed": true
        }
      ]
    }
  ]
}
```

## List namespaces

List available namespaces with `listNamespaces()`. If [NAMESPACE](https://tools.ietf.org/html/rfc2342) extension is not supported, the method returns `false`.

```javascript
client.listNamespaces(callback)
```

Where

  * **callback** is the callback function with the following arguments
    * **err** is an error object, only set if the request failed
    * **namespaces** is an object with the namespace values or `false` if NAMESPACE is not supported

Namespace object is with the following structure

  * **personal** is an array of namespace elements or `false` for Personal Namespace
  * **users** is an array of namespace elements or `false` for Other Users' Namespace
  * **shared** is an array of namespace elements or `false` for Shared Namespace

Namespace element object has the following structure

  * **prefix** is the prefix string
  * **delimiter** is the hierarchy delimiter

**NB!** Namespace_Response_Extensions are not supported (extension data is silently skipped)

Namespaces should be checked before attempting to create new mailboxes - most probably creating mailboxes outside personal namespace fails. For example when the personal namespace is prefixed with "INBOX." you can create "INBOX.Sent Mail" but you can't create "Sent Mail".

Example

```javascript
client.listNamespaces(function(err, namespaces){
    console.log(err || namespaces);
});
```

```json
{
    "personal": [
        {
            "prefix": "",
            "delimiter": "/"
        }
    ],
    "users": false,
    "shared": false
}
```

## Select mailbox

Select specific mailbox by path with `selectMailbox()`

```javascript
client.selectMailbox(path[, options], callback)
```

Where

  * **path** is the full path to the mailbox (see *path* property with `listMailboxes`)
  * **options** *optional* options object with the following properties
    * **condstore** if set to `true` adds (CONDSTORE) option when selecting
    * **readOnly** if set to `true` uses `EXAMINE` instead of `SELECT`
  * **callback** is the callback function with the following arguments
    * **err** is an error object, only set if the request failed
    * **mailboxInfo** is an object with mailbox properties
      * **exists** (number) the count of messages in the selected mailbox
      * **flags** (array) an array of flags used in the selected mailbox
      * **permanentFlags** (array) an array of permanent flags available to use in the selected mailbox
      * **readOnly** (boolean) `true` if the mailbox is in read only mode
      * **uidValidity** (number) UIDValidity value
      * **uidNext** (number) predicted next UID value
      * **highestModseq** (number) (with CONDSTORE only) highest modseq value

Example

```javascript
client.selectMailbox("INBOX", function(err, mailbox){
    console.log(err || mailbox);
});
```

```json
{
    "readOnly": false,
    "exists": 6596,
    "flags": [
        "\\Answered",
        "\\Flagged"
    ],
    "permanentFlags": [
        "\\Answered",
        "\\Flagged"
    ],
    "uidValidity": 2,
    "uidNext": 38361,
    "highestModseq": 3682918
}
```

## List messages

List messages with `listMessages()`

```javascript
client.listMessages(sequence, query[, options], callback)
```

Where

  * **sequence** defines the range of sequence numbers or UID values (if `byUid` option is set to true). Example: "1", "1:*", "1,2:3,4" etc.
  * **query** is an array of keys that need to be fetched. Example: ["uid", "flags", "body.peek[headers (date)]"]
  * **options** is an optional options object
    * **byUid** if `true` executes `UID FETCH` instead of `FETCH`
    * **changedSince** is the modseq filter. Only messages with higher modseq value will be returned
  * **callback** is the callback function to run once all me messages are processed with the following arguments
    * **err** is an error object, only set if the request failed
    * .... not implemented

Example

```javascript
client.listMessages("1:10", ["uid", "flags", "body[]"], function(err, ...){
   ... not entirely implemented
});
```

**NB!** this method does not stream the values, you need to handle this by yourself (do not use full "1:*" ranges on mailboxes with unknown size or this might chrash your application).

## Close connection

You can close the connection with `close()`. This method doesn't actually terminate the connection, it sends LOGOUT command to the server.

```javascript
clisne.close();
```

Once the connection is actually closed `onclose` event is fired.

## Get your hands dirty

    git clone git@github.com:whiteout-io/browserbox.git
    cd browserbox
    npm install && npm test

To run the integration tests against a local smtp server

    grunt imap
    add the test folder as a chrome app (chrome settings -> extensions -> check 'developer mode' -> load unpacked extension)

## License

    Copyright (c) 2014 Andris Reinman

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.