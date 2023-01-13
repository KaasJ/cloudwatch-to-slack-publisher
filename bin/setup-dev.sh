#!/usr/bin/env bash

set -eo pipefail # exit if any command or pipe fail
set -u # exit on undefined variable

echo "Ensuring git hooks are setup"
git config core.hooksPath bin/.git-hooks

echo "Ensuring all npm dependencies are installed"
npm install

echo "Done 🥂"
