#!/bin/bash

# Get knock service token from user
echo "== KNOCK CONFIGURATION =="
echo "Note: this script only works with mac or linux."
echo ""
read -rp "SERVICE TOKEN: " serviceToken

# Create the directory if it doesn't exist
configDir="$HOME/.config/knock"
mkdir -p "$configDir"

# Create the config.json file
configFile="$configDir/config.json"
echo "{ \"serviceToken\": \"$serviceToken\" }" > "$configFile"

echo "Config file created at $configFile with serviceToken: $serviceToken"
