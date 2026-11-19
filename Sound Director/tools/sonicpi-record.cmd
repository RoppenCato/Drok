@echo off
rem Record a Sonic Pi file to a 24-bit WAV, in real time, through the spider's own recorder (tools\record.rb).
rem   sonicpi-record.cmd OUT.wav SECONDS FILE.rb [SEED]
if "%~3"=="" (echo usage: sonicpi-record.cmd OUT.wav SECONDS FILE.rb [SEED] & exit /b 1)
set SEEDARG=
if not "%~4"=="" set SEEDARG=-s %~4
rem Sonic Pi's folder on this PC (keep it the same as "sonic_pi" in tools\paths.json)
set "SONIC_PI=C:\Program Files\Sonic Pi"
"%SONIC_PI%\app\server\native\ruby\bin\ruby.exe" -E utf-8 "%~dp0record.rb" -o "%~1" -d %~2 -f "%~3" %SEEDARG%
