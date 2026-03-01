# AutoFlow-ML

![AutoFlow-ML Demo](file:///C:/Users/neopr/.gemini/antigravity/brain/b610bb68-ba0c-4ecb-92bf-183825cd772c/autoflow_ml_demo_1772348705225.png)

## 🚀 Overview
**AutoFlow-ML** is a premium, low‑code platform that lets you design, execute, and visualize machine‑learning pipelines through a sleek, dark‑mode, glass‑morphism UI. It combines a modern React frontend, a Node/Express backend, and a FastAPI‑based ML engine.

## ✨ Features
- **Node‑based visual pipeline builder** with drag‑and‑drop.
- **Dynamic execution** via a FastAPI micro‑service.
- **File uploads** for CSV datasets.
- **Extensible executor architecture** – add new ML nodes easily.
- **Responsive, premium UI** with micro‑animations and dark‑mode first design.

## 🛠️ Tech Stack
- **Frontend:** React, Vite, vanilla CSS (custom design system).
- **Backend:** Node.js, Express, MongoDB Atlas.
- **ML Engine:** Python, FastAPI, executors in `executors.py`.
- **Shared Schema:** `shared/pipeline_schema.json`.

## 📦 Getting Started
```bash
# Clone the repo
git clone https://github.com/prithish47/AutoFlow-ML.git
cd AutoFlow-ML

# Install dependencies
# Frontend
cd frontend && npm install && npm run dev
# Backend
cd ../backend && npm install && node server.js
# ML Engine
cd ../ml-engine && pip install -r requirements.txt && python main.py
```
The services will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- ML Engine: http://localhost:5001 (Swagger UI at `/docs`)

## 📂 Project Structure
```
AutoFlow-ML/
├─ frontend/        # React UI
├─ backend/         # Express API
├─ ml-engine/       # FastAPI ML service
├─ shared/          # Pipeline JSON schema
└─ README.md
```

## 🤝 Contributing
Feel free to open issues or submit pull requests. Follow the existing code style and run the linting scripts before committing.

## 📄 License
MIT License – see `LICENSE` for details.
