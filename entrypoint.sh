#!/bin/sh
# set -x

cd /app

[ -d node_modules ] && rm -rf node_modules
[ -d .pnpm-store ] && rm -rf .pnpm-store
pnpm rm @nanostores/react
pnpm i

echo "Container is running now. You can run the \"pnpm dev\" in attached console"
# just to keep it running :)
tail -f /dev/null