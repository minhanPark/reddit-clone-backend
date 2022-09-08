import { isEmpty, validate } from "class-validator";
import { Router, Request, Response } from "express";
import User from "../entities/User";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import * as cookie from "cookie";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";

const mapError = (errors: Object[]) => {
  return errors.reduce((prev: any, err: any) => {
    prev[err.property] = Object.entries(err.constraints)[0][1];
    return prev;
  }, {});
};

const me = async (_: Request, res: Response) => {
  return res.json(res.locals.user);
};

const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  try {
    let errors: any = {};

    const emailUser = await User.findOneBy({ email });
    const usernameUser = await User.findOneBy({ username });

    if (emailUser) errors.email = "이미 해당 이메일 주소가 사용 중입니다.";
    if (usernameUser) errors.username = "이미 해당 이름이 사용 중입니다.";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const user = new User();
    user.email = email;
    user.username = username;
    user.password = password;

    errors = await validate(user);
    if (errors.length > 0) return res.status(400).json(mapError(errors));

    await user.save();
    return res.json(user);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e });
  }
};

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    let errors: any = {};
    if (isEmpty(username))
      errors.username = "사용자 이름은 비워둘 수 없습니다.";
    if (isEmpty(password)) errors.password = "비밀번호를 채워주세요.";
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const user = await User.findOneBy({ username });

    if (!user)
      return res.status(404).json({ username: "등록되지 않은 사용자 입니다." });

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ password: "비밀번호가 잘못되었습니다." });
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET as string);
    res.set(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })
    );
    // httpOnly 옵션
    // 이 옵션은 자바스크립트 같은 클라이언트 측 스크립트가 쿠키를 사용할 수 없게 합니다. document.cookie를 통해 쿠키를 볼 수도 없고 조작할 수도 없습니다.
    // secure
    // secure는 https 연결에서만 쿠키를 사용할 수 있게 합니다.
    // samesite
    // 요청이 외부사이트에서 일어날 때, 브라우저가 쿠키를 보내지 못하도록 막아줍니다. xsrf 공격을 막는데 유용합니다.
    // expires/max-age
    // 쿠키의 만료시간을 정해줍니다. 이 옵션이 없으면 브라우저가 닫힐 때 쿠키도 가팅 삭제됩니다.
    return res.json({ user, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};

const router = Router();
router.get("/me", userMiddleware, authMiddleware, me);
router.post("/register", register);
router.post("/login", login);

export default router;
