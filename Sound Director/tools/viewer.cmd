@echo off
rem The studio's viewer: every delivered track and sound, played as the game would play them. http://localhost:%PORT%/
rem   tools\viewer.cmd          starts the server and opens the page
rem the port: keep it the same as "viewer_port" in tools\paths.json
set PORT=8778
start "" http://localhost:%PORT%/
node "%~dp0serve.js" %PORT%
