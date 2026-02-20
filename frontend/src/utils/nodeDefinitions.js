// Node definitions for the FlowML pipeline builder
// Synced with shared/pipeline_schema.json

export const CATEGORIES = {
    input: {
        label: 'Input',
        icon: '📥',
        color: '#3b82f6'
    },
    prep: {
        label: 'Data Prep',
        icon: '🔧',
        color: '#8b5cf6'
    },
    model: {
        label: 'Models',
        icon: '🧠',
        color: '#f59e0b'
    },
    eval: {
        label: 'Evaluation',
        icon: '📊',
        color: '#10b981'
    }
};

export const NODE_TYPES = {
    csv_upload: {
        id: 'csv_upload',
        label: 'CSV Upload',
        category: 'input',
        icon: '📄',
        description: 'Upload a CSV dataset file',
        config: {
            fileId: { type: 'string', label: 'CSV File', required: true }
        },
        inputs: [],
        outputs: ['dataframe']
    },
    remove_nulls: {
        id: 'remove_nulls',
        label: 'Remove Nulls',
        category: 'prep',
        icon: '🧹',
        description: 'Handle missing values in data',
        config: {
            strategy: {
                type: 'select',
                label: 'Strategy',
                options: [
                    { label: 'Drop Rows', value: 'drop_rows' },
                    { label: 'Fill Mean', value: 'fill_mean' }
                ],
                default: 'drop_rows'
            }
        },
        inputs: ['dataframe'],
        outputs: ['dataframe']
    },
    train_test_split: {
        id: 'train_test_split',
        label: 'Train/Test Split',
        category: 'prep',
        icon: '✂️',
        description: 'Split data into training and test sets',
        config: {
            test_size: { type: 'number', label: 'Test Size', default: 0.2 },
            target_column: { type: 'string', label: 'Target Column', required: true },
            random_state: { type: 'number', label: 'Random State', default: 42 }
        },
        inputs: ['dataframe'],
        outputs: ['train_data', 'test_data']
    },
    linear_regression: {
        id: 'linear_regression',
        label: 'Linear Regression',
        category: 'model',
        icon: '📈',
        description: 'Fit a linear regression model',
        config: {},
        inputs: ['train_data'],
        outputs: ['model']
    },
    accuracy: {
        id: 'accuracy',
        label: 'Accuracy / R² Score',
        category: 'eval',
        icon: '🎯',
        description: 'Evaluate model performance',
        config: {},
        inputs: ['model', 'test_data'],
        outputs: ['metrics']
    }
};

export const PRO_FEATURES = [
    { name: 'GPU Training', icon: '⚡' },
    { name: 'Large Dataset Mode', icon: '💾' },
    { name: 'Parallel Execution', icon: '🔄' },
];

export const FREE_TIER_LIMITS = {
    maxDatasetSizeMB: 5,
    maxRows: 10000,
    maxNodesPerWorkflow: 10,
    executionTimeoutSeconds: 30
};
