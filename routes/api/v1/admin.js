// routes/users.js
const express = require('express');
const authMiddleware = require('../../../middlewares/auth');
const Settings = require('../../../models/Settings');
const {default: axios} = require('axios');
const router = express.Router();

// Update settings
router.post('/settings', async (req, res) => {

    const {settings} = req.body;

    const out = {};

    if (!settings) return res.json(out);

    for (const k of settings) {

        out[k] = await Settings._get(k);
    }

    res.json(out);
});


// Update settings
router.put('/settings', async (req, res) => {

    const {settings} = req.body;

    // update Settings

    for (const s of settings) {

        const key = Object.keys(s)[0];

        const value = Object.values(s)[0];

        await Settings._set(key, value);
    }

    res.json({message: 'Settings updated'});

});


module.exports = router;
