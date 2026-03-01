"""
FlowML – Pipeline Runner
Handles DAG validation, topological sorting, and sequential node execution.
"""

import time
from collections import deque


def validate_dag(nodes, edges):
    """Validate that the graph has no cycles (is a valid DAG)."""
    adj = {}
    in_degree = {}

    for node in nodes:
        node_id = node["id"]
        adj[node_id] = []
        in_degree[node_id] = 0

    for edge in edges:
        source = edge["source"]
        target = edge["target"]
        if source not in adj:
            adj[source] = []
        adj[source].append(target)
        in_degree[target] = in_degree.get(target, 0) + 1

    queue = deque([n for n in in_degree if in_degree[n] == 0])
    visited = 0

    while queue:
        current = queue.popleft()
        visited += 1
        for neighbor in adj.get(current, []):
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if visited != len(nodes):
        return False, "Cycle detected in pipeline graph"
    return True, None


def topological_sort(nodes, edges):
    """Return nodes in topological execution order."""
    adj = {}
    in_degree = {}

    for node in nodes:
        node_id = node["id"]
        adj[node_id] = []
        in_degree[node_id] = 0

    for edge in edges:
        source = edge["source"]
        target = edge["target"]
        adj[source].append(target)
        in_degree[target] = in_degree.get(target, 0) + 1

    queue = deque([n for n in in_degree if in_degree[n] == 0])
    order = []

    while queue:
        current = queue.popleft()
        order.append(current)
        for neighbor in adj[current]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return order


def run_pipeline(nodes, edges, executors, uploaded_files=None, timeout=30):
    """
    Execute the pipeline:
    1. Validate DAG
    2. Topological sort
    3. Execute each node in order
    4. Track states and collect results
    """
    is_valid, error = validate_dag(nodes, edges)
    if not is_valid:
        return {
            "success": False,
            "error": error,
            "node_states": {},
            "logs": [{"level": "error", "message": error, "timestamp": time.time()}],
            "results": {}
        }

    execution_order = topological_sort(nodes, edges)

    node_map = {n["id"]: n for n in nodes}

    # Build adjacency for finding parent outputs
    parent_map = {}
    for edge in edges:
        target = edge["target"]
        source = edge["source"]
        if target not in parent_map:
            parent_map[target] = []
        parent_map[target].append(source)

    run_id = f"run_{int(time.time())}"
    node_states = {n["id"]: "idle" for n in nodes}
    node_outputs = {}
    logs = []
    results = {}
    start_time = time.time()
    
    # Track if a model was generated
    model_file_id = None

    logs.append({
        "level": "info",
        "message": f"Pipeline execution started (ID: {run_id}). {len(nodes)} nodes to execute.",
        "timestamp": time.time()
    })

    for node_id in execution_order:
        # ... exists ...
        elapsed = time.time() - start_time
        if elapsed > timeout:
            # ... exists ...
            return {
                "success": False,
                "error": "Execution timeout exceeded",
                "node_states": node_states,
                "logs": logs,
                "results": results
            }

        node = node_map[node_id]
        node_type = node.get("data", {}).get("nodeType", node.get("type", "unknown"))
        config = node.get("data", {}).get("config", {})

        # Gather inputs from parent nodes
        parent_ids = parent_map.get(node_id, [])
        inputs = {}
        for pid in parent_ids:
            if pid in node_outputs:
                for key, value in node_outputs[pid].items():
                    # Deep-merge dict values (e.g. model_metrics from multiple eval nodes)
                    if key in inputs and isinstance(inputs[key], dict) and isinstance(value, dict):
                        inputs[key] = {**inputs[key], **value}
                    else:
                        inputs[key] = value

        node_states[node_id] = "running"
        logs.append({
            "level": "info",
            "message": f"Executing node '{node.get('data', {}).get('label', node_id)}' ({node_type})",
            "timestamp": time.time()
        })

        try:
            executor_fn = executors.get(node_type)
            if executor_fn is None:
                raise ValueError(f"No executor found for node type: {node_type}")

            # Pass run_id to executors so they can save persistent artifacts
            output = executor_fn(inputs, config, uploaded_files, run_id=run_id)
            node_outputs[node_id] = output
            node_states[node_id] = "success"

            # Check if this executor produced a downloadable model
            if output.get("model_saved"):
                model_file_id = run_id

            # Collect metrics/results from evaluation nodes
            if "metrics" in output:
                results[node_id] = output["metrics"]
            if "chart_data" in output:
                results[f"{node_id}_chart"] = output["chart_data"]
            if "comparison_result" in output:
                results[f"{node_id}_comparison"] = output["comparison_result"]

            logs.append({
                "level": "success",
                "message": f"Node '{node.get('data', {}).get('label', node_id)}' completed successfully",
                "timestamp": time.time()
            })

        except Exception as e:
            node_states[node_id] = "failed"
            logs.append({
                "level": "error",
                "message": f"Node '{node.get('data', {}).get('label', node_id)}' failed: {str(e)}",
                "timestamp": time.time()
            })
            return {
                "success": False,
                "error": str(e),
                "node_states": node_states,
                "logs": logs,
                "results": results
            }

    total_time = round(time.time() - start_time, 2)
    logs.append({
        "level": "success",
        "message": f"Pipeline execution completed in {total_time}s",
        "timestamp": time.time()
    })

    return {
        "success": True,
        "error": None,
        "node_states": node_states,
        "logs": logs,
        "results": results,
        "execution_time": total_time,
        "model_download_available": model_file_id is not None,
        "model_file_id": model_file_id
    }
