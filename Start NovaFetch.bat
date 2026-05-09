@echo off
title NovaFetch - Media Downloader
echo Starting NovaFetch Services...
cd /d "c:\Users\Gurjant Singh\Documents\Nova-Fetch"

:: Start the development server in a new window so it stays running in the background
start /b npm run dev

echo Waiting for services to initialize...
timeout /t 5 /nobreak > nul

:: Open in a dedicated "App Window" (removes browser tabs/address bar for a clean desktop feel)
echo Launching App Window...
start msedge --app="http://localhost:5173/"

exit
