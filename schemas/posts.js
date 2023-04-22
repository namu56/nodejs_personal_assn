const mongoose = require("mongoose");

const postsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

postsSchema.virtual("postId").get(function () {
  return this._id.toHexString();
});

postsSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Posts", postsSchema);
