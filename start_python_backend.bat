@echo off
echo ============================================
echo   Abyss AI Chatbot - Python Backend
echo ============================================
echo.
echo Checking Python installation...
python --version
echo.
echo Installing dependencies...
pip install -r requirements.txt
echo.
echo Starting Abyss AI Chatbot Backend...
echo Server will run at: http://localhost:5000
echo.
python run.py
pause
