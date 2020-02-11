#!/bin/sh

echo "curl -X POST https://swarmpit.ucc.dev/api/stacks/${1}/redeploy -H \"Authorization: XXXXX\""
curl -X POST https://swarmpit.ucc.dev/api/stacks/${1}/redeploy -H "Authorization: ${2}"
