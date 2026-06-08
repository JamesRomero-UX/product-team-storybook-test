#!/bin/bash

# Default Org Keys
ORGS=(
  "org_Qshp7tYsxxAWwhVa"
  "org_Wry1ylTIzMeSDBkT"
  "org_weM43nU7Ac58JzHL"
  "org_o2dH1p42UjGrBaYU"
)

for ORG in "${ORGS[@]}"; do
  echo "Disabling events for org: $ORG"
  curl -k -X POST "https://localhost/disable-events" \
       -H "Content-Type: application/json" \
       -H "Accept: application/json" \
       -d "{\"orgKey\": \"$ORG\"}"
  echo ""
done
