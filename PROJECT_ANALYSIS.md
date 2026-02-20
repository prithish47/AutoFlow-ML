# FlowML Project Analysis & Documentation

This document provides a comprehensive overview of the **FlowML** architecture, features, and technical details. Use this as a source of truth for understanding the system's capabilities.

## 1. System Overview
FlowML is a professional, enterprise-grade no-code platform for building and executing machine learning pipelines. It features a modern visual builder where users can connect data sources, processing steps, and models to create automated workflows.

## 2. Technical Stack
### Frontend (The Visual Architect)
- **Framework**: React 19 (Vite)
- **Canvas Engine**: @xyflow/react (React Flow v12)
- **Styling**: Tailwind CSS v4 (with custom design system & theme tokens)
- **State Management**: React Context API (`AuthContext`, `PipelineContext`)
- **Animations**: Transition-based smooth UI (planned: Framer Motion)

### Backend (The Orchestrator)
- **Runtime**: Node.js (Express)
- **Database**: MongoDB (Pipeline & User persistence)
- **Authentication**: JWT-based secure auth
- **Communication**: Reverse proxies requests to the ML Engine

### ML Engine (The Execution Core)
- **Language**: Python 3.x
- **Server**: FastAPI / Uvicorn
- **Logic**: DAG-based topological execution engine
- **Libraries**: Pandas, Scikit-learn

---

## 3. UI Features & Aesthetic
The UI is inspired by the **Linear.app** design language:
- **Design Tokens**: Precise neutral palette (Zinc/Slate), high-contrast text, and subtle borders.
- **Typography**: Inter font family with light weights (400-600) for a breathable feel.
- **Canvas Components**: 
  - **Draggable MiniMap**: Can be moved anywhere to avoid blocking node configuration.
  - **Floating Controls**: Styled as "islands" for a clean look.
  - **Vignette Canvas**: Subtle focus-driven background styling.
- **Interactive Panels**:
  - **Resizable Bottom Panel**: Horizontally split area for logs and metrics that can be dragged upwards.
  - **Conditional Sidebar**: Left-side block library and Right-side property editor.

---

## 4. Pipeline Logic & Features
### Node Workflow Categories
1.  **Input**:
    *   `CSV Upload`: Supports local file uploads and sample datasets (Iris, Tips).
2.  **Data Prep**:
    *   `Remove Nulls`: Strategies include "Drop Rows" and "Fill Mean".
    *   `Train/Test Split`: Configurable test size, target column, and random seed.
3.  **Models**:
    *   `Linear Regression`: Baseline predictive modeling.
4.  **Evaluation**:
    *   `Accuracy / R² Score`: Performance metrics collection.

### Execution Engine
- **DAG Validation**: Automatically detects and prevents circular connections.
- **Topological Sorting**: Determines the correct sequence of execution based on dependencies.
- **Real-Time Logs**: Streaming updates from the Python engine to the frontend Console.
- **Status Indicators**: Visual feedback (idle, running, success, failed) on every node.

---

## 5. Security & Business Logic
- **Authorization**: Secure routes for pipeline saving and execution.
- **Free Tier Constraints**:
  - Max 10 nodes per pipeline.
  - Max dataset size: 5MB.
  - Execution timeout: 30 seconds per run.
- **Pipeline Persistence**: Pipelines are stored in MongoDB with versioned IDs for easy retrieval.

---

## 6. Project Structure
```bash
/
├── backend/            # Express.js API & Database models
├── frontend/           # React.js SPA (Vite + React Flow)
│   └── src/
│       ├── components/ # Individual UI atoms & molecules
│       ├── context/    # Global state (Auth/Pipeline)
│       ├── pages/      # Root route components
│       └── utils/      # APIs & Node definitions
├── ml-engine/          # Python execution service
│   ├── executors.py    # Logic for individual node types
│   └── pipeline_runner.py # Graph traversal logic
└── shared/             # Shared schemas & JSON configs
```

## 7. Minute Details
- **Node Handles**: Precision-styled with SVG filters for better visibility.
- **Auto-Sync**: Frontend `nodeDefinitions.js` is kept in sync with the `ml-engine` capability set.
- **Onboarding**: A custom `Onboarding` component allows users to jump-start with template flows.
- **Edge UI**: Animated "marching ants" flow during active execution state.
