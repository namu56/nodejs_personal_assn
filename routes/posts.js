const express = require("express");
const router = express.Router();

const Posts = require("../schemas/posts");

// 게시글 작성

router.post("/posts", async (req, res) => {
  const { user, password, title, content } = req.body;
  console.log(user, password, title, content);
  if (!user || !password || !title || !content) {
    return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다" });
  }
  await Posts.create({
    user,
    password,
    title,
    content,
  });
  res.status(201).json({ message: "게시글을 생성하였습니다." });
});

// 게시글 조회

router.get("/posts", async (req, res) => {
  try {
    const posts = await Posts.find({}).select("user title createdAt ").sort({
      createdAt: -1,
    });
    console.log(posts);
    let newPosts = [];
    posts.forEach((post) => {
      let obj = {
        postId: post._id.toString(),
        user: post.user,
        title: post.title,
        createdAt: post.createdAt,
      };
      console.log(obj);
      newPosts.push(obj);
    });

    res.status(200).json({ newPosts });
  } catch (err) {
    console.error(err);
    res.status(400).json({ mesage: "데이터 형식이 올바르지 않습니다." });
  }
});
module.exports = router;
