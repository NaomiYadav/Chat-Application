@echo off
echo ===============================================
echo   Real-Time Chat Application Setup
echo ===============================================
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo.
    echo Please install Node.js first:
    echo 1. Go to https://nodejs.org/
    echo 2. Download the LTS version
    echo 3. Run the installer
    echo 4. Restart this script after installation
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js is installed
node --version
npm --version
echo.

echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.
echo Starting the chat application...
echo.
echo 🌐 Open your browser and go to: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
