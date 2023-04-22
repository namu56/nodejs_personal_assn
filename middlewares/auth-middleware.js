const jwt = require("jsonwebtoken");
const User = require("../schemas/user.js");

// 사용자 인증 미들웨어 구현

module.exports = async (req, res, next) => {
  const { Authorization } = req.cookies;

  const [authType, authToken] = (Authorization ?? "").split(" ");

  // authType === Bearer 값인지 확인
  // authToken 검증
  if (authType !== "Bearer" || !authToken) {
    res.status(400).json({ errorMessage: "로그인이 필요한 기능입니다." });
    return;
  }

  try {
    const { userId } = jwt.verify(authToken, "secret-key");
    const user = await User.findById(userId);
    res.locals.user = user;
    next();
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ errorMessage: "전달된 쿠키에서 오류가 발생하였습니다다." });
    return;
  }
};
