#!/bin/bash
# Setup script for npm authentication with @naniteninja/ionic-lib
# Run this script before npm install

echo "Setting up npm authentication for @naniteninja/ionic-lib..."

if [ -z "${NPM_TOKEN}" ]; then
  echo "❌ NPM_TOKEN is not set."
  echo ""
  echo "Set it and rerun this script:"
  echo "  bash/zsh:  export NPM_TOKEN=\"<your-token>\""
  echo "  PowerShell: \$env:NPM_TOKEN=\"<your-token>\""
  exit 1
fi

# Write .npmrc without embedding secrets in the file. npm will substitute ${NPM_TOKEN} at runtime.
cat > .npmrc << 'EOF'
registry=https://registry.npmjs.org/
@naniteninja:registry=https://registry.npmjs.org/
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
always-auth=true
package-lock=false
legacy-peer-deps=true
EOF

if [ -f .npmrc ]; then
    echo "✅ Successfully created/updated .npmrc file"
    echo "📍 Location: $(pwd)/.npmrc"
    echo ""
    echo "You can now run: npm install"
else
    echo "❌ Error creating .npmrc file"
    exit 1
fi


