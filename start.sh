#!/bin/bash

# Start nginx in background
nginx

# Execute the original Pi-hole entrypoint
exec /s6-init
