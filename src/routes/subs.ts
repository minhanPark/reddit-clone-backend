import { isEmpty } from "class-validator";
import { Router, Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import Sub from "../entities/Sub";
import User from "../entities/User";
import authMiddleware from "../middlewares/auth";
import userMiddleware from "../middlewares/user";

const router = Router();

const createSub = async (req: Request, res: Response, next: NextFunction) => {
  const { name, title, description } = req.body;

  try {
    let errors: any = {};
    if (isEmpty(name)) errors.name = "이름을 입력해주세요.";
    if (isEmpty(title)) errors.title = "타이틀을 입력해주세요.";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const sub = await AppDataSource.getRepository(Sub)
      .createQueryBuilder("sub")
      .where("lower(sub.name) = :name", { name: name.toLowerCase() })
      .getOne();

    if (sub) errors.name = "Sub가 이미 존재합니다.";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }

  try {
    const user: User = res.locals.user;

    const sub = new Sub();
    sub.name = name;
    sub.description = description;
    sub.title = title;
    sub.user = user;

    await sub.save();
    return res.json(sub);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "문제가 발생했습니다." });
  }
};

router.post("/", userMiddleware, authMiddleware, createSub);

export default router;
