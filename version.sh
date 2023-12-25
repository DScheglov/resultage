PACKAGE=$(npm pkg get name | xargs)@$(npm pkg get version | xargs)
VERSION=$(npm view $PACKAGE version || echo "")

if [[ -n $VERSION ]]; then 
  echo "Couldn't publish over existing version."; exit 1; 
else 
  echo "Publishing $PACKAGE";
fi
