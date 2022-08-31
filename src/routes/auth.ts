import { isEmpty, validate } from "class-validator";
import { Router, Request, Response } from "express";
import User from "../entities/User";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import * as cookie from "cookie";

const mapError = (errors: Object[]) => {
  return errors.reduce((prev: any, err: any) => {
    prev[err.property] = Object.entries(err.constraints)[0][1];
    return prev;
  }, {});
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
    res.set("Set-Cookie", cookie.serialize("token", token));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};

const router = Router();
router.post("/register", register);
router.post("/login", login);

export default router;
