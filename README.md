# Firefox Web Extension for Triggered Reloading of Tabs

This repository contains an experimental web extension (Addon) for Firefox V59+,
which provides the ability to trigger a reload of certain tabs from outside the
browser, i.e. external applications or the command line.

The original use case for this extension is web development on the local
machine, where the browser is showing content from a web server on localhost or
the file system and is supposed to reload/refresh a page/tab whenever the
viewed content has changed and this change can be signaled from the outside.

Basic mechanics:

- When loaded the browser extension (Addon) displays a simple "page action"
  icon on the right of the address bar of all tabs.

- When this icon is clicked the extension starts a native "application" that
  listens for TCP connections on port 43434.

- External applications can then send a message containing an URI match string
  to this TCP port, which gets forwarded to the browser extension, which then
  triggers a reload of all tabs on which it is currently enabled and for which
  the received match string matches the URI.

The native application spawned by the extension is simply netcat (`nc`), which
must be available on the users path. Netcat is simply started with the command
line `nc -kl 43434` which then does all that's required.


## Installation & Test

(The following is only tested on macOS, but should work in a similar way on
Linux.)

- clone this repository

- `cd` into the cloned working copy base directory

- Make the native part of the extension executable with:

  ```bash
  chmod +x native/start_nc.sh
  ```

- Copy `native/triggered.reload.json.template` to `native/triggered-reload.json`
  and replace the `<path-to-triggered-reload>` placeholder with the absolute
  path to the working copy:

  ```bash
  sed "s#<path-to-triggered-reload>#$(pwd)#" native/triggered.reload.json.template > native/triggered.reload.json
  ```

- Register the native part of the extension with:

  ```bash
  cp native/triggered.reload.json ~/Library/Application\ Support/Mozilla/NativeMessagingHosts/
  ```

- open a new tab in Firefox and type `about:debugging` into the address bar

- click on `This Firefox`

- click on `Load Temporary Add-on` and select `.../addon/manifest.json` from
  the cloned working copy

- switch to the tab you'd like to enable triggered-reload for and click the
  new, "refresh-like" icon on the right of the address bar

- run this command from any shell to trigger a reload:

  ```bash
  printf '\14\0\0\0"<all_urls>"' | nc 127.0.0.1 43434
  ```


## Message Structure

The message that needs to be sent to TCP port 43434 on localhost must be a
UTF-8 encoded JSON string preceded by 4 bytes holding the length of the JSON
string in *native byte order* (i.e. little-endian on Intel machines).

This JSON string (which is just a string of UTF-8 encoded characters surrounded
by double quotes) holds a URI "match pattern" as documented on this page:
https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns

The simplest match pattern is `"<all_urls>"`, which will simply trigger a
reload of all tabs that currently have reloading enabled. Together with the 4
bytes length prefix this amounts to the following 16 bytes (in hex) for the
general "reload everything" message on little-endian machines:

```
0c 00 00 00 22 3c 61 6c 6c 5f 75 72 6c 73 3e 22
```
