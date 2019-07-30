const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FilesSchema = Schema({
  _id: Schema.Types.ObjectId,
  ctg_name: {
    type: Schema.Types.ObjectId,
    ref: "Category"
  },
  isConfirmed: {
    type: Boolean,
    default: false
  },
  author: {
    type: String,
    required: true
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  subCtg: {
    type: Schema.Types.ObjectId,
    ref: "SubCategory"
  },
  fileItems: [
    {
      type: Schema.Types.ObjectId,
      ref: "FileItem"
    }
  ],
  keywords: {
    type: [String],
    default: []
  }
});

module.exports = Files = mongoose.model("Files", FilesSchema);
