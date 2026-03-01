# FlowML

A no-code ML pipeline builder where you describe what you want in plain English, and it builds the entire pipeline for you on a visual canvas.

## What is this?

Most ML workflows follow the same pattern — load data, clean it, split it, train a model, evaluate. But every time, you're writing the same boilerplate in a Jupyter notebook. AutoFlow ML replaces that with a visual drag-and-drop canvas. You connect nodes like building blocks, hit run, and the pipeline executes end-to-end.

The interesting part: you don't even have to build the pipeline manually. Just type something like *"predict house prices using random forest"* into the AI prompt, and the system generates a complete, runnable pipeline on the canvas automatically.

## How the AI generation works

This isn't just throwing a prompt at an LLM and hoping for valid output. The architecture is deliberately split:

1. **Gemini receives the user's prompt** and returns only an *intent* — a structured JSON with the problem type, input type, and which models to use.
2. **The backend is the single authority** on pipeline structure. It takes that intent and deterministically constructs valid nodes and edges. The LLM never decides what nodes exist or how they connect.
3. If the LLM returns garbage, the system falls back to a safe default pipeline. It never crashes, never produces an invalid graph.

This means no hallucinated node types, no impossible connections, no cycles in the graph. The AI understands *what you want*, but the backend decides *how to build it*.

## Multi-model comparison

One of the things I'm most proud of — you can compare multiple models in a single pipeline. Say you type *"compare linear regression and random forest on iris dataset"*. The system generates a **branching pipeline**:

```
                    ┌── Linear Regression ── Evaluator ──┐
Data → Clean → Split                                      → Comparison → Best Model
                    └── Random Forest ────── Evaluator ──┘
```

Each branch trains and evaluates independently, then the comparison node aggregates all the metrics and picks the winner. It's basically AutoML but you can see everything happening.

## AI explainability

There's a built-in AI tutor panel. After you build a pipeline (manually or via AI), you can click "Explain" and it generates a step-by-step breakdown of what each node does and *why* it's needed. You can also ask follow-up questions about your specific pipeline — the AI answers based on the actual graph context, not generic ML knowledge.

This was built with beginners in mind. The goal is: you build a pipeline, you run it, and then you *understand* what you just did.

## The pipeline engine

Under the hood, every pipeline is a DAG (directed acyclic graph). The Python ML engine:

- Validates the graph has no cycles
- Topologically sorts the nodes
- Executes them in dependency order
- Passes outputs from parent nodes to children (with deep-merging for multi-branch scenarios)

Each node type has its own executor function. Adding a new ML operation is just writing one Python function and registering it — the rest of the system picks it up automatically.

## What nodes are available

- **Input**: CSV upload, or built-in sample datasets (Iris, California Housing)
- **Preprocessing**: Remove nulls (drop/fill mean/median/zero), Min-Max scaling
- **Splitting**: Train/test split with configurable ratio
- **Models**: Linear Regression, Random Forest (auto-detects classification vs regression), XGBoost
- **Evaluation**: R² score, RMSE, MAE — with actual vs predicted charts and feature importance
- **Comparison**: Aggregates metrics from multiple models, ranks them, picks the best

## Tech stack

- **Frontend**: React 19, Vite, React Flow (for the canvas), Tailwind CSS, Framer Motion, Recharts
- **Backend**: Node.js, Express, MongoDB Atlas, JWT auth
- **ML Engine**: Python, FastAPI, scikit-learn, XGBoost
- **AI**: Google Gemini (for pipeline generation and explainability)

## Running it locally

You need three terminals:

```bash
# Backend (port 5000)
cd backend
npm install
node server.js

# ML Engine (port 5001)
cd ml-engine
pip install -r requirements.txt
python main.py

# Frontend (port 3000)
cd frontend
npm install
npm run dev
```

You'll need a `.env` file in the backend with your MongoDB URI, Gemini API key, and JWT secret. Check `.env.example` for the format.

## Project structure

```
FlowML/
├── frontend/          # React app — canvas, nodes, panels, charts
├── backend/           # Express API — auth, AI calls, pipeline CRUD
├── ml-engine/         # FastAPI — DAG execution, model training
└── shared/            # Pipeline schema shared between services
```

## License

MIT
