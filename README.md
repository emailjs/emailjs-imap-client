# emailjs-imap-client

## HELP WANTED

Felix is not actively maintaining this library anymore. But this is the only IMAP client for JS that I am aware of, so I feel this library still has its value. Please let me know if you're interested in helping out, either via email or open an issue about that.

The work that's on the horizon is:

* Removing the [tcp-socket shim](https://github.com/emailjs/emailjs-tcp-socket) and use node's `net` and `tls` directly
* Adding features as per requests
* Refactor to allow streaming and cut down memory consumption
* Stay up to date with developments in the IMAP protocol
* Maintenance of the other related emailjs libraries
* Maintenance and update of [emailjs.org](https://emailjs.org)

[![npm](https://img.shields.io/npm/v/emailjs-tcp-socket.svg)](https://github.com/emailjs/emailjs-imap-client) [![Greenkeeper badge](https://badges.greenkeeper.io/emailjs/emailjs-imap-client.svg)](https://greenkeeper.io/) [![Build Status](https://travis-ci.org/emailjs/emailjs-imap-client.png?branch=master)](https://travis-ci.org/emailjs/emailjs-imap-client) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)  [![ES6+](https://camo.githubusercontent.com/567e52200713e0f0c05a5238d91e1d096292b338/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f65732d362b2d627269676874677265656e2e737667)](https://kangax.github.io/compat-table/es6/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Low-level IMAP client for all your IMAP needs.

## Usage

```bash
npm install --save emailjs-imap-client
```
```javascript
import ImapClient from 'emailjs-imap-client'

// Use this instead for CommonJS modules (Node.js)
var ImapClient = require('emailjs-imap-client').default
```

## API

```javascript
var client = new ImapClient(host[, port][, options])
```

Please note that **instances cannot be reused**! After terminating a connection or encountering an error, please create a new ImapClient instance!

Where

  * **host** is the hostname to connect to
  * **port** (optional) is the port to connect to (defaults to 143)
  * **options** (optional) is the options object
    * **logLevel** is the verbosity, can be set to error, warn, info, debug. See `src/common.js`
    * **auth** is the authentication information object
      * **user** is the username of the user (also applies to Oauth2)
      * **pass** is the password of the user
      * **xoauth2** is the OAuth2 access token to be used instead of password
    * **id** (optional) is the identification object for [RFC2971](http://tools.ietf.org/html/rfc2971#section-3.3) (ex. `{name: 'myclient', version: '1'}`)
    * **useSecureTransport** (optional) enables TLS
    * **ignoreTLS** – if set to true, *never uses STARTTLS before authentication* even if the host advertises support for it
    * **requireTLS** – if set to true, *always uses STARTTLS before authentication* even if the host does not advertise it. If STARTTLS fails, do not try to authenticate the user
    * **enableCompression** - if set to true then use IMAP COMPRESS extension (rfc4978) if the server supports it (Gmail does). All data sent and received in this case is compressed with *deflate*

Default STARTTLS support is opportunistic – if the server advertises STARTTLS capability, the client tries to use it. If STARTTLS is not advertised, the clients sends passwords in the plain. You can use `ignoreTLS` and `requireTLS` to change this behavior by explicitly enabling or disabling STARTTLS usage.

Example

```javascript
var client = new ImapClient('localhost', 143, {
    auth: {
        user: 'testuser',
        pass: 'testpass'
    }
});
```

**Use of web workers with compression**: If you use compression, we can spin up a Web Worker to handle the TLS-related computation off the main thread. To do this, you need to **browserify** `emailjs-imap-client-compressor-worker.js`, specify the path via `options.compressionWorkerPath`

```javascript
client.onerror = function(error){}
```
## Get server capability
Call `client.openConnection()` and `client.close()` without authentication to connect to server and get server capability before logging in:

```javascript
var client = new ImapClient('localhost', 143);
client.openConnection().then(capability => {
  client.close()
  /* check capability too see, for example, if server is a gmail server and thereby decide on how to authenticate when connecting */
});
```

## Initiate connection

Call `client.connect()` to establish an IMAP connection:

```javascript
client.connect().then(() => { /* ready to roll */ });
```

## Close connection

There are two ways to close the connection.

The IMAP way is to send the LOGOUT command with `logout()`.

```javascript
client.logout().then(() => { /* connection terminated */ });
```

This method doesn't actually terminate the connection, it sends LOGOUT command to the server, to which the server responds by closing the connection.

**The better way** is to force-close the connection with `close()`. This closes the TCP socket and is independent of the network status.

```javascript
client.close().then(() => { /* connection terminated */ });
```

## List mailboxes

List all mailboxes with `listMailboxes()` method

```javascript
client.listMailboxes().then((mailboxes) => { ... })
```


Mailbox object is with the following structure

  * **root** (boolean) `true` if the node is root
  * **name** (string) unicode decoded name of the mailbox
  * **path** (string) full path to the mailbox
  * **delimiter** (string) path delimiting symbol.  In the event the server returns NIL for this (some servers do this for the INBOX), it will be coerced to a '/' at this time, but the behavior may be changed in the future depending on how the folder creation API is implemented.
  * **listed** (boolean) mailbox was found in the LIST response
  * **subscribed** (boolean) mailbox was found in the LSUB response
  * **specialUse** (string) mailbox was identified as a special use mailbox ('\Trash', '\Sent', '\Junk' etc. see [RFC6154](http://tools.ietf.org/html/rfc6154#section-2))
  * **specialUseFlag** (string) the same as `specialUse` but without using folder name based heuristics
  * **flags** (array) a list of flags
  * **children** (array) a list of child mailboxes

Example `mailboxes` object:

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
          "specialUseFlag": "\\All",
          "subscribed": true
        }
      ]
    }
  ]
}
```

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

List available namespaces with `listNamespaces()`. If [NAMESPACE](https://tools.ietf.org/html/rfc2342) extension is not supported, the method is a no-op.

Namespace object is with the following structure

  * **personal** is an array of namespace elements or `false` for Personal Namespace
  * **users** is an array of namespace elements or `false` for Other Users' Namespace
  * **shared** is an array of namespace elements or `false` for Shared Namespace

Namespace element object has the following structure

  * **prefix** is the prefix string
  * **delimiter** is the hierarchy delimiter.  This can be null for some servers but will usually be a string.

**NB!** Namespace_Response_Extensions are not supported (extension data is silently skipped)

Namespaces should be checked before attempting to create new mailboxes - most probably creating mailboxes outside personal namespace fails. For example when the personal namespace is prefixed with 'INBOX.' you can create 'INBOX.Sent Mail' but you can't create 'Sent Mail'.

Example:

```javascript
client.listNamespaces().then((namespaces) => { ... })
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

Create a folder with the given path with `createMailbox(path)`, automatically handling utf-7 encoding. You currently need to manually build the path string yourself.

If the server indicates a failure that the folder already exists, but responds with the ALREADYEXISTS response code, the request will be treated as a success.

Command: [CREATE](http://tools.ietf.org/html/rfc3501#section-6.3.3)

Example

```javascript
// On a server with a personal namesapce of INBOX and a delimiter of '/',
// create folder Foo.  Note that folders using a non-empty personal namespace
// may automatically assume the personal namespace.
client.createMailbox('INBOX/Foo').then(() => { ... });

// Do the same on a server where the personal namespace is ''
client.createMailbox('Foo').then(() => { ... });
```
## Delete mailbox

Delete a folder with the given path with `deleteMailbox(path)`, automatically handling utf-7 encoding.

Command: [DELETE](http://tools.ietf.org/html/rfc3501#section-6.3.4)

Example

```javascript
client.deleteMailbox('Foo').then(() => { ... });
```

## Select mailbox

Select specific mailbox by path with `selectMailbox(path, options)`

Where

  * **path** is the full path to the mailbox (see *path* property with `listMailboxes`)
  * **options** *optional* options object with the following properties
    * **condstore** if set to `true` adds (CONDSTORE) option when selecting
    * **readOnly** if set to `true` uses `EXAMINE` instead of `SELECT`

Resolves with

  * **mailboxInfo** is an object with mailbox properties
    * **exists** (number) the count of messages in the selected mailbox
    * **flags** (array) an array of flags used in the selected mailbox
    * **permanentFlags** (array) an array of permanent flags available to use in the selected mailbox
    * **readOnly** (boolean) `true` if the mailbox is in read only mode
    * **uidValidity** (number) UIDValidity value
    * **uidNext** (number) predicted next UID value
    * **highestModseq** (string) (with CONDSTORE only) highest modseq value (javascript can't handle 64bit uints so this is a string)


Example

```javascript
client.selectMailbox('INBOX').then((mailbox) => { ... });
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

## List messages

List messages with `listMessages(path, sequence, query[, options])`

Where

  * **path** is the path for the mailbox which should be selected for the command. Selects mailbox prior to executing FETCH if not already selected.
  * **sequence** defines the range of sequence numbers or UID values (if `byUid` option is set to true). Example: '1', '1:*', '1,2:3,4' etc.
  * **query** is an array of keys that need to be fetched. Example: ['uid', 'flags', 'body.peek[headers (date)]']
  * **options** is an optional options object
    * **byUid** if `true` executes `UID FETCH` instead of `FETCH`
    * **changedSince** is the modseq filter. Only messages with higher modseq value will be returned
    * **valueAsString** LITERAL and STRING values are returned as strings rather than Uint8Array objects. Defaults to true.

Resolves with

  * **messages** is an array of messages from the provided sequence range

> **A note about sequence ranges:** This method does not stream the values, so using `*` as a range selector might be a really bad idea. If the mailbox contains thousands of messages and you are running a `1:*` query, it might choke your application. Additionally, remember that `*` stands for the sequence number of _the last message_ in the mailbox. This means that if you have 10 messages in a mailbox and you run a query for a range of `5000:*` you still get a match as the query is treated as `10:5000` by the server


IMAP Commands: [FETCH](http://tools.ietf.org/html/rfc3501#section-6.4.5), [CHANGEDSINCE](https://tools.ietf.org/html/rfc4551#section-3.3)

Example

```javascript
client.listMessages('INBOX', '1:10', ['uid', 'flags', 'body[]']).then((messages) => {
    messages.forEach((message) => console.log('Flags for ' + message.uid + ': ' + message.flags.join(', ')));
});
```

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
[{
    "name": "MIME decoded name",
    "address": "email@address"
}]
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

Search for messages with `search(path, query[, options])`

Where

  * **path** is the path for the mailbox which should be selected for the command. Selects mailbox prior to executing SEARCH if not already selected.
  * **query** defines the search terms, see below
  * **options** is an optional options object
    * **byUid** if `true` executes `UID SEARCH` instead of `SEARCH`

Resolves with

    * **results** is an array of sorted and unique message sequence numbers or UID numbers that match the specified search query

Queries are composed as objects where keys are search terms and values are term arguments.
Only strings, numbers and Date values are used as arguments.
If the value is an array, the members of it are processed separately (use this for terms that require multiple params).
If the value is a Date, it is converted to the form of '1-Jan-1970'.
Subqueries (OR, NOT) are made up of objects.

Command: [SEARCH](http://tools.ietf.org/html/rfc3501#section-6.4.4)

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
// SINCE 2011-11-23
query = {since: new Date(2011, 11, 23, 0, 0, 0)}
```

### Example

```javascript
client.search('INBOX', {unseen: true}, {byUid: true}).then((result) => {
    result.forEach((uid) => console.log('Message ' + uid + ' is unread'));
});
```

## Update flags

Update message flags with `setFlags(path, sequence, flags[, options])`. This is a wrapper around `store()`

Where

  * **path** is the path for the mailbox which should be selected for the command. Selects mailbox prior to executing if not already selected.
  * **sequence** defines the range of sequence numbers or UID values (if `byUid` option is set to true). Example: '1', '1:*', '1,2:3,4' etc.
  * **flags** is an object defining flag updates, see below for details
  * **options** is an optional options object
    * **byUid** if `true` executes `UID SEARCH` instead of `SEARCH`
    * **silent** if `true` does not return anything. Useful when updating large range of messages at once (`'1:*'`)

Resolves with

    * **messages** is an array of messages from the provided sequence range (or empty when `silent:true` option is set). Includes `flags` property and `uid` if `byUid:true` option was used.

### Reading flags

You can check the flags for a message or a range of messages with `listMessages` - use `['flags']` as the query object.

### Flag update object

  * `{ set: arrFlags }` for setting flags
  * `{ add: arrFlags }` for adding new flags
  * `{ remove: arrFlags }` for removing specified flags

Where `arrFlags` is an array containing flag strings, ie. `['\\Seen', '$MyFlag']`

```javascript
client.setFlags('INBOX', '1:10', {set: ['\\Seen']}).then((messages) => { ... })

client.setFlags('INBOX', '1:10', {remove: ['\\Seen']}).then((messages) => { ... })

client.setFlags('INBOX', '1:10', {add: ['\\Seen']}).then((messages) => { ... })
```

### Store Command

The client also allows direct access to the STORE command, but please use `setFlags()` for convenience. Anyway, store flags or labels with `store(path, sequence, action, flags[, options])`.

Where

  * **path** is the path for the mailbox which should be selected for the command. Selects mailbox prior to executing if not already selected.
  * **sequence** defines the range of sequence numbers or UID values (if `byUid` option is set to true). Example: '1', '1:*', '1,2:3,4' etc.
  * **action** is the STORE argument, eg `'FLAGS'` for setting flags
  * **flags** is an array of flags or labels
  * **options** is an optional options object
    * **byUid** if `true` executes `UID SEARCH` instead of `SEARCH`
    * **silent** if `true` does not return anything. Useful when updating large range of messages at once (`'1:*'`)

Resolves with

  * **messages** is an array of messages from the provided sequence range (or empty when `silent:true` option is set). Includes `flags` property and `uid` if `byUid:true` option was used.

Possible actions

 * **FLAGS** - overwrite message flags with provided ones
 * **+FLAGS** - add provided flags to message flags
 * **-FLAGS** - remove provided flags from message flags
 * **X-GM-LABELS** - **GMail-only IMAP extension** to overwrite message labels with provided ones
 * **+X-GM-LABELS** - **GMail-only IMAP extension** to add provided labels to message labels
 * **-X-GM-LABELS** - **GMail-only IMAP extension** to remove provided labels from message labels

Command: [STORE](http://tools.ietf.org/html/rfc3501#section-6.4.6)

```javascript
client.store('INBOX', '1:*', '+X-GM-LABELS', ['\\Sent']).then((messages) => { ... }); // adds GMail `\Sent` label to messages
```

## Delete messages

Delete messages with `deleteMessages(path, sequence[, options])`

Where

  * **path** is the path for the mailbox which should be selected for the command. Selects mailbox prior to executing if not already selected.
  * **sequence** defines the range of sequence numbers or UID values (if `byUid` option is set to true). Example: '1', '1:*', '1,2:3,4' etc.
  * **options** is an optional options object
    * **byUid** if `true` uses UID values instead of sequence numbers to define the range

Resolves when IMAP server completed the command.

If possible (`byUid:true` is set and UIDPLUS extension is supported by the server) uses `UID EXPUNGE`
otherwise falls back to EXPUNGE to delete the messages – which means that this method might be
destructive. If `EXPUNGE` is used, then any messages with `\Deleted` flag set are deleted even if these
messages are not included in the specified sequence range.

Commands: [EXPUNGE](http://tools.ietf.org/html/rfc3501#section-6.4.3), [UID EXPUNGE](https://tools.ietf.org/html/rfc4315#section-2.1)

### Example

```javascript
client.deleteMessages('INBOX', '1:5').then(() => { ... });
```

## Copy messages

Copy messages with `copyMessages(sequence, destination[, options])`

Where

  * **path** is the path for the mailbox which should be selected for the command. Selects mailbox prior to executing if not already selected.
  * **sequence** defines the range of sequence numbers or UID values (if `byUid` option is set to true). Example: '1', '1:*', '1,2:3,4' etc.
  * **destination** is the destination folder path. Example: '[Gmail]/Trash'
  * **options** is an optional options object
    * **byUid** if `true` uses UID values instead of sequence numbers to define the range

Resolves with an object which contains uid sets of source and destination uids if the server supports [UIDPLUS](https://tools.ietf.org/html/rfc4315).

  * **srcSeqSet** is the uid set of the copied messages in the source mailbox
  * **destSeqSet** is the uid set of the copied messages in the destination mailbox

Command: [COPY](http://tools.ietf.org/html/rfc3501#section-6.4.7)

### Example

```javascript
client.copyMessages('INBOX', '1:5', '[Gmail]/Trash').then(({srcSeqSet, destSeqSet}) => { ... });
```

## Upload a message

Upload a message with `upload(destination, message, [, options])`

Where

  * **destination** is the destination folder path. Example: '[Gmail]/Trash'
  * **message** is the message to be uploaded
  * **options** is an optional options object
    * **flags** is an array of flags you want to set on the uploaded message. Defaults to [\Seen]. (optional)

Resolves with the new uid of the message in the destination folder if the server supports [UIDPLUS](https://tools.ietf.org/html/rfc4315).

Command: [APPEND](https://tools.ietf.org/html/rfc3501#section-6.3.11)

### Example

```javascript
client.upload('INBOX', message).then((uid) => { ... });
```

## Move messages

Move messages with `moveMessages(path, sequence, destination[, options])`

Where

  * **path** is the path for the mailbox which should be selected for the command. Selects mailbox prior to executing if not already selected.
  * **sequence** defines the range of sequence numbers or UID values (if `byUid` option is set to true). Example: '1', '1:*', '1,2:3,4' etc.
  * **destination** is the destination folder path. Example: '[Gmail]/Trash'
  * **options** is an optional options object
    * **byUid** if `true` uses UID values instead of sequence numbers to define the range

Resolves when IMAP server completed the command.

If possible (MOVE extension is supported by the server) uses `MOVE` or `UID MOVE` otherwise falls back to COPY + EXPUNGE.

Command: [MOVE](http://tools.ietf.org/html/rfc6851)

### Example

```javascript
client.moveMessages('INBOX', '1:5', '[Gmail]/Trash').then(() => { ... });
```

## Events

### Keeping synchronization with your IMAP server

It is recommended to set up some sort of local caching for the messages. Please note that IMAP relies on a mixture of mailbox-unique identifiers (UID) and sequence numbers, so a mapping between both is definitely recommended.

There are two kinds of updates: 1) When something happens in the currently selected mailbox, and 2) when you select a mailbox

#### Updates for the selected mailbox

Your IMAP server sends you updates when something happens in the mailbox you have currently selected. Message updates can be listened for by setting the `onupdate` handler. First argument for the callback is the path, the second is the update type, and the third one is the new value.

**Example**

```javascript
client.onupdate = function(path, type, value){
    if (type === 'expunge') {
      // untagged EXPUNGE response, e.g. "* EXPUNGE 123"
      // value is the sequence number of the deleted message prior to deletion, so adapt your cache accordingly
    } else if (type === 'exists') {
      // untagged EXISTS response, e.g. "* EXISTS 123"
      // value is new EXISTS message count in the selected mailbox
    } else if (type === 'fetch') {
      // untagged FETCH response, e.g. "* 123 FETCH (FLAGS (\Seen))"
      // add a considerable amount of input tolerance here!
      // probably some flag updates, a message or messages have been altered in some way
      // UID is probably not listed, probably includes only the sequence number `#` and `flags` array
    }
}
```

#### Mailbox change notifications

For your everyday tasks, this client doesn't really require you to explicitly select a mailbox, even though having an eye on which mailbox is selected is useful to receive untagged updates. When a mailbox is opened or closed, the `onselectmailbox` and `onclosemailbox` handlers are called.

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

The IMAP client has several events you can attach to by setting a listener

### Handling fatal error event

The invocation of `onerror` indicates an irrecoverable error. When `onerror` is fired, the connection is already closed, hence there's no need for further cleanup.

## Get your hands dirty

```
$ git clone git@github.com:emailjs/emailjs-imap-client.git
$ cd emailjs-imap-client
$ npm install
$ npm test
```

## License

```
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
```
