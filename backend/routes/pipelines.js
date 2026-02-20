const express = require('express');
const Pipeline = require('../models/Pipeline');
const auth = require('../middleware/auth');

const router = express.Router();

// All pipeline routes are protected
router.use(auth);

// GET /api/pipelines – List user's pipelines
router.get('/', async (req, res) => {
    try {
        const pipelines = await Pipeline.find({ userId: req.user.userId })
            .select('name description status createdAt updatedAt')
            .sort({ updatedAt: -1 });
        res.json({ pipelines });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch pipelines.' });
    }
});

// GET /api/pipelines/:id – Get single pipeline
router.get('/:id', async (req, res) => {
    try {
        const pipeline = await Pipeline.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });
        if (!pipeline) {
            return res.status(404).json({ error: 'Pipeline not found.' });
        }
        res.json({ pipeline });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch pipeline.' });
    }
});

// POST /api/pipelines – Save new pipeline
router.post('/', async (req, res) => {
    try {
        const { name, description, nodes, edges } = req.body;

        // Free tier: max 10 nodes
        if (nodes && nodes.length > 10) {
            return res.status(400).json({
                error: `Free plan allows max 10 nodes. You have ${nodes.length}.`
            });
        }

        const pipeline = new Pipeline({
            userId: req.user.userId,
            name: name || 'Untitled Pipeline',
            description: description || '',
            nodes: nodes || [],
            edges: edges || []
        });

        await pipeline.save();
        res.status(201).json({ pipeline });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save pipeline.' });
    }
});

// PUT /api/pipelines/:id – Update pipeline
router.put('/:id', async (req, res) => {
    try {
        const { name, description, nodes, edges, lastResults, status } = req.body;

        if (nodes && nodes.length > 10) {
            return res.status(400).json({
                error: `Free plan allows max 10 nodes. You have ${nodes.length}.`
            });
        }

        const pipeline = await Pipeline.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(nodes !== undefined && { nodes }),
                ...(edges !== undefined && { edges }),
                ...(lastResults !== undefined && { lastResults }),
                ...(status !== undefined && { status })
            },
            { new: true }
        );

        if (!pipeline) {
            return res.status(404).json({ error: 'Pipeline not found.' });
        }

        res.json({ pipeline });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update pipeline.' });
    }
});

// DELETE /api/pipelines/:id – Delete pipeline
router.delete('/:id', async (req, res) => {
    try {
        const pipeline = await Pipeline.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!pipeline) {
            return res.status(404).json({ error: 'Pipeline not found.' });
        }

        res.json({ message: 'Pipeline deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete pipeline.' });
    }
});

module.exports = router;
