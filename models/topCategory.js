const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TopCategorySchema = Schema({
  _id: Schema.Types.ObjectId,
  top_ctg_name: {
    type: String,
    required: true
  },
  sub_categories: [
    {
      type: Schema.Types.ObjectId,
      ref: "SubCategory"
    }
  ],
  date_created: {
    type: Date,
    default: Date.now
  }
});

module.exports = TopCategory = mongoose.model("TopCategory", TopCategorySchema);
