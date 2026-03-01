"""
FlowML – Node Executors
Individual executor functions for each ML pipeline node type.
MVP set: csv_upload, remove_nulls, train_test_split, linear_regression, accuracy
"""

import os
import io
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
from sklearn.datasets import load_iris, fetch_california_housing





# ─── Input Nodes ──────────────────────────────────────────────────────────────

def execute_csv_upload(inputs, config, uploaded_files=None, run_id=None):
    """Load a CSV file that was uploaded by the user."""
    file_id = config.get("fileId", "")

    if uploaded_files and file_id in uploaded_files:
        file_path = uploaded_files[file_id]
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Uploaded file not found: {file_path}")
        df = pd.read_csv(file_path)
    elif "csv_content" in config:
        df = pd.read_csv(io.StringIO(config["csv_content"]))
    else:
        raise ValueError(f"No file uploaded or CSV content provided. please upload a dataset first. node_id='{run_id}'")

    # Enforce row limit
    max_rows = 10000
    if len(df) > max_rows:
        df = df.head(max_rows)

    return {
        "dataframe": df,
        "shape": list(df.shape),
        "columns": list(df.columns),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "preview": df.head(5).to_dict(orient="records")
    }


def execute_sample_dataset(inputs, config, uploaded_files=None, run_id=None):
    """Load a built-in sample dataset (iris or housing)."""
    dataset_name = config.get("dataset_name", "iris")

    if dataset_name == "iris":
        data = load_iris(as_frame=True)
        df = data.frame
        problem_type = "classification"
    elif dataset_name == "housing":
        data = fetch_california_housing(as_frame=True)
        df = data.frame
        problem_type = "regression"
    else:
        raise ValueError(f"Unsupported sample dataset: '{dataset_name}'. Supported: iris, housing")

    return {
        "dataframe": df,
        "shape": list(df.shape),
        "columns": list(df.columns),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "preview": df.head(5).to_dict(orient="records"),
        "problem_type": problem_type,
        "dataset_name": dataset_name
    }


# ─── Data Preparation Nodes ──────────────────────────────────────────────────

def execute_remove_nulls(inputs, config, uploaded_files=None, run_id=None):
    """Remove or fill null values in the dataframe."""
    df = inputs.get("dataframe")
    if df is None:
        raise ValueError("No dataframe input received")

    df = df.copy()
    strategy = config.get("strategy", "drop_rows")
    null_count_before = int(df.isnull().sum().sum())

    if strategy == "drop_rows":
        df = df.dropna()
    elif strategy == "fill_mean":
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())
        non_numeric = df.select_dtypes(exclude=[np.number]).columns
        df[non_numeric] = df[non_numeric].fillna(df[non_numeric].mode().iloc[0] if len(df[non_numeric].mode()) > 0 else "")
    elif strategy == "fill_median":
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
        non_numeric = df.select_dtypes(exclude=[np.number]).columns
        df[non_numeric] = df[non_numeric].fillna(df[non_numeric].mode().iloc[0] if len(df[non_numeric].mode()) > 0 else "")
    elif strategy == "fill_zero":
        df = df.fillna(0)
    else:
        df = df.dropna()

    null_count_after = int(df.isnull().sum().sum())

    return {
        "dataframe": df,
        "shape": list(df.shape),
        "columns": list(df.columns),
        "nulls_removed": null_count_before - null_count_after,
        "preview": df.head(5).to_dict(orient="records")
    }


def execute_min_max_scaler(inputs, config, uploaded_files=None, run_id=None):
    """Normalize numeric features to [0, 1] range."""
    from sklearn.preprocessing import MinMaxScaler
    df = inputs.get("dataframe")
    if df is None:
        raise ValueError("No dataframe input received")

    df = df.copy()
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    
    if not numeric_cols.empty:
        scaler = MinMaxScaler()
        df[numeric_cols] = scaler.fit_transform(df[numeric_cols])

    return {
        "dataframe": df,
        "shape": list(df.shape),
        "columns": list(df.columns),
        "scaled_columns": list(numeric_cols),
        "preview": df.head(5).to_dict(orient="records")
    }


