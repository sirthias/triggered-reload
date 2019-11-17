#!/bin/bash

# start netcat listening on TCP port 43434 for new connections and simply forwarding all incoming
# bytes to stdin, where the browser delivers them to the `triggered-reload` extension.
#
# NOTE: Incoming bytes must be a UTF-8 encoded JSON message preceded by 32 bits
# holding the length of the JSON bytes in *native byte order*!!!
exec nc -kl 43434
