/**
 * FlowML – AI Pipeline Generation Route
 * 
 * ARCHITECTURE:
 * 1. Gemini outputs INTENT only (problem type, input type, preferences)
 * 2. Backend is the SINGLE AUTHORITY of pipeline structure
 * 3. All node types come from CAPABILITIES registry — never from LLM
 * 4. Invalid LLM responses fall back to a safe default pipeline
 * 5. Supports multi-model comparison pipelines with branching DAG
 */

const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ─── STEP 1: Capability Registry (Single Source of Truth) ────────────────────

const CAPABILITIES = {
    inputs: ["csv_upload", "sample_dataset"],
    preprocessing: ["remove_nulls"],
    splitting: ["train_test_split"],
    models: ["linear_regression", "random_forest"],
    evaluation: ["accuracy"],
    comparison: ["model_comparison"]
};

// Flat set of ALL valid node types for quick lookup
const ALL_VALID_TYPES = new Set(
    Object.values(CAPABILITIES).flat()
);

// Valid enum values for LLM output validation
const VALID_PROBLEM_TYPES = ["regression", "classification"];
const VALID_INPUT_TYPES = CAPABILITIES.inputs;
const VALID_MODELS = CAPABILITIES.models;
const VALID_DATASET_NAMES = ["iris", "housing"];

// ─── Gemini Output Schema (Intent Only — supports multi-model) ───────────────

const SYSTEM_PROMPT = `You are a machine learning workflow planner.

Return ONLY valid JSON. No markdown. No explanations. No code blocks.

Output schema:

{
  "problem_type": "regression" | "classification",
  "input_type": "csv_upload" | "sample_dataset",
  "dataset_name": "iris" | "housing" | null,
  "include_preprocessing": true | false,
  "include_split": true | false,
  "models": ["linear_regression"] | ["random_forest"] | ["linear_regression", "random_forest"]
}

Rules:
- "models" is an array of 1 or 2 model names
- Valid models: "linear_regression", "random_forest"
- If the user wants to COMPARE models, include BOTH models in the array
- If the user mentions "compare", "which is better", "vs", "versus", or wants to try multiple models: include both models
- If the user mentions iris, flowers, species, classification: use "sample_dataset" with "iris"
- If the user mentions housing, house prices, california housing: use "sample_dataset" with "housing"
- If the user mentions uploading their own data, CSV, custom dataset: use "csv_upload" and set dataset_name to null
- If input_type is "sample_dataset", dataset_name MUST be "iris" or "housing"
- If input_type is "csv_upload", dataset_name MUST be null
- include_split should almost always be true (needed for train/test evaluation)
- For classification problems, prefer "random_forest" (single model) or both (comparison)
- For simple regression, prefer "linear_regression" (single model)
- For advanced regression, prefer "random_forest" (single model)
- If uncertain, default to: csv_upload, include_preprocessing true, include_split true, models ["linear_regression"], regression`;

// ─── Node Metadata for React Flow rendering ─────────────────────────────────

const NODE_METADATA = {
    csv_upload: { label: 'CSV Dataset', category: 'input', inputs: [], outputs: ['dataframe'] },
    sample_dataset: { label: 'Sample Dataset', category: 'input', inputs: [], outputs: ['dataframe'] },
    remove_nulls: { label: 'Data Cleaner', category: 'prep', inputs: ['dataframe'], outputs: ['dataframe'] },
    train_test_split: { label: 'Data Splitter', category: 'prep', inputs: ['dataframe'], outputs: ['train_data', 'test_data'] },
    linear_regression: { label: 'Linear Model', category: 'model', inputs: ['train_data'], outputs: ['model'] },
    random_forest: { label: 'Random Forest', category: 'model', inputs: ['train_data'], outputs: ['model'] },
    accuracy: { label: 'Model Evaluator', category: 'eval', inputs: ['model', 'test_data'], outputs: ['metrics'] },
    model_comparison: { label: 'Model Comparison', category: 'eval', inputs: ['metrics'], outputs: ['comparison_result'] }
};

// ─── Validation Layer ────────────────────────────────────────────────────────

