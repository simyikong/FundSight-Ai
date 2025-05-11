@echo off
REM Backend structure
mkdir backend\app
mkdir backend\app\api
mkdir backend\app\api\v1
mkdir backend\app\core
mkdir backend\app\models
mkdir backend\app\services

echo from fastapi import FastAPI > backend\main.py
echo. >> backend\main.py
echo app = FastAPI() >> backend\main.py
echo. >> backend\main.py
echo @app.get("/") >> backend\main.py
echo def read_root(): >> backend\main.py
echo     return {"message": "Hello from FundSight Ai FastAPI backend!"} >> backend\main.py

echo fastapi> backend\requirements.txt
echo uvicorn>> backend\requirements.txt
echo python-dotenv>> backend\requirements.txt

echo venv/> backend\.gitignore
echo __pycache__/> backend\.gitignore
echo .env> backend\.gitignore

type nul > backend\app\__init__.py
type nul > backend\app\api\__init__.py
type nul > backend\app\api\v1\__init__.py
type nul > backend\app\api\v1\chatbot.py
type nul > backend\app\api\v1\dashboard.py
type nul > backend\app\api\v1\loan.py
type nul > backend\app\core\__init__.py
type nul > backend\app\core\config.py
type nul > backend\app\core\ai.py
type nul > backend\app\models\__init__.py
type nul > backend\app\models\user.py
type nul > backend\app\models\finance.py
type nul > backend\app\models\loan.py
type nul > backend\app\services\__init__.py
type nul > backend\app\services\budget.py
type nul > backend\app\services\loan.py
type nul > backend\app\services\report.py

REM Frontend structure
mkdir frontend\src\api
mkdir frontend\src\components\Chatbot
mkdir frontend\src\components\Dashboard
mkdir frontend\src\components\Loan
mkdir frontend\src\pages
mkdir frontend\src\utils
mkdir frontend\src\types

type nul > frontend\src\api\index.ts
type nul > frontend\src\components\Chatbot\Chatbot.tsx
type nul > frontend\src\components\Dashboard\Dashboard.tsx
type nul > frontend\src\components\Loan\Loan.tsx
type nul > frontend\src\pages\Home.tsx
type nul > frontend\src\pages\Dashboard.tsx
type nul > frontend\src\pages\Loan.tsx
type nul > frontend\src\utils\index.ts
type nul > frontend\src\types\index.ts

echo # FundSight Ai > README.md
echo. >> README.md
echo AI-Powered Financial Advisor for MSMEs >> README.md
echo. >> README.md
echo See backend and frontend folders for structure. >> README.md

echo Folder structure created.
pause