const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Users } = require("../models");

// 회원 가입 API

router.post("/signup", async (req, res) => {
  const { nickname, password, confirm } = req.body;

  // 닉네임 3자 이하 일 떄
  if (nickname.length < 3) {
    res.status(412).json({ errorMessage: "닉네임 형식이 일치하지 않습니다." });
    return;
  }

  // 닉네임 알파벳 대소문자(a~z, A~Z), 숫자(0~9)로 구성하기
  const nickNameRegex = /^[a-zA-Z0-9]+$/;
  if (!nickNameRegex.test(nickname)) {
    res.status(412).json({ errorMessage: "닉네임 형식이 일치하지 않습니다." });
    return;
  }

  // 닉네임 4자리 이상, 닉네임과 같은 값이 포함됬을 떄
  if (password.length < 4 || password.includes(nickname)) {
    res
      .status(412)
      .json({ errorMessage: "패스워드 형식이 일치하지 않습니다." });
    return;
  }

  // 비밀번호 일치
  if (password !== confirm) {
    res.status(412).json({ errorMessage: "패스워드가 일치하지 않습니다." });
    return;
  }

  const isExistNickName = await Users.findOne({ where: { nickname } });

  // 데이터베이스에 닉네임이 중복됬을때
  if (isExistNickName) {
    res.status(412).json({ errorMessage: "중복된 닉네임입니다." });
    return;
  }
  try {
    const user = new Users({ nickname, password });
    await user.save();
    return res.status(201).json({ message: "회원 가입에 성공하였습니다." });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ errorMessage: "요청한 데이터 형식이 올바르지 않습니다." });
    return;
  }
});

// 로그인 API 구현

router.post("/login", async (req, res) => {
  const { nickname, password } = req.body;
  // 닉네임에 해당하는 사용자가 DB에 존재하는지 검증
  const user = await Users.findOne({ where: { nickname } });
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