def execute_train_test_split(inputs, config, uploaded_files=None, run_id=None):
    """Split dataframe into train and test sets."""
    df = inputs.get("dataframe")
    if df is None:
        raise ValueError("No dataframe input received")

    target_column = config.get("target_column", "")
    if not target_column or target_column not in df.columns:
        # Try to auto-select last column
        target_column = df.columns[-1]

    test_size = float(config.get("test_size", 0.2))
    random_state = int(config.get("random_state", 42))

    # Separate features and target
    X = df.drop(columns=[target_column])
    y = df[target_column]

    # Only keep numeric features for base demo
    X_numeric = X.select_dtypes(include=[np.number])
    if X_numeric.empty:
        raise ValueError("No numeric features found for model training")

    X_train, X_test, y_train, y_test = train_test_split(
        X_numeric, y, test_size=test_size, random_state=random_state
    )

    return {
        "train_data": {"X": X_train, "y": y_train},
        "test_data": {"X": X_test, "y": y_test},
        "target_column": target_column,
        "feature_columns": list(X_numeric.columns),
        "train_size": len(X_train),
        "test_size": len(X_test)
    }


# ─── Model Nodes ─────────────────────────────────────────────────────────────

def execute_linear_regression(inputs, config, uploaded_files=None, run_id=None):
    """Train a Linear Regression model."""
    import joblib
    train_data = inputs.get("train_data")
    if train_data is None:
        raise ValueError("No training data input received")

    X_train = train_data["X"]
    y_train = train_data["y"]

    # Convert target to numeric if needed
    if y_train.dtype == object:
        raise ValueError("Linear Regression requires a numeric target column.")

    model = LinearRegression()
    model.fit(X_train, y_train)

    # Save model
    model_saved = False
    if run_id:
        models_dir = os.path.join(os.path.dirname(__file__), "temp_models")
        os.makedirs(models_dir, exist_ok=True)
        model_path = os.path.join(models_dir, f"{run_id}_model.pkl")
        joblib.dump(model, model_path)
        model_saved = True

    feature_importance = {
        col: round(float(coef), 4)
        for col, coef in zip(X_train.columns, model.coef_)
    }

    return {
        "model": model,
        "model_type": "linear_regression",
        "feature_importance": feature_importance,
        "intercept": round(float(model.intercept_), 4),
        "feature_columns": list(X_train.columns),
        "model_saved": model_saved
    }


def execute_xgboost(inputs, config, uploaded_files=None, run_id=None):
    """Train an XGBoost regression model."""
    import joblib
    from xgboost import XGBRegressor
    train_data = inputs.get("train_data")
    if train_data is None:
        raise ValueError("No training data input received")

    X_train = train_data["X"]
    y_train = train_data["y"]

    n_estimators = int(config.get("n_estimators", 100))
    learning_rate = float(config.get("learning_rate", 0.1))
    max_depth = int(config.get("max_depth", 6))

    model = XGBRegressor(
        n_estimators=n_estimators,
        learning_rate=learning_rate,
        max_depth=max_depth,
        random_state=42
    )
    model.fit(X_train, y_train)

    model_saved = False
    if run_id:
        models_dir = os.path.join(os.path.dirname(__file__), "temp_models")
        os.makedirs(models_dir, exist_ok=True)
        model_path = os.path.join(models_dir, f"{run_id}_model.pkl")
        joblib.dump(model, model_path)
        model_saved = True

    # Get feature importance from XGBoost
    importances = model.feature_importances_
    feature_importance = {
        col: round(float(imp), 4)
        for col, imp in zip(X_train.columns, importances)
    }

    return {
        "model": model,
        "model_type": "xgboost",
        "feature_importance": feature_importance,
        "feature_columns": list(X_train.columns),
        "model_saved": model_saved
    }


