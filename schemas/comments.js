const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    content: {
      type: String,
      require: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Posts",
      requried: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comments", commentsSchema);
