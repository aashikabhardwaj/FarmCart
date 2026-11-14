const mongoose = require("mongoose");
const { Schema } = mongoose;


const rewardWalletSchema = new Schema({

    customer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    seller: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    points: {
        type: Number,
        default: 0
    }

},
{
    timestamps:true
});


module.exports = mongoose.model(
    "RewardWallet",
    rewardWalletSchema
);