def execute_random_forest(inputs, config, uploaded_files=None, run_id=None):
    """Train a Random Forest model (supports both regression and classification)."""
    import joblib
    train_data = inputs.get("train_data")
    if train_data is None:
        raise ValueError("No training data input received. Ensure a train_test_split node is connected.")

    X_train = train_data.get("X")
    y_train = train_data.get("y")

    if X_train is None or y_train is None:
        raise ValueError("X_train or y_train missing from training data. Check train_test_split output.")

    # ── Detect problem type: regression vs classification ──
    # If target is object/bool or integer with few unique values → classification
    # If target is float/continuous numeric → regression
    if y_train.dtype == object or y_train.dtype == bool:
        problem_type = "classification"
    elif pd.api.types.is_integer_dtype(y_train) and y_train.nunique() <= 20:
        problem_type = "classification"
    elif pd.api.types.is_float_dtype(y_train):
        problem_type = "regression"
    else:
        # Fallback: treat as regression for numeric, raise for unknown
        if pd.api.types.is_numeric_dtype(y_train):
            problem_type = "regression"
        else:
            raise ValueError(
                f"Cannot determine problem type for target dtype '{y_train.dtype}'. "
                "Expected numeric (regression) or categorical (classification) target."
            )

    # ── Hyperparameters from config ──
    n_estimators = int(config.get("n_estimators", 100))
    max_depth_raw = config.get("max_depth", None)
    max_depth = int(max_depth_raw) if max_depth_raw is not None and max_depth_raw != "" else None
    random_state = int(config.get("random_state", 42))

    # ── Initialize and train ──
    if problem_type == "classification":
        model = RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=max_depth,
            random_state=random_state
        )
    else:
        model = RandomForestRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            random_state=random_state
        )

    model.fit(X_train, y_train)

    # ── Save model artifact ──
    model_saved = False
    if run_id:
        models_dir = os.path.join(os.path.dirname(__file__), "temp_models")
        os.makedirs(models_dir, exist_ok=True)
        model_path = os.path.join(models_dir, f"{run_id}_model.pkl")
        joblib.dump(model, model_path)
        model_saved = True

    # ── Feature importance ──
    importances = model.feature_importances_
    feature_importance = {
        col: round(float(imp), 4)
        for col, imp in zip(X_train.columns, importances)
    }

    return {
        "model": model,
        "model_type": "random_forest",
        "problem_type": problem_type,
        "feature_importance": feature_importance,
        "feature_columns": list(X_train.columns),
        "n_estimators": n_estimators,
        "max_depth": max_depth,
        "model_saved": model_saved
    }


# ─── Evaluation Nodes ────────────────────────────────────────────────────────

def execute_accuracy(inputs, config, uploaded_files=None, run_id=None):
    """Evaluate model using R² score, RMSE, and MAE."""
    model = inputs.get("model")
    test_data = inputs.get("test_data")

    if model is None:
        raise ValueError("No model input received")
    if test_data is None:
        raise ValueError("No test data input received")

    X_test = test_data["X"]
    y_test = test_data["y"]

    # Make predictions
    y_pred = model.predict(X_test)

    # Calculate metrics
    r2 = round(float(r2_score(y_test, y_pred)), 4)
    rmse = round(float(np.sqrt(mean_squared_error(y_test, y_pred))), 4)
    mae = round(float(mean_absolute_error(y_test, y_pred)), 4)

    # Chart data
    y_test_list = y_test.tolist()
    y_pred_list = [round(float(v), 4) for v in y_pred.tolist()]
    chart_data = [
        {"index": i, "actual": round(float(a), 4), "predicted": round(float(p), 4)}
        for i, (a, p) in enumerate(zip(y_test_list[:50], y_pred_list[:50]))
    ]

    feature_importance = inputs.get("feature_importance", {})
    feature_chart = [
        {"feature": k, "importance": abs(v)}
        for k, v in feature_importance.items()
    ]

    model_type = inputs.get("model_type", "unknown")

    return {
        "metrics": {
            "r2_score": r2,
            "rmse": rmse,
            "mae": mae,
            "test_samples": len(y_test),
            "model_type": model_type
        },
        "chart_data": {
            "predictions": chart_data,
            "feature_importance": feature_chart
        },
        "preview": [
            {"actual": round(float(a), 4), "predicted": round(float(p), 4)}
            for a, p in zip(y_test_list[:10], y_pred_list[:10])
        ],
        # Store per-model metrics for comparison node aggregation
        "model_metrics": {
            model_type: {
                "r2_score": r2,
                "rmse": rmse,
                "mae": mae,
                "test_samples": len(y_test)
            }
        }
    }


