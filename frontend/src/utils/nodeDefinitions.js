// Node definitions for the AutoFlow-ML pipeline builder
// Synced with shared/pipeline_schema.json

export const CATEGORIES = {
    input: {
        label: 'Data Sources',
        icon: 'Database',
        color: '#3b82f6'
    },
    prep: {
        label: 'Preparation',
        icon: 'Cpu',
        color: '#8b5cf6'
    },
    model: {
        label: 'ML Models',
        icon: 'Brain',
        color: '#f59e0b'
    },
    eval: {
        label: 'Analytics',
        icon: 'BarChart3',
        color: '#10b981'
    }
};

export const NODE_TYPES = {
    csv_upload: {
        id: 'csv_upload',
        label: 'CSV Dataset',
        category: 'input',
        description: 'Import custom CSV operational data',
        config: {
            fileId: { type: 'string', label: 'Dataset ID', required: true }
        },
        inputs: [],
        outputs: ['dataframe']
    },
    remove_nulls: {
        id: 'remove_nulls',
        label: 'Data Cleaner',
        category: 'prep',
        description: 'Auto-detect and handle missing values',
        config: {
            strategy: {
                type: 'select',
                label: 'Cleaning Mode',
                options: [
                    { label: 'Drop Corrupted', value: 'drop_rows' },
                    { label: 'Fill with Mean', value: 'fill_mean' }
                ],
                default: 'drop_rows'
            }
        },
        inputs: ['dataframe'],
        outputs: ['dataframe']
    },
    min_max_scaler: {
        id: 'min_max_scaler',
        label: 'Min-Max Scaler',
        category: 'prep',
        description: 'Normalize features to [0, 1] range',
        config: {},
        inputs: ['dataframe'],
        outputs: ['dataframe']
    },
    train_test_split: {
        id: 'train_test_split',
        label: 'Data Splitter',
        category: 'prep',
        description: 'Segment into Training and Validation sets',
        config: {
            test_size: { type: 'number', label: 'Validation Ratio', default: 0.2 },
            target_column: { type: 'string', label: 'Target Feature', required: true },
            random_state: { type: 'number', label: 'Deterministic Seed', default: 42 }
        },
        inputs: ['dataframe'],
        outputs: ['train_data', 'test_data']
    },
    linear_regression: {
        id: 'linear_regression',
        label: 'Linear Model',
        category: 'model',
        description: 'Standard Linear regression framework',
        config: {},
        inputs: ['train_data'],
        outputs: ['model']
    },
    xgboost: {
        id: 'xgboost',
        label: 'XGBoost Node',
        category: 'model',
        description: 'High-performance Gradient Boosting',
        config: {
            n_estimators: { type: 'number', label: 'Estimators', default: 100 },
            learning_rate: { type: 'number', label: 'Learning Rate', default: 0.1 },
            max_depth: { type: 'number', label: 'Max Depth', default: 6 }
        },
        inputs: ['train_data'],
        outputs: ['model']
    },
    accuracy: {
        id: 'accuracy',
        label: 'Model Evaluator',
        category: 'eval',
        description: 'Analyze precision and recall metrics',
        config: {},
        inputs: ['model', 'test_data'],
        outputs: ['metrics']
    }
};

export const PRO_FEATURES = [
    { name: 'GPU Training Cluster', icon: 'Zap' },
    { name: 'BigQuery Integration', icon: 'Cloud' },
];

export const FREE_TIER_LIMITS = {
    maxDatasetSizeMB: 10,
    maxRows: 50000,
    maxNodesPerWorkflow: 15,
    executionTimeoutSeconds: 60
};
