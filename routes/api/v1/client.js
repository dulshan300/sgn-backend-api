// routes/users.js
const express = require('express');
const authMiddleware = require('../../../middlewares/auth');
const Settings = require('../../../models/Settings');
const router = express.Router();


router.get('/settings', async (req, res) => {

    const _settings = {
        event_completed: await Settings._get('event_completed'),
    }

    res.json(_settings);

});




module.exports = router;