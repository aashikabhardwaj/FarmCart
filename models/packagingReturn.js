const mongoose = require("mongoose");
const { Schema } = mongoose;

const packagingReturnSchema = new Schema({

    order: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },

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

    packagingType: {
        type: String,
        enum: [
            // Farmer
        "Wooden Box",
        "Glass Bottle",
        "Plastic Crate",
        "Cloth Bag",
        "Other",

        // Retailer
        "Paper Box",
        "Paper Wrap",
        "Jute Bag",
        "Other Eco Packaging"
        ],
        required: true
    },

    condition: {
        type: String,
        enum: [
            "Excellent",
            "Good",
            "Damaged"
        ],
        required: true
    },

    decision: {
        type: String,
        enum: [
            "Keep",
            "Return"
        ],
        default: "Return"
    },

    status: {
        type: String,
        enum: [
            "Pending",
            "Received",
            "Approved",
            "Rejected",
            "Kept"
        ],
        default: "Pending"
    },

    customerImage: {
        type: String,
        default: ""
     },

    customerComment: {
        type: String,
        default: ""
    },

    rewardPoints: {
        type: Number,
        default: 0
    }

},
{
    timestamps: true
});

module.exports = mongoose.model(
    "PackagingReturn",
    packagingReturnSchema
);