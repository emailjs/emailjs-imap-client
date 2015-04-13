# browserbox

IMAP client for browsers

[![Build Status](https://travis-ci.org/whiteout-io/browserbox.png?branch=master)](https://travis-ci.org/whiteout-io/browserbox)

## StringEncoding API

This module requires `TextEncoder` and `TextDecoder` to exist as part of the StringEncoding API (see: [MDN](https://developer.mozilla.org/en-US/docs/WebAPI/Encoding_API) [whatwg.org](http://encoding.spec.whatwg.org/#api)). Firefox 19+ is basically the only browser that supports this at the time of writing, while [Chromium in canary, not stable](https://code.google.com/p/chromium/issues/detail?id=243354). Luckily, [there is a polyfill](https://github.com/whiteout-io/stringencoding)!

## TCPSocket API

There is a [shim](https://github.com/whiteout-io/tcp-socket) that brings [Mozilla-flavored](https://developer.mozilla.org/en-US/docs/WebAPI/TCP_Socket) version of the [Raw Socket API](http://www.w3.org/TR/raw-sockets/) to other platforms.

If you are on a platform that uses forge instead of a native TLS implementation (e.g. chrome.socket), you have to set the .oncert(pemEncodedCertificate) handler that passes the TLS certificate that the server presents. It can be used on a trust-on-first-use basis for subsequent connection.

If forge is used to handle TLS traffic, you may choose to handle the TLS-related load in a Web Worker. Please use tlsWorkerPath to point to `tcp-socket-tls-worker.js`!

Please take a look at the [tcp-socket documentation](https://github.com/whiteout-io/tcp-socket) for more information!

## Promises

This module uses the Promises API, so make sure your platform either supports `Promise` constructor natively, or use the [es6-promise](https://www.npmjs.com/package/es6-promise) polyfill.

    var ES6Promise = require('es6-promises');
    ES6Promise.polyfill();

## Installation

### [npm](https://www.npmjs.org/):

    npm install browserbox

## Usage

### AMD

Require [browserbox.js](src/browserbox.js) as `browserbox`

### Global context

Include following files on the page.

```html
<script src="browserbox.js"></script>
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
    * **id** (optional) is the identification object for [RFC2971](http://tools.ietf.org/html/rfc2971#section-3.3) (ex. `{name: 'myclient', version: '1'}`)
    * **useSecureTransport** (optional) enables TLS
    * **ca** (optional) (only in conjunction with the [TCPSocket shim](https://github.com/whiteout-io/tcp-socket)) if you use TLS with forge, pin a PEM-encoded certificate as a string. Please refer to the [tcp-socket documentation](https://github.com/whiteout-io/tcp-socket) for more information!
    * **tlsWorkerPath** (optional) (only in conjunction with the [TCPSocket shim](https://github.com/whiteout-io/tcp-socket)) if you use TLS with forge, this path indicates where the file for the TLS Web Worker is located. Please refer to the [tcp-socket documentation](https://github.com/whiteout-io/tcp-socket) for more information!
    * **ignoreTLS** – if set to true, do not call STARTTLS before authentication even if the host advertises support for it
    * **requireTLS** – if set to true, always use STARTTLS before authentication even if the host does not advertise it. If STARTTLS fails, do not try to authenticate the user
    * **enableCompression** - if set to true then use IMAP COMPRESS extension (rfc4978) if the server supports it (Gmail does). All data sent and received in this case is compressed with *deflate*
    * **compressionWorkerPath** (optional) offloads de-/compression computation to a web worker, this is the path to the browserified browserbox-compressor-worker.js

Default STARTTLS support is opportunistic – if the server advertises STARTTLS capability, the client tries to use it. If STARTTLS is not advertised, the clients sends passwords in the plain. You can use `ignoreTLS` and `requireTLS` to change this behavior by explicitly enabling or disabling STARTTLS usage.

Example

```javascript
var client = new BrowserBox('localhost', 143, {
    auth: {
        user: 'testuser',
        pass: 'testpass'
    },
    id: {
        name: 'My Client',
        version: '0.1'
    }
});
```

**Use of web workers with compression**: If you use compression, we can spin up a Web Worker to handle the TLS-related computation off the main thread. To do this, you need to **browserify** `browserbox-compressor-worker.js`, specify the path via `options.compressionWorkerPath`

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
client.onclose = function(){}
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

If callback is not specified, the method returns a Promise.

Mailbox object is with the following structure

  * **root** (boolean) `true` if the node is root
  * **name** (string) unicode decoded name of the mailbox
  * **path** (string) full path to the mailbox
  * **delimiter** (string) path delimiting symbol.  In the event the server returns NIL for this (some servers do this for the INBOX), it will be coerced to a '/' at this time, but the behavior may be changed in the future depending on how the folder creation API is implemented.
  * **listed** (boolean) mailbox was found in the LIST response
  * **subscribed** (boolean) mailbox was found in the LSUB response
  * **specialUse** (string) mailbox was identified as a special use mailbox ('\Trash', '\Sent', '\Junk' etc. see [RFC6154](http://tools.ietf.org/html/rfc6154#section-2))
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

### Notes

Root level `INBOX` is case insensitive, so all subfolders of INBOX, Inbox etc. are mapped together. The first occurence of `INBOX` defines the `name` property for the parent element. `path` values remain as listed.

For example the following IMAP response lists different INBOX names:

```
    * LIST () "INBOX"
    * LIST () "Inbox/test"
```

These different INBOX names are mapped to the following object:

```json
{
  "root": true,
  "children": [
    {
      "name": "INBOX",
      "delimiter": "/",
      "path": "INBOX",
      "children": [
        {
          "name": "test",
          "delimiter": "/",
          "path": "Inbox/test",
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

If callback is not specified, the method returns a Promise.

Namespace object is with the following structure

  * **personal** is an array of namespace elements or `false` for Personal Namespace
  * **users** is an array of namespace elements or `false` for Other Users' Namespace
  * **shared** is an array of namespace elements or `false` for Shared Namespace

Namespace element object has the following structure

  * **prefix** is the prefix string
  * **delimiter** is the hierarchy delimiter.  This can be null for some servers but will usually be a string.

**NB!** Namespace_Response_Extensions are not supported (extension data is silently skipped)

Namespaces should be checked before attempting to create new mailboxes - most probably creating mailboxes outside personal namespace fails. For example when the personal namespace is prefixed with 'INBOX.' you can create 'INBOX.Sent Mail' but you can't create 'Sent Mail'.

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

## Create mailbox

Create a folder with the given path, automatically handling utf-7 encoding.  You
currently need to manually build the path string yourself.  (There is potential
for future enhancement to provide assistance.)

If the server indicates a failure but that the folder already exists with the
ALREADYEXISTS response code, the request will be treated as a success.

Example

```javascript
// On a server with a personal namesapce of INBOX and a delimiter of '/',
// create folder Foo.  Note that folders using a non-empty personal namespace
// may automatically assume the personal namespace.
client.createMailbox('INBOX/Foo', function callback(err, alreadyExists) {});
// Do the same on a server where the personal namespace is ''
client.createMailbox('Foo', function callback(err, alreadyExists) {});
```

If callback is not specified, the method returns a Promise.

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
      * **highestModseq** (string) (with CONDSTORE only) highest modseq value (javascript can't handle 64bit uints so this is a string)

If callback is not specified, the method returns a Promise.

Example

```javascript
client.selectMailbox('INBOX', function(err, mailbox){
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
    "highestModseq": "3682918"
}
```

You can check the currently selected mailbox path from `client.selectedMailbox`.
If no mailbox is currently selected, the value is `false`.

```
console.log('Current mailbox: %s', client.selectedMailbox);
```

## List messages

List messages with `listMessages()`

```javascript
client.listMessages(sequence, query[, options], callback)
```

Where

  * **sequence** defines the range of sequence numbers or UID values (if `byUid` option is set to true). Example: '1', '1:*', '1,2:3,4' etc.
  * **query** is an array of keys that need to be fetched. Example: ['uid', 'flags', 'body.peek[headers (date)]']
  * **options** is an optional options object
    * **byUid** if `true` executes `UID FETCH` instead of `FETCH`
    * **changedSince** is the modseq filter. Only messages with higher modseq value will be returned
  * **callback** is the callback function to run once all me messages are processed with the following arguments
    * **err** is an error object, only set if the request failed
    * **messages** is an array of messages from the provided sequence range

If callback is not specified, the method returns a Promise.

> **A note about sequence ranges** – using `*` as a range selector might be a really bad idea. If the mailbox contains thousands of messages and you are running a `1:*` query, it might choke your application. Additionally, remember that `*` stands for the sequence number of _the last message_ in the mailbox. This means that if you have 10 messages in a mailbox and you run a query for a range of `5000:*` you still get a match as the query is treated as `10:5000` by the server

Example

```javascript
client.listMessages('1:10', ['uid', 'flags', 'body[]'], function(err, messages){
    messages.forEach(function(message){
        console.log('Flags for ' + message.uid + ': ' + message.flags.join(', '));
    });
});
```

**NB!** this method does not stream the values, you need to handle this by yourself by using reasonable sized sequence ranges

### Message item

A listed message item includes (but is not limited to), the selected fields from the `query` argument (all keys are lowercase). Additionally the argument order and even argument names might not match. For example, when requesting for `body.peek` you get `body` back instead. Additionally the message includes a special key `#` which stands for the sequence number of the message.

Most arguments return strings (eg. `body[]`) and numbers (eg. `uid`) while `flags` return an array, `envelope` and `bodystructure` return a processed object.

```json
{
    "#": 123,
    "uid": 456,
    "flags": ["\\Seen", "$MyFlag"],
    "envelope": {
        "date": "Fri, 13 Sep 2013 15:01:00 +0300",
        "subject": "hello 4",
        "from": [{"name": "sender name", "address": "sender@example.com"}],
        "to": [{"name": "Receiver name", "address": "receiver@example.com"}],
        "message-id": "<abcde>"
    }
}
```

> **Special keys** - if a special key is used, eg. `BODY.PEEK[HEADER (Date Subject)]`, the response key is lowercase and in the form how the server responded it, eg. `body[header (date subject)]`

### Envelope object

An envelope includes the following fields (a value is only included in the response if it is set).

  * **date** is a date (string) of the message
  * **subject** is the subject of the message
  * **from** is an array of addresses from the `from` header
  * **sender** is an array of addresses from the `sender` header
  * **reply-to** is an array of addresses from the `reply-to` header
  * **to** is an array of addresses from the `to` header
  * **cc** is an array of addresses from the `cc` header
  * **bcc** is an array of addresses from the `bcc` header
  * **in-reply-to** is the message-id of the message is message is replying to
  * **message-id** is the message-id of the message

All address fields are in the following format:

```json
[
    {
        "name": "MIME decoded name",
        "address": "email@address"
    }
]
```

### Bodystructure object

A bodystructure object includes the following fields (all values are lowercase, unless the value might be case sensitive, eg. Content-Id value):

  * **part** is the sub-part selector for `BODY[x.x.x]`, eg. '4.1.1' (this value is not set for the root object)
  * **type** is the Content-Type of the body part
  * **parameters** is an object defining extra arguments for Content-Type, example: `{border: 'abc'}`
  * **disposition** is the Content-Disposition value (without arguments)
  * **dispositionParameters** is an object defining extra arguments for Content-Disposition, example: `{filename: 'foo.gif'}`
  * **language** is an array of language codes (hardly ever used)
  * **location** is a string for body content URI (hardly ever used)
  * **id** is the Content-Id value
  * **description** is the Content-Description value
  * **encoding** is the Content-Transfer-Encoding value
  * **size** is the body size in octets
  * **lineCount** (applies to `text/*` and `message/rfc822`) is the count of lines in the body
  * **envelope** (applies to `message/rfc822`) is the envelope object of the sub-part
  * **md5** is the MD5 hash of the message (hardly ever used)
  * **childNodes** (applies to `multipart/*` and `message/rfc822`) is an array of embedded bodystructure objects

**Example**

Bodystructure for the following sample message structure:

```
multipart/mixed
    text/plain
    multipart/alternative
        text/plain
```

```json
{
    "type": "multipart/mixed",
    "childNodes": [
        {
            "part": "1",
            "type": "text/plain",
            "encoding": "7bit",
            "size": 8,
            "lineCount": 1
        },
        {
            "part": "2",
            "type": "multipart/alternative",
            "childNodes": [
                {
                    "part": "2.1",
                    "type": "text/plain",
                    "encoding": "7bit",
                    "size": 8,
                    "lineCount": 1
                }
            ]
        }
    ]
}
```

## Searching

Search for messages with `search()`

```javascript
client.search(query[, options], callback)
```

Where

  * **query** defines the search terms, see below
  * **options** is an optional options object
    * **byUid** if `true` executes `UID SEARCH` instead of `SEARCH`
  * **callback** is the callback function to run once all me messages are processed with the following arguments
    * **err** is an error object, only set if the request failed
    * **results** is an array of sorted and unique message sequence numbers or UID numbers that match the specified search query

If callback is not specified, the method returns a Promise.

Queries are composed as objects where keys are search terms and values are term arguments.
Only strings, numbers and Date values are used as arguments.
If the value is an array, the members of it are processed separately (use this for terms that require multiple params).
If the value is a Date, it is converted to the form of '1-Jan-1970'.
Subqueries (OR, NOT) are made up of objects.

Examples:

```javascript
// SEARCH UNSEEN
query = {unseen: true}
// SEARCH KEYWORD 'flagname'
query = {keyword: 'flagname'}
// SEARCH HEADER 'subject' 'hello world'
query = {header: ['subject', 'hello world']};
// SEARCH UNSEEN HEADER 'subject' 'hello world'
query = {unseen: true, header: ['subject', 'hello world']};
// SEARCH OR UNSEEN SEEN
query = {or: {unseen: true, seen: true}};
// SEARCH UNSEEN NOT SEEN
query = {unseen: true, not: {seen: true}}
```

### Example

```javascript
client.search({unseen: true}, {byUid: true}, function(err, result){
    result.forEach(function(uid){
        console.log('Message ' + uid + ' is unread');
    });
});
```

## Update flags

Update message flags with `setFlags()`

```javascript
client.setFlags(sequence, flags[, options], callback)
```

Where

  * **sequence** defines the range of sequence numbers or UID values (if `byUid` option is set to true). Example: '1', '1:*', '1,2:3,4' etc.
  * **flags** is an object defining flag updates, see below for details
  * **options** is an optional options object
    * **byUid** if `true` executes `UID SEARCH` instead of `SEARCH`
    * **silent** if `true` does not return anything. Useful when updating large range of messages at once (`'1:*'`)
  * **callback** is the callback function to run once all me messages are processed with the following arguments
    * **err** is an error object, only set if the request failed
    * **messages** is an array of messages from the provided sequence range (or empty when `silent:true` option is set). Includes `flags` property and `uid` if `byUid:true` option was used.

If callback is not specified, the method returns a Promise.

### Reading flags

You can check the flags for a message or a range of messages with `listMessages` - use `['flags']` as the query object.

### Flag update object

  * `{ set: arrFlags }` for setting flags
  * `{ add: arrFlags }` for adding new flags
  * `{ remove: arrFlags }` for removing specified flags

Where `arrFlags` is an array containing flag strings, ie. `['\\Seen', '$MyFlag']`

### Example

```javascript
client.setFlags('1', {add: ['\\Seen']}, function(err, result){
    console.log('New flags for message: ' + result[0].flags.join(', '));
});
```

## Delete messages

Delete messages with `deleteMessages()`

```javascript
client.deleteMessages(sequence[, options], callback)
```

Where

  * **sequence** defines the range of sequence numbers or UID values (if `byUid` option is set to true). Example: '1', '1:*', '1,2:3,4' etc.
  * **options** is an optional options object
    * **byUid** if `true` uses UID values instead of sequence numbers to define the range
  * **callback** is the callback function to run once all me messages are processed with the following arguments
    * **err** is an error object, only set if the request failed

If callback is not specified, the method returns a Promise.

If possible (`byUid:true` is set and UIDPLUS extension is supported by the server) uses `UID EXPUNGE`
otherwise falls back to EXPUNGE to delete the messages – which means that this method might be
destructive. If `EXPUNGE` is used, then any messages with `\Deleted` flag set are deleted even if these
messages are not included in the specified sequence range.

### Example

```javascript
client.deleteMessages('1:5', function(err){
    if(err){
        console.log('Command failed');
    }else{
        console.log('Messages were deleted');
    }
});
```

## Copy messages

Copy messages with `copyMessages()`

```javascript
client.copyMessages(sequence, destination[, options], callback)
```

Where

  * **sequence** defines the range of sequence numbers or UID values (if `byUid` option is set to true). Example: '1', '1:*', '1,2:3,4' etc.
  * **destination** is the destination folder path. Example: '[Gmail]/Trash'
  * **options** is an optional options object
    * **byUid** if `true` uses UID values instead of sequence numbers to define the range
  * **callback** is the callback function to run once all me messages are processed with the following arguments
    * **err** is an error object, only set if the request failed
    * **message** nothing useful, just the response text from the server

If callback is not specified, the method returns a Promise.

### Example

```javascript
client.copyMessages('1:5', '[Gmail]/Trash', function(err){
    console.log('Messages were copied to [Gmail]/Trash');
});
```

## Move messages

Move messages with `moveMessages()`

```javascript
client.moveMessages(sequence, destination[, options], callback)
```

Where

  * **sequence** defines the range of sequence numbers or UID values (if `byUid` option is set to true). Example: '1', '1:*', '1,2:3,4' etc.
  * **destination** is the destination folder path. Example: '[Gmail]/Trash'
  * **options** is an optional options object
    * **byUid** if `true` uses UID values instead of sequence numbers to define the range
  * **callback** is the callback function to run once all me messages are processed with the following arguments
    * **err** is an error object, only set if the request failed

If callback is not specified, the method returns a Promise.

If possible (MOVE extension is supported by the server) uses `MOVE` or `UID MOVE`
otherwise falls back to COPY + EXPUNGE.

The returned list of sequence numbers might not match with the sequence numbers provided to the method.

### Example

```javascript
client.moveMessages('1:5', '[Gmail]/Trash', function(err){
    if(err){
        console.log('Command failed');
    }else{
        console.log('Messages were moved to [Gmail]/Trash');
    }
});
```

## Update notifications

Message updates can be listened for by setting the `onupdate` handler. First argument for the callback defines the update type, and the second one is the new value.

**Example**

```javascript
client.onupdate = function(type, value){
    if (type == 'exists') {
        console.log(value + ' messages exists in selected mailbox');
    }
}
```

Possible types:

  * **exists** is emitted on untagged `EXISTS` response, `value` is the argument number used
  * **expunge** is emitted on untagged `EXPUNGE` response, `value` is the sequence number of the deleted message
  * **fetch** is emitted on flag change. `value` includes the parsed message object (probably includes only the sequence number `#` and `flags` array)

## Mailbox change notifications

Listening mailbox select notification is done by setting the `onselectmailbox` and `onclosemailbox` handlers.

For `onselectmailbox` handler the first argument is the path of the selected mailbox and the second argument
is the mailbox information object (see [selectMailbox](#select-mailbox)).

For `onclosemailbox` handler the argument is the path of the selected mailbox.

**Example**

```javascript
client.onselectmailbox = function(path, mailbox){
    console.log('Opened %s with %s messages', path, mailbox.exists);
}

client.onclosemailbox = function(path){
    console.log('Closed %s', path);
}
```

## Close connection

You can close the connection with `close()`. This method doesn't actually terminate the connection, it sends LOGOUT command to the server.

```javascript
client.close();
```

Once the connection is actually closed `onclose` event is fired.

## State-dependend calls

Calls to Browserbox are queued in FIFO order until they are ready for execution. This may be problematic for calls that depend on a selected mailbox, e.g. `#search` or `#setFlags`. These call can be issued with a `precheck` callback that is invoked **before** the IMAP command is sent to the server.

Example:

```javascript
// search depends on a selected mailbox, e.g. inbox
imap.search({
    header: ['subject', 'hello 3']
}, {
    // add precheck(ctx, next) to the query options
    precheck: function(ctx, next) {
        // make sure inbox is selected before the search command is run
        imap.selectMailbox('inbox', {
            ctx: ctx // pass the context parameter received in the precheck callback as a query option to bypass the command queue
        }, next); // next should invoked when you're done
    },
    byUid: true
}, function(error, result) {
    ...
});

```

A `precheck` callback receives two arguments:
* **ctx** is a context parameter, i.e. a pointer to the current position in the command queue
* **next** callback to be invoked when the precheck is done

Calls issued in a `precheck` callback will be executed *before* the parent call, if you pass the `ctx` parameter received as a argument of the `precheck` callback to the query options. This bypasses the internal FIFO queue and executes the call on the spot! *If the context parameter is left blank, the calls will be queued as usual*.

Invoke `next` once you're done with the `precheck` callback to resume normal operation.

If you want to *remove* a call from the FIFO queue, e.g. because a message is no longer available in a mailbox, pass in an error to the `next` callback. The parent call will not be executed and you will receive the error passed to next in the callback of the parent call.

Example:

```javascript
imap.setFlags('1', ['\\Seen', '$MyFlag'], {
    precheck: function(ctx, next) {
        next(new Error('Foo')); // this removes the setFlags query from the queue
    }
}, function(err, result) {
    // err.message -> 'Foo'
    ...
});
```

**NB!** `precheck` callbacks can be also nested! For details, have a look at the integration test that covers this portion of the code.

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
