import { Request, Response, NextFunction } from "express";
import User from "../entities/User";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user: User | undefined = res.locals.user;
    if (!user) throw new Error("Unauthenticated");
    return next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: "Unauthenticated" });
  }
};

export default authMiddleware;
