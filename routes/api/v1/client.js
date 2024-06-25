// routes/users.js
const express = require('express');
const authMiddleware = require('../../../middlewares/auth');
const Settings = require('../../../models/Settings');
const Leaderboard = require('../../../models/Leaderboard');
const router = express.Router();
const {z} = require('zod');
const {zod_validation_errors} = require("../../../utils/helper");


router.get('/settings', async (req, res) => {

    const _settings = {
        event_completed: await Settings._get('event_completed'),
    }

    res.json(_settings);

});


router.get('/games/leaderboard/:game', authMiddleware, async (req, res) => {

    const {game} = req.params;
    const game_types = ['pingpong', 'kiasu'];

    // validate with zod
    const leaderboardSchema = z.object({
        game: z.string().refine((val) => {
            return game_types.includes(val);
        }, 'Invalid game type'),
    });

    try {

        leaderboardSchema.parse(req.params);

        // get my position
        let my_rank = 0;

        // check if i have a record
        const im_in = await Leaderboard.findOne({user: req.user._id, game});

        if (im_in) {
            //     get sorted leaderboard
            const get_leaderboard = await Leaderboard.find({game})
                .populate('user', 'name')
                .sort({score: -1})
                .select("user score")
                .exec();

            my_rank = get_leaderboard.findIndex(entry => entry.user._id.toString() === req.user._id.toString()) + 1;
        }


        const _leaderboards = await Leaderboard.find({game})
            .populate('user', 'name')
            .sort({score: -1}).limit(3)
            .select("user score")
            .exec();

        const result = _leaderboards.map(entry => ({
            user: entry.user.name,
            score: entry.score
        }));

        res.json({my_rank: my_rank, result: result});

    } catch (error) {
        console.log(error)
        return res.status(422).json(zod_validation_errors(error));
    }

});

router.post('/games/leaderboard', authMiddleware, async (req, res) => {

    const {game, score} = req.body;

    const game_types = ['pingpong', 'kiasu'];

    // validate with zod
    const leaderboardSchema = z.object({
        game: z.string().refine((val) => {
            return game_types.includes(val);
        }, 'Invalid game type'),
        score: z.number({message: 'Invalid score'}),
    });

    try {
        leaderboardSchema.parse(req.body);
        const _leaderboard = await Leaderboard.updateOrCreate(req.user._id, game, score);
        res.json('success');

    } catch (error) {
        console.log(error)
        return res.status(422).json(zod_validation_errors(error));
    }


});


module.exports = router;