const mongoose = require("mongoose");
const schema = mongoose.Schema;

const activitySchema = schema({
  title: {
    type: String,
    required: true,
    minlength: 5,
  },
  description: {
    type: String,
    required: true,
    minlength: 20,
  },
  author: {
    type: String,
  },
  creationDate: {
    type: Date,
    default: new Date(Date.now()),
  },
},
  { timestamps: true }
);

module.exports = mongoose.model("Article", activitySchema);
