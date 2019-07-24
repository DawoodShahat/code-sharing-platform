const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubCategorySchema = Schema({
    _id: Schema.Types.ObjectId,
    sub_ctg_name: {
        type: String,
        required: true
    },
    files: [
        {
            type: Schema.Types.ObjectId,
            ref: "Files"
        }
    ],
    date_created: {
        type: Date,
        default: Date.now
    }
});

module.exports = SubCategory = mongoose.model("SubCategory", SubCategorySchema);

