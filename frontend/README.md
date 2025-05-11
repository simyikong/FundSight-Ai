
---

## Getting Started

### 1. Backend (FastAPI)

#### Setup
```sh
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
pip install -r requirements.txt
```

#### Run the Backend
```sh
uvicorn main:app --reload
```
- The backend will be available at [http://localhost:8000](http://localhost:8000)

---

### 2. Frontend (React + TypeScript)

#### Setup
```sh
cd frontend
```

#### Windows/PowerShell Users
If you see errors about scripts not being digitally signed, run this first:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

#### Install dependencies
```sh
npm install
npm install react-router-dom@6 @mui/material @emotion/react @emotion/styled
npm install --save-dev @types/react @types/react-dom
```

#### Run the Frontend
```sh
npm start
```
- The frontend will be available at [http://localhost:3000](http://localhost:3000)

---

## Troubleshooting
- If you see errors about missing modules, try deleting `node_modules` and `package-lock.json`, then run `npm install` again.
- For PowerShell execution policy errors, always run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` before using `npm`.
- Use Command Prompt or Git Bash as an alternative to PowerShell to avoid execution policy issues.