# ─── Comparison Node ─────────────────────────────────────────────────────────

def execute_model_comparison(inputs, config, uploaded_files=None, run_id=None):
    """Compare metrics from multiple evaluation nodes and determine best model."""
    problem_type = config.get("problem_type", "regression")

    # Collect model_metrics from all parent eval nodes
    # The pipeline runner merges inputs from all parents;
    # if multiple parents have "model_metrics", they get merged as dicts
    model_metrics = inputs.get("model_metrics", {})

    # Also try to collect from top-level metrics (single eval parent fallback)
    if not model_metrics and "metrics" in inputs:
        mt = inputs["metrics"].get("model_type", "unknown")
        model_metrics[mt] = {
            "r2_score": inputs["metrics"].get("r2_score"),
            "rmse": inputs["metrics"].get("rmse"),
            "mae": inputs["metrics"].get("mae"),
            "test_samples": inputs["metrics"].get("test_samples")
        }

    if not model_metrics or len(model_metrics) == 0:
        raise ValueError("No model metrics received for comparison. Connect evaluation nodes.")

    # Determine comparison metric based on problem type
    if problem_type == "classification":
        comparison_metric = "r2_score"  # higher is better
        higher_is_better = True
    else:
        comparison_metric = "r2_score"  # higher is better for regression too
        higher_is_better = True

    # Build ranking
    rankings = []
    for model_name, metrics_data in model_metrics.items():
        score = metrics_data.get(comparison_metric, 0)
        if score is None:
            score = 0
        rankings.append({
            "model": model_name,
            "score": round(float(score), 4),
            "r2_score": round(float(metrics_data.get("r2_score", 0)), 4),
            "rmse": round(float(metrics_data.get("rmse", 0)), 4),
            "mae": round(float(metrics_data.get("mae", 0)), 4),
            "test_samples": metrics_data.get("test_samples", 0)
        })

    # Sort by score
    rankings.sort(key=lambda x: x["score"], reverse=higher_is_better)

    best_model = rankings[0]["model"] if rankings else "unknown"
    best_score = rankings[0]["score"] if rankings else 0

    # Mark best
    for i, r in enumerate(rankings):
        r["rank"] = i + 1
        r["is_best"] = (i == 0)

    comparison_result = {
        "best_model": best_model,
        "best_score": best_score,
        "comparison_metric": comparison_metric,
        "problem_type": problem_type,
        "rankings": rankings,
        "total_models": len(rankings)
    }

    return {
        "metrics": {
            "best_model": best_model,
            "best_score": best_score,
            "comparison_metric": comparison_metric,
            "model_type": "comparison",
            "total_models": len(rankings)
        },
        "comparison_result": comparison_result,
        "chart_data": {
            "model_comparison": rankings
        }
    }


# ─── Executor Registry ───────────────────────────────────────────────────────

EXECUTORS = {
    "csv_upload": execute_csv_upload,
    "sample_dataset": execute_sample_dataset,
    "remove_nulls": execute_remove_nulls,
    "min_max_scaler": execute_min_max_scaler,
    "train_test_split": execute_train_test_split,
    "linear_regression": execute_linear_regression,
    "xgboost": execute_xgboost,
    "random_forest": execute_random_forest,
    "accuracy": execute_accuracy,
    "model_comparison": execute_model_comparison,
}
