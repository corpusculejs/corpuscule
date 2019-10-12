#!/usr/bin/env bash
export SONAR_SCANNER_HOME=$HOME/.sonar/sonar-scanner-$SONAR_SCANNER_VERSION-linux

rm -rf "$SONAR_SCANNER_HOME"
mkdir -p "$SONAR_SCANNER_HOME"

curl -sSLo "$HOME"/.sonar/sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-"$SONAR_SCANNER_VERSION"-linux.zip
unzip "$HOME"/.sonar/sonar-scanner.zip -d "$HOME"/.sonar/

rm "$HOME"/.sonar/sonar-scanner.zip

export PATH=$SONAR_SCANNER_HOME/bin:$PATH
export SONAR_SCANNER_OPTS="-server"

cd "$GITHUB_WORKSPACE"
sonar-scanner \
  -Dsonar.login="$SONAR_TOKEN" \
  -Dsonar.javascript.lcov.reportPaths=.coverage/macOS/lcov.info,.coverage/windows/lcov.info
