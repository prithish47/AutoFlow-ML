# FlowML

A visual, no-code platform for building and running machine learning pipelines. Instead of writing code in notebooks, you drag ML operations onto a canvas, connect them, configure them, and hit run.

## The idea

Every ML workflow is fundamentally the same graph — data goes in, gets cleaned, gets split, a model trains on it, and you evaluate the results. But we write this as code every single time, managing imports, variable names, execution order, and error handling manually.

FlowML makes that graph *literal*. Each operation is a node on a canvas. You connect nodes with edges to define data flow. The system handles the rest — it figures out the correct execution order, passes data between steps, and gives you results with interactive charts.

The core of this project is the **pipeline execution engine**. It's not a UI wrapper around sklearn. It's a real DAG runtime.

## How the engine works

When you hit "Run", this is what happens:

1. **The frontend sends the graph** (nodes + edges) to the backend, which forwards it to the Python ML engine.
2. **The engine validates the DAG** — checks for cycles, orphan nodes, and structural issues.
3. **Topological sort** determines execution order. A model node won't run before the split node that feeds it.
4. **Nodes execute sequentially** in dependency order. Each node receives the merged outputs of all its parent nodes as input.
5. **Results flow back** — metrics, charts, feature importance, model artifacts — all rendered in the UI.

The key design choice: **deep-merging parent outputs**. When a node has multiple parents (like a comparison node receiving metrics from two different evaluators), all parent outputs get merged into a single input dict. This is what makes branching pipelines possible without any special-case logic.

## The node system

Every ML operation is an "executor" — a single Python function that takes inputs, config, and returns outputs. The executor registry maps node types to functions:

```python
EXECUTORS = {
    "csv_upload": execute_csv_upload,
    "remove_nulls": execute_remove_nulls,
    "train_test_split": execute_train_test_split,
    "linear_regression": execute_linear_regression,
    "random_forest": execute_random_forest,
    "accuracy": execute_accuracy,
    "model_comparison": execute_model_comparison,
    ...
}
```

Adding a new node type is just writing one function and adding one line to this dict. The canvas, the runner, the validation — everything else picks it up automatically.

**Available nodes:**

| Category | Nodes | What they do |
|----------|-------|-------------|
| Input | CSV Upload, Sample Dataset | Load data (user files or built-in Iris/Housing) |
| Preprocessing | Remove Nulls, Min-Max Scaler | Clean and normalize data |
| Splitting | Train/Test Split | Configurable ratio and random state |
| Models | Linear Regression, Random Forest, XGBoost | Train with auto-detected problem type |
| Evaluation | Accuracy/Metrics | R², RMSE, MAE with charts |
| Comparison | Model Comparison | Rank N models, pick the best |

## Multi-model comparison

You can build branching pipelines that train multiple models in parallel, evaluate each one independently, and then converge into a comparison node:

```
                    ┌── Linear Regression ── Evaluator ──┐
Data → Clean → Split                                      → Comparison → Best Model
                    └── Random Forest ────── Evaluator ──┘
```

The comparison node aggregates metrics from all branches and ranks the models. This works because of the deep-merge approach — the runner doesn't care how many parents a node has.

## The canvas

The frontend uses React Flow to render the pipeline as an interactive graph. You can:

- Drag nodes from a sidebar palette onto the canvas
- Connect nodes by dragging between ports
- Configure each node (target column, test split ratio, hyperparameters) via a side panel
- See real-time status on each node during execution (idle → running → success/failed)
- View execution logs in a bottom console panel
- See a metrics dashboard with charts after the run completes

## Additional features

**AI Pipeline Generation** — Instead of building manually, you can type a natural language prompt like *"predict house prices with random forest"* and the system generates a complete pipeline on the canvas. Under the hood, Gemini returns a structured intent, and the backend deterministically maps it to valid nodes and edges. The AI never decides graph structure directly.

**AI Explainability** — A built-in panel that explains your pipeline step-by-step and lets you ask follow-up questions about what each node does. Useful if you're learning ML by building pipelines rather than reading documentation.

**Metrics Dashboard** — After execution, interactive Recharts visualizations show actual vs predicted scatter plots, feature importance bars, and model comparison leaderboards.

## Tech stack

- **Frontend**: React 19, Vite, React Flow, Tailwind CSS, Framer Motion, Recharts
- **Backend**: Node.js, Express, MongoDB, JWT auth
- **ML Engine**: Python, FastAPI, scikit-learn, XGBoost
- **AI**: Google Gemini (for generation and explainability features)

## Running locally

Three terminals:

```bash
# Backend (port 5000)
cd backend && npm install && node server.js

# ML Engine (port 5001)
cd ml-engine && pip install -r requirements.txt && python main.py

# Frontend (port 3000)
cd frontend && npm install && npm run dev
```

Create a `.env` in the backend directory — see `.env.example` for what's needed.

## Project structure

```
FlowML/
├── frontend/          # React app — canvas, nodes, config panels, charts
├── backend/           # Express API — auth, pipeline CRUD, AI endpoints
├── ml-engine/         # FastAPI — DAG engine, executors, model training
└── shared/            # Pipeline schema shared across services
```

## License

MIT
