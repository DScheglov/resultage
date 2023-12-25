PACKAGE=$(npm pgk get name)@$(npm pgk get version)
VERSION=$(npm view $PACKAGE version || echo "")
if [[ -n $VERSION ]]; then echo "Couldn't publish over existing version."; exit 1; fi
