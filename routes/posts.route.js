const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware.js");
const { Op } = require("sequelize");
const { Posts } = require("../models");
const { Users } = require("../models");

// 게시글 작성 API

router.post("/posts", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { title, content } = req.body;

  // 데이터가 정상적으로 전달되지 않는 경우
  if (!title || !content) {
    res.status(412).json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
    return;
  }
  // title의 형식이 비정상적인 겨우
  if (typeof title !== "string") {
    res
      .status(412)
      .json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
    return;
  }
  // content의 형식이 비정상적인 경우
  if (typeof content !== "string") {
    res
      .status(412)
      .json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
    return;
  }
  try {
    await Posts.create({
      UserId: userId,
      title,
      content,
    });
    console.log(Posts);
    return res.status(201).json({ message: "게시글 작성에 성공하였습니다." });
  } catch (error) {
    console.error(error);
    res.status(400).json({ errorMessage: "게시글 작성에 실패하였습니다." });
    return;
  }
});

// 전체 게시글 목록 조회

router.get("/posts", async (req, res) => {
  try {
    const AllPosts = await Posts.findAll({
      attributes: ["postId", "UserId", "title", "createdAt", "updatedAt"],
      include: [
        {
          model: Users,
          attributes: ["nickname"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    const posts = AllPosts.map((item) => {
      return {
        postId: item.postId,
        userId: item.UserId,
        nickname: item.User.nickname,
        title: item.title,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });
    return res.status(200).json({ posts });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
    return;
  }
});

// 게시글 상세 조회
// 제목, 작성자명, 작성 날짜, 작성 내용 조회

router.get("/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const targetedPost = await Posts.findOne({
      attributes: [
        "postId",
        "UserId",
        "title",
        "content",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: Users,
          attributes: ["nickname"],
        },
      ],
      where: { postId },
    });
    const post = {
      postId: targetedPost.postId,
      userId: targetedPost.UserId,
      nickname: targetedPost.User.nickname,
      title: targetedPost.title,
      content: targetedPost.content,
      createdAt: targetedPost.createdAt,
      updatedAt: targetedPost.updatedAt,
    };
    return res.status(200).json({ post });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: "게시글 조회에 실패하였습니다." });
    return;
  }
});

//게시글 수정 API

router.put("/posts/:postId", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;
  const { title, content } = req.body;

  if (!title || !content) {
    res.status(412).json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
    return;
  }

  if (typeof title !== "string") {
    res
      .status(412)
      .json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
    return;
  }

  if (typeof content !== "string") {
    res
      .status(412)
      .json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
    return;
  }
  try {
    const post = await Posts.findOne({ where: { UserId: userId, postId } });

    if (!post) {
      res
        .status(404)
        .json({ errorMessage: "게시글이 정상적으로 수정되지 않았습니다." });
      return;
    }
    if (userId !== post.UserId) {
      res
        .status(403)
        .json({ errorMessage: "게시글의 수정의 권한이 존재하지 않습니다." });
      return;
    }
    await Posts.update(
      { title, content },
      {
        where: { postId },
      }
    );
    return res.json({ message: "게시글을 수정하였습니다." });
  } catch (error) {
    console.error(error);
    res.status(400).json({ errorMessage: "게시글 수정에 실패하였습니다." });
    return;
  }
});

// 게시글 삭제 API

router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;

  try {
    const post = await Posts.findOne({ where: { UserId: userId, postId } });

    if (!post) {
      res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
      return;
    }
    if (userId !== post.UserId) {
      res
        .status(403)
        .json({ errorMessage: "게시글의 삭제 권한이 존재하지 않습니다." });
      return;
    }
    await Posts.destroy({ where: { postId } });
    return res.json({ message: "게시글을 삭제하였습니다." });
  } catch (error) {
    console.error(error);
    res.status(400).json({ errorMessage: "게시글 작성에 실패하였습니다." });
    return;
  }
});

module.exports = router;
