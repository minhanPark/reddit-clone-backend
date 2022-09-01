import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import User from "../entities/User";

const userMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;
    console.log({ token });
    if (!token) return next();

    const { username }: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    const user = await User.findOneBy({ username });
    console.log({ user });
    if (!user) throw new Error("Unauthenticated");

    res.locals.user = user;
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: ":(" });
  }
};

export default userMiddleware;
