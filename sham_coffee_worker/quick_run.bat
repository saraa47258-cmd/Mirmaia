@echo off
REM Quick Run Script for Android Studio
REM This runs the app directly from build folder (bypasses INSTALL error)

echo Running Sham Coffee Worker...
echo.

set APP_PATH=build\windows\x64\runner\Debug\sham_coffee_worker.exe

if exist "%APP_PATH%" (
    echo Starting application...
    start "" "%APP_PATH%"
    echo Application started!
) else (
    echo ERROR: Application not found at: %APP_PATH%
    echo.
    echo Please build the app first in Android Studio.
    echo (The INSTALL error is safe to ignore)
    pause
)
