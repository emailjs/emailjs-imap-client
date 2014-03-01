# browserbox

IMAP client for browsers

## Current status

If you run the application as a FirefoxOS packaged webapp (using the manifest.webapp file) or as a Chrome packaged app (using manifes.json), you can connect to an non SSL IMAP server. Thats about it for now.

## Usage

  1. Download the source of this repo
  2. Install dependencies with `bower install imapHandler mimefuncs utf7`
  3. Add this directory as a packaged app either to FirefoxOS simulato/device or Chrome extensions
  4. Start the simulator and open browserbox app

**NB!** You might need to reinstall bower dependencies when upgrading

## SSL support

Currently only non secure connections are used. If you want to use a secure server, use the man-in-the-middle imap proxy. Run

    node example/proxy.js

And use host "localhost" and port "1143" to connect to GMail IMAP.

## API

Require [browserbox.js](browserbox.js) as an AMD module to use it. This exposes `browserbox` function.

## Create connection to an IMAP server

```
browserbox(host[, port][, options]) → IMAP client object
```

Where

  * **host** is to hostname to connect to
  * **port** (optional) is the port to connect to (defaults to 143)
  * **options** (optional) is the options object
    * **auth** is the authentication information object
      * **user** is the username of the user
      * **pass** is the password of the user
    * **id** (optional) is the identification object for [RFC2971](http://tools.ietf.org/html/rfc2971#section-3.3) (ex. `{name: "myclient", version: "1"}`)

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

List all mailboxes with `listMailboxes` method

```
client.listMailboxes(callback)
```

Where

  * **callback** is the callback function with the following arguments
    * **err** is an error object, only set if the request failed
    * **mailboxes** is an object with the mailbox structure

Mailbox object is with the following structure

  * **root** (boolean) `true` if the node is root
  * **name** (string) undecoded name of the mailbox
  * **path** (string) full path to the mailbox
  * **delimiter** (string) path delimiting symbol
  * **listed** (boolean) mailbox was found in the LIST response
  * **subscribed** (boolean) mailbox was found in the LSUB response
  * **specialUse** (string) mailbox was identified as a special use mailbox ("trash", "sent", "junk" etc. see [RFC6154](http://tools.ietf.org/html/rfc6154#section-2))
  * **flags** (array) a list of flags
  * **children** (array) a list of child mailboxes

Example

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
          "specialUse": "all",
          "subscribed": true
        }
      ]
    }
  ]
}
```

## List namespaces

List available namespaces with `listNamespaces`. If [NAMESPACE](https://tools.ietf.org/html/rfc2342) extension is not supported, the method returns `false`.

```javascript
client.listNamespaces(callback)
```

Where

  * **callback** is the callback function with the following arguments
    * **err** is an error object, only set if the request failed
    * **namespaces** is an object with the namespace values or false if NAMESPACE is not supported

Namespace object is with the following structure

  * **personal** is an array of namespace elements or null for Personal Namespace
  * **users** is an array of namespace elements or null for Other Users' Namespace
  * **shared** is an array of namespace e
  ```json
  {
    "readOnly": false,
    "exists": 6596,
    "flags": [
        "\\Answered",
        "\\Flagged",
        "\\Draft",
        "\\Deleted",
        "\\Seen",
        "$MailFlagBit1",
        "$MailFlagBit0",
        "$MailFlagBit2",
        "NonJunk",
        "Junk",
        "$Phishing",
        "$Forwarded",
        "$MDNSent",
        "JunkRecorded",
        "$NotJunk",
        "receipt-handled",
        "NotJunk",
        "$NotPhishing",
        "$Junk"
    ],
    "permanentFlags": [
        "\\Answered",
        "\\Flagged",
        "\\Draft",
        "\\Deleted",
        "\\Seen",
        "$MailFlagBit1",
        "$MailFlagBit0",
        "$MailFlagBit2",
        "NonJunk",
        "Junk",
        "$Phishing",
        "$Forwarded",
        "$MDNSent",
        "JunkRecorded",
        "$NotJunk",
        "receipt-handled",
        "NotJunk",
        "$NotPhishing",
        "$Junk",
        "\\*"
    ],
    "uidValidity": 2,
    "uidNext": 38361,
    "highestModseq": 3682918
}
  ```lements or null for Shared Namespace

Namespace element object has the following structure

  * **prefix** is the prefix string
  * **delimiter** is the hierarchy delimiter

**NB!** Namespace_Response_Extensions are not supported (extension data is silently skipped)

## Select mailbox

Select specific mailbox by path with `selectMailbox`

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

## Screenshots

**FirefoxOS**

![](https://raw2.github.com/Kreata/browserbox/master/example/img/firefoxos.png)

**Chrome**

![](https://raw2.github.com/Kreata/browserbox/master/example/img/chrome.png)
