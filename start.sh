#!/bin/bash

# Start nginx in background
nginx

# Run gravity update in background after Pi-hole starts (wait 30 seconds for FTL to be ready)
(sleep 30 && pihole -g) &

# Execute the original Pi-hole entrypoint
exec /init
