<div align="center">

# 🧠 AutoFlow ML

### **The No-Code Machine Learning Pipeline Builder**

*Describe what you want in plain English. Watch an entire ML pipeline appear on your canvas.*

[![MIT License](https://img.shields.io/badge/License-MIT-7C3AED.svg?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Powered-4285F4.svg?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

---

**AutoFlow ML** eliminates the gap between *"I want to build a model"* and *actually building one*.  
No boilerplate. No scikit-learn imports. No Jupyter notebooks. Just **drag, connect, run**.

[Getting Started](#-getting-started) · [How It Works](#-how-it-works) · [Architecture](#-architecture) · [Tech Stack](#-tech-stack)

</div>

---

## 💡 The Problem

Building ML pipelines today requires:
- Writing repetitive boilerplate (imports, splits, fits, evaluations)
- Juggling Jupyter cells in the right order
- Knowing which preprocessing step connects where
- Manually comparing models with custom scripts

**Most people who need ML aren't ML engineers.** They're analysts, students, product managers, and domain experts who understand their *data* — but not `sklearn.model_selection.train_test_split`.

---

## 🚀 What AutoFlow ML Does Differently

### 🎯 AI-Powered Pipeline Generation
Type a sentence like *"Compare linear regression and random forest on housing data"* — and AutoFlow ML uses **Google Gemini** to understand your intent, then **deterministically constructs** a valid, executable pipeline on the canvas. The AI outputs *intent only*; the backend is the single authority on pipeline structure. **No hallucinated nodes. No invalid graphs. Ever.**

### 🔀 Multi-Model Comparison Pipelines
AutoFlow ML doesn't just train one model. It can **branch your pipeline** into parallel model tracks — each with its own training and evaluation — then **automatically converge** the results into a comparison node that ranks models and picks the best performer.

```
                    ┌─── Linear Regression ─── Evaluator ───┐
Dataset → Clean → Split                                      → Model Comparison → 🏆 Best Model
                    └─── Random Forest ─────── Evaluator ───┘
```

### 🧩 Visual DAG-Based Execution
Every pipeline is a **directed acyclic graph (DAG)**. Nodes represent ML operations (data loading, preprocessing, splitting, training, evaluation). Edges represent data flow. The engine validates the DAG, topologically sorts it, and executes nodes in dependency order — **just like Apache Airflow**, but visual and instant.

### 🤖 AI Explainability Layer
Don't just run a pipeline — **understand it**. AutoFlow ML has a built-in AI tutor that can:
- **Explain your entire pipeline** step-by-step (what each node does and *why* it's needed)
- **Answer follow-up questions** grounded in your specific pipeline context
- Help beginners learn ML by building, not just reading

### 📊 Real-Time Metrics Dashboard
After execution, a **rich metrics dashboard** renders:
- R² Score, RMSE, MAE evaluation metrics
- Actual vs. Predicted scatter charts
- Feature importance bar charts
- Model comparison leaderboards with rankings

---

## ⚙️ How It Works

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER (Browser)                            │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  React Canvas (React Flow)  │  Config Panel  │  Metrics   │  │
│  └────────────────────┬───────────────────────────────────────┘  │
└───────────────────────┼──────────────────────────────────────────┘
                        │  REST API
┌───────────────────────▼──────────────────────────────────────────┐
│                   Node.js / Express Backend                      │
│  • Auth (JWT)    • Pipeline CRUD (MongoDB)    • Gemini AI calls  │
│  • Deterministic pipeline builder from AI intent                 │
│  • Proxies execution to ML Engine                                │
└───────────────────────┬──────────────────────────────────────────┘
                        │  HTTP
┌───────────────────────▼──────────────────────────────────────────┐
│                   Python / FastAPI ML Engine                      │
│  • DAG validation & topological sort                             │
│  • Executor registry (csv_upload, remove_nulls, train_test_split │
│    linear_regression, random_forest, xgboost, accuracy,          │
│    model_comparison)                                             │
│  • Model artifact persistence (joblib .pkl)                      │
└──────────────────────────────────────────────────────────────────┘
```

**Key design decisions:**
1. **AI outputs intent, not structure** — Gemini returns `{ problem_type, models[], ... }`. The backend maps intent → valid DAG. This prevents hallucinated or structurally invalid pipelines.
2. **Executor registry pattern** — Adding a new ML node means writing one Python function and registering it. Zero frontend changes needed for backend-only additions.
3. **Deep-merge parent outputs** — The pipeline runner merges outputs from multiple parent nodes (critical for multi-model comparison where a comparison node receives metrics from N eval nodes).

---

## 🧱 Architecture

```
AutoFlow-ML/
├── frontend/                  # React 19 + Vite + Tailwind
│   └── src/
│       ├── components/
│       │   ├── PipelineCanvas.jsx     # React Flow canvas with drag-drop
│       │   ├── CustomNode.jsx         # Styled pipeline nodes
│       │   ├── GenerateModal.jsx      # AI prompt → pipeline generation
│       │   ├── ExplanationPanel.jsx   # AI explainability + Q&A
│       │   ├── MetricsDashboard.jsx   # Recharts visualizations
│       │   ├── ConfigPanel.jsx        # Node configuration sidebar
│       │   ├── ExecutionPanel.jsx     # Real-time execution logs
│       │   └── NodeSidebar.jsx        # Drag-and-drop node palette
│       ├── context/                   # React context for pipeline state
│       ├── pages/                     # Login, Register, Dashboard
│       └── utils/                     # API client, node definitions
│
├── backend/                   # Node.js + Express
│   ├── server.js              # Entry point, middleware, MongoDB
│   ├── routes/
│   │   ├── generate.js        # Gemini AI → deterministic pipeline builder
│   │   ├── explain.js         # AI explainability & Q&A endpoints
│   │   ├── execute.js         # Pipeline execution proxy
│   │   ├── pipelines.js       # CRUD for saved pipelines
│   │   ├── upload.js          # CSV file upload handler
│   │   └── auth.js            # JWT authentication
│   └── models/                # Mongoose schemas
│
├── ml-engine/                 # Python + FastAPI
│   ├── main.py                # FastAPI app, CORS, routes
│   ├── pipeline_runner.py     # DAG validation, topological sort, execution
│   ├── executors.py           # All ML node executors
│   └── requirements.txt       # Python dependencies
│
└── shared/
    └── pipeline_schema.json   # Shared schema between services
```

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, Vite 7, React Flow | Interactive node canvas |
| **Styling** | Tailwind CSS 4, Framer Motion | Dark-mode UI, animations |
| **Charts** | Recharts | Metrics visualization |
| **Backend** | Node.js, Express | API gateway, auth, orchestration |
| **Database** | MongoDB Atlas | Pipeline & user persistence |
| **ML Engine** | Python, FastAPI, scikit-learn | Model training & evaluation |
| **AI** | Google Gemini 2.0 Flash | Pipeline generation & explainability |
| **Auth** | JWT + bcrypt | Stateless authentication |

---

## 📦 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **Python** ≥ 3.9
- **MongoDB Atlas** account (or local MongoDB)
- **Google Gemini API Key** ([get one here](https://aistudio.google.com/app/apikey))

### 1. Clone the repo
```bash
git clone https://github.com/prithish47/AutoFlow-ML.git
cd AutoFlow-ML
```

### 2. Setup the Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGODB_URI, GEMINI_API_KEY, and JWT_SECRET
node server.js
```
Backend runs on **http://localhost:5000**

### 3. Setup the ML Engine
```bash
cd ml-engine
pip install -r requirements.txt
python main.py
```
ML Engine runs on **http://localhost:5001** (Swagger docs at `/docs`)

### 4. Setup the Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on **http://localhost:3000**

---

## 🧪 Supported Pipeline Nodes

| Category | Node | Description |
|----------|------|-------------|
| 📥 **Input** | CSV Upload | Load user-uploaded `.csv` files |
| 📥 **Input** | Sample Dataset | Built-in Iris & California Housing datasets |
| 🧹 **Preprocessing** | Remove Nulls | Drop rows or fill with mean/median/zero |
| 📏 **Preprocessing** | Min-Max Scaler | Normalize features to [0, 1] range |
| ✂️ **Splitting** | Train/Test Split | Configurable test ratio and random state |
| 🤖 **Model** | Linear Regression | Classic regression with coefficient analysis |
| 🌲 **Model** | Random Forest | Auto-detects regression vs. classification |
| ⚡ **Model** | XGBoost | Gradient boosting with tunable hyperparameters |
| 📊 **Evaluation** | Accuracy / Metrics | R², RMSE, MAE with chart generation |
| 🏆 **Comparison** | Model Comparison | Ranks N models, selects best performer |

---

## 🔮 Roadmap

- [ ] Deep Learning nodes (Neural Networks via TensorFlow/PyTorch)
- [ ] Feature engineering nodes (PCA, encoding, binning)
- [ ] Pipeline versioning & experiment tracking
- [ ] Export to Python script / Jupyter notebook
- [ ] Docker Compose for one-command deployment
- [ ] Collaborative editing (multiplayer canvas)

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

---

<div align="center">

**Built with ❤️ by [Prithish](https://github.com/prithish47)**

*If AutoFlow ML helped you, consider giving it a ⭐*

</div>
