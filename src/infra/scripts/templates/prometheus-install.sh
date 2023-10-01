#!/bin/bash
ARCH=$1
VERSION=$2

if [ "$VERSION" == "" ]; then
    echo "No version passed, using 2.45.1"
    VERSION="2.45.1"
fi

if [ "$ARCH" == "" ]; then
    echo "No arch passed, using amd64"
    ARCH="amd64"
fi

if [ "$ARCH" == "amd64" ]; then
    OS="linux"
elif [ "$ARCH" == "armv7" ]; then
    OS="linux"
elif [ "$ARCH" == "arm64" ]; then
    OS="darwin"
else
    echo "Unsupported arch: $ARCH"
    exit 1
fi

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

jinja2 "$DIR/prometheus-install.j2" -D os="$OS" -D arch="$ARCH" -D version=$VERSION > "$DIR/../prometheus/install_prometheus2.sh"