function validateGeminiResponse(parsed) {
    if (!parsed || typeof parsed !== 'object') return false;

    // Validate problem_type
    if (!VALID_PROBLEM_TYPES.includes(parsed.problem_type)) return false;

    // Validate input_type
    if (!VALID_INPUT_TYPES.includes(parsed.input_type)) return false;

    // Validate dataset_name consistency
    if (parsed.input_type === 'sample_dataset') {
        if (!VALID_DATASET_NAMES.includes(parsed.dataset_name)) return false;
    } else if (parsed.input_type === 'csv_upload') {
        if (parsed.dataset_name && !VALID_DATASET_NAMES.includes(parsed.dataset_name)) return false;
    }

    // Validate booleans
    if (typeof parsed.include_preprocessing !== 'boolean') return false;
    if (typeof parsed.include_split !== 'boolean') return false;

    // Validate models array
    if (!Array.isArray(parsed.models) || parsed.models.length === 0) return false;
    if (parsed.models.some(m => !VALID_MODELS.includes(m))) return false;
    // Remove duplicates
    parsed.models = [...new Set(parsed.models)];
    if (parsed.models.length > VALID_MODELS.length) return false;

    return true;
}

// Safe fallback template (single-model regression with CSV)
const FALLBACK_INTENT = {
    problem_type: 'regression',
    input_type: 'csv_upload',
    dataset_name: null,
    include_preprocessing: true,
    include_split: true,
    models: ['linear_regression']
};

// ─── Deterministic Pipeline Construction ─────────────────────────────────────

function buildPipelineFromIntent(intent) {
    const isMultiModel = intent.models.length > 1;

    // Validate all models against registry
    const validModels = intent.models.filter(m => CAPABILITIES.models.includes(m));
    if (validModels.length === 0) {
        return buildPipelineFromIntent(FALLBACK_INTENT);
    }

    // For single model: use original linear pipeline
    // For multi-model: use branching pipeline
    return {
        intent,
        validModels,
        isMultiModel
    };
}

// ─── Build React Flow graph (supports linear and branching) ──────────────────

function buildReactFlowGraph(pipelineInfo) {
    const { intent, validModels, isMultiModel } = pipelineInfo;
    const nodes = [];
    const edges = [];
    const ts = Date.now();

    // Helper to create a node
    function addNode(type, config = {}, x = 300, y = 0, idSuffix = '') {
        const nodeId = `gen_${type}${idSuffix}_${ts}_${nodes.length}`;
        const meta = NODE_METADATA[type];
        if (!meta) return null;

        nodes.push({
            id: nodeId,
            type: 'custom',
            data: {
                nodeType: type,
                label: meta.label,
                category: meta.category,
                inputs: meta.inputs,
                outputs: meta.outputs,
                status: 'idle',
                config: config
            },
            position: { x, y }
        });
        return nodeId;
    }

    // Helper to add an edge
    function addEdge(sourceId, targetId, sourceHandle = 'val', targetHandle = 'val') {
        edges.push({
            id: `e-${sourceId}-${sourceHandle}-${targetId}-${targetHandle}`,
            source: sourceId,
            target: targetId,
            sourceHandle,
            targetHandle,
            animated: true
        });
    }

    let currentY = 100;
    const CENTER_X = 400;

    // ─── 1. Input node ───────────────────────────────────────────────────
    const inputConfig = intent.input_type === 'sample_dataset' && intent.dataset_name
        ? { dataset_name: intent.dataset_name }
        : {};
    const inputId = addNode(intent.input_type, inputConfig, CENTER_X, currentY);
    currentY += 150;

    let lastSharedId = inputId;
    let lastSharedOutput = 'dataframe';

    // ─── 2. Preprocessing (optional) ─────────────────────────────────────
    if (intent.include_preprocessing) {
        const prepId = addNode('remove_nulls', {}, CENTER_X, currentY);
        addEdge(lastSharedId, prepId, lastSharedOutput, 'dataframe');
        lastSharedId = prepId;
        lastSharedOutput = 'dataframe';
        currentY += 150;
    }

    // ─── 3. Train/Test Split ─────────────────────────────────────────────
    let splitId = null;
    if (intent.include_split) {
        splitId = addNode('train_test_split', {}, CENTER_X, currentY);
        addEdge(lastSharedId, splitId, lastSharedOutput, 'dataframe');
        lastSharedId = splitId;
        currentY += 150;
    }

    if (!isMultiModel) {
        // ─── SINGLE MODEL: Linear pipeline ───────────────────────────────
        const modelType = validModels[0];
        const modelId = addNode(modelType, {}, CENTER_X, currentY);
        addEdge(lastSharedId, modelId, 'train_data', 'train_data');
        currentY += 150;

        const evalId = addNode('accuracy', {}, CENTER_X, currentY);
        addEdge(modelId, evalId, 'model', 'model');
        if (splitId) {
            addEdge(splitId, evalId, 'test_data', 'test_data');
        }

    } else {
        // ─── MULTI-MODEL: Branching pipeline ─────────────────────────────
        const branchSpacing = 350;
        const totalModels = validModels.length;
        const startX = CENTER_X - ((totalModels - 1) * branchSpacing) / 2;

        const evalIds = [];

        validModels.forEach((modelType, idx) => {
            const branchX = startX + (idx * branchSpacing);
            const branchY = currentY;

            // Model node
            const modelId = addNode(modelType, {}, branchX, branchY, `_branch${idx}`);
            addEdge(lastSharedId, modelId, 'train_data', 'train_data');

            // Eval node for this model
            const evalId = addNode('accuracy', {}, branchX, branchY + 150, `_eval${idx}`);
            addEdge(modelId, evalId, 'model', 'model');
            if (splitId) {
                addEdge(splitId, evalId, 'test_data', 'test_data');
            }

            evalIds.push(evalId);
        });

        // Comparison node — converges all branches
        const compY = currentY + 350;
        const compId = addNode('model_comparison', { problem_type: intent.problem_type }, CENTER_X, compY);
        evalIds.forEach(evalId => {
            addEdge(evalId, compId, 'metrics', 'metrics');
        });
    }

    return { nodes, edges };
}

