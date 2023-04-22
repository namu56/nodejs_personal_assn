const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const User = require("../schemas/user.js");

// 로그인 API 구현

router.post("/login", async (req, res) => {
  const { nickname, password } = req.body;
  // 닉네임에 해당하는 사용자가 DB에 존재하는지 검증
  const user = await User.findOne({ nickname });
  // DB에 존재하지 않고, 패스워드가 틀리다면
  if (!user || user.password !== password) {
    res
      .status(412)
      .json({ errorMessage: "닉네임 또는 패스워드를 확인해주세요." });
    return;
  }
  try {
    // jWT 생성 후 Cookie 및 Body로 클라이언트에게 전달
    const token = jwt.sign({ userId: user.userId }, "secret-key");

    res.cookie("Authorization", `Bearer ${token}`);
    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(400).json({ errorMessage: "로그인에 실패하였습니다." });
    return;
  }
});

module.exports = router;
