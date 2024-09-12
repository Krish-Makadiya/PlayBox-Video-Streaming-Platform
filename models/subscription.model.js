const mongoose = require("mongoose");

const schema = new mongoose.Schema(
    {
        subscriber: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        channel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {timestamps: true}
);

exports.module = mongoose.model("Subscription", schema);
