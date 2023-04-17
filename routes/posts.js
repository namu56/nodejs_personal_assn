const express = require("express");
const router = express.Router();

const Posts = require("../schemas/posts");

// 게시글 작성

router.post("/posts", async (req, res) => {
  const { user, password, title, content } = req.body;

  const createdPosts = await Posts.create({
    user,
    password,
    title,
    content,
  });
  res.status(201).json({ message: "게시글을 생성하였습니다." });
});

// 게시글 조회

router.get("/posts", async (req, res) => {
  const posts = await Posts.find({});
  res.json({ posts });
});
module.exports = router;
