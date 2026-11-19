@echo off
rem Sonic Pi's folder on this PC (keep it the same as "sonic_pi" in tools\paths.json)
set "SONIC_PI=C:\Program Files\Sonic Pi"
"%SONIC_PI%\app\server\native\ruby\bin\ruby.exe" -E utf-8 "%~dp0sonicpi-gui.rb" %*
