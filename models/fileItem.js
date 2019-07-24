const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FileItemSchema = Schema({
  _id: Schema.Types.ObjectId,
  fileName: {
    type: String,
    required: true
  },
  files: {
    type: Schema.Types.ObjectId,
    ref: "Files"
  },
  bufferFile: {
    type: Buffer,
    required: true
  }
});

module.exports = FileItem = mongoose.model("FileItem", FileItemSchema);