// ─── Main Route ──────────────────────────────────────────────────────────────

router.post('/', auth, async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required.' });
        }

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Server configuration error: Gemini API key missing.' });
        }

        // ─── Call Gemini ─────────────────────────────────────────────────
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

        const payload = {
            system_instruction: {
                parts: [{ text: SYSTEM_PROMPT }]
            },
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json"
            }
        };

        const response = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000
        });

        const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
            throw new Error('Empty response from Gemini');
        }

        // ─── Parse LLM response ─────────────────────────────────────────
        let parsedIntent;
        try {
            parsedIntent = JSON.parse(rawText.trim());
        } catch {
            const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            parsedIntent = JSON.parse(cleanText);
        }

        // ─── Validate strictly ──────────────────────────────────────────
        let intent;
        if (validateGeminiResponse(parsedIntent)) {
            intent = parsedIntent;
            console.log('✅ AI Intent validated:', JSON.stringify(intent));
        } else {
            console.warn('⚠️  Invalid AI response, using fallback. Raw:', JSON.stringify(parsedIntent));
            intent = { ...FALLBACK_INTENT };
        }

        // ─── Backend constructs pipeline deterministically ──────────────
        const pipelineInfo = buildPipelineFromIntent(intent);
        const { nodes, edges } = buildReactFlowGraph(pipelineInfo);

        // Free tier check
        if (nodes.length > 15) {
            return res.status(400).json({ error: 'Generated pipeline exceeds free tier limits (max 15 nodes).' });
        }

        res.json({
            nodes,
            edges,
            generation: {
                intent: intent,
                models: pipelineInfo.validModels,
                is_comparison: pipelineInfo.isMultiModel,
                validated: true
            }
        });

    } catch (err) {
        console.error('❌ AI Generation Error:', err.message);

        // ─── Fallback: always return a valid pipeline ────────────────────
        const pipelineInfo = buildPipelineFromIntent(FALLBACK_INTENT);
        const { nodes, edges } = buildReactFlowGraph(pipelineInfo);

        res.json({
            nodes,
            edges,
            generation: {
                intent: FALLBACK_INTENT,
                fallback: true,
                error: err.message
            }
        });
    }
});

module.exports = router;
