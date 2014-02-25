# browserbox

IMAP client for browsers

## Current status

If you run the application as a FirefoxOS packaged webapp (using the manifest.webapp file) or as a Chrome packaged app (using manifes.json), you can connect to an non SSL IMAP server. Thats about it for now.

## Usage

  1. Download the source of this repo
  2. Install dependencies with `bower install imapHandler mimefuncs`
  3. Add this directory as a packaged app either to FirefoxOS simulato/device or Chrome extensions
  4. Start the simulator and open browserbox app

**NB!** You might need to reinstall bower dependencies when upgrading

## SSL support

Currently only non secure connections are used. If you want to use a secure server, use the man-in-the-middle imap proxy. Run

    node example/proxy.js

And use host "localhost" and port "1143" to connect to GMail IMAP.

## Screenshots

**FirefoxOS**

![](https://raw2.github.com/Kreata/browserbox/master/example/firefoxos.png)

**Chrome**

![](https://raw2.github.com/Kreata/browserbox/master/example/chrome.png)

