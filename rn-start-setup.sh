#!/bin/bash

# --- Configuration ---
REQUIRED_NODE_MAJOR_VERSION=20
# ---------------------

# Get the current major Node.js version
CURRENT_VERSION=$(node -v)
CURRENT_MAJOR_VERSION=$(echo $CURRENT_VERSION | sed 's/v\([0-9]*\)\..*/\1/')

echo "--- Node Version Check (Post-Install) ---"
echo "Project requires Node v$REQUIRED_NODE_MAJOR_VERSION or higher."
echo "Your current Node version is: $CURRENT_VERSION"

# Check if the current major version is less than the required version
if [ "$CURRENT_MAJOR_VERSION" -lt "$REQUIRED_NODE_MAJOR_VERSION" ]; then
    echo "-----------------------------------------"
    echo "🛑 ERROR: INCOMPATIBLE NODE VERSION DETECTED"
    echo "This project's dependencies (React Native 0.81.0) require Node.js v$REQUIRED_NODE_MAJOR_VERSION or higher (you are using v$CURRENT_MAJOR_VERSION)."
    echo ""
    echo "NPM INSTALL FAILED. Please switch your Node version."
    echo "To fix this, run: 'nvm use $REQUIRED_NODE_MAJOR_VERSION'"
    echo "-----------------------------------------"
    exit 1
else
    echo "✅ Node version v$CURRENT_MAJOR_VERSION is compatible for installation."
    echo "-----------------------------------------"
    # Do NOT run react-native start here. We only check the version.
    exit 0
fi