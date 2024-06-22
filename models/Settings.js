const { default: mongoose, Mongoose } = require("mongoose");


const settingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
    }
});


settingSchema.statics._set = async function (key, value) {
    // add new or update existing
    const existingSetting = await this.findOne({ key });

    if (existingSetting) {
        // Update the existing setting
        existingSetting.value = value;
        await existingSetting.save();
    } else {
        // Add a new setting
        const newSetting = new this({ key, value });
        await newSetting.save();
    }

};

settingSchema.statics._get = async function (key, def = false) {
    const setting = await this.findOne({ key });

    if (setting) {
        return setting.value;
    } else {
        return def;
    }
};


const Settings = mongoose.model('Settings', settingSchema);
module.exports = Settings;