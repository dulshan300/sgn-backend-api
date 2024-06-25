const {default: mongoose} = require("mongoose");

const leaderBoardSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    game: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    }
});

leaderBoardSchema.statics.updateOrCreate = async function (userId, game, score) {
    try {
        // Find a document with the specified user and game
        let leaderboardEntry = await this.findOne({user: userId, game});

        if (leaderboardEntry) {
            // If found, update the score
            if (score < leaderboardEntry.score) return leaderboardEntry;
            leaderboardEntry.score = score;
            await leaderboardEntry.save();
        } else {
            // If not found, create a new document
            leaderboardEntry = await this.create({user: userId, game, score});
        }
        return leaderboardEntry;
    } catch (error) {
        throw error;
    }
};

const Leaderboard = mongoose.model('Leaderboard', leaderBoardSchema);

module.exports = Leaderboard;