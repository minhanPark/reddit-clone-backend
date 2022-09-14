import { Router, Request, Response } from "express";
import Post from "../entities/Post";
import Sub from "../entities/Sub";
import authMiddleware from "../middlewares/auth";
import userMiddleware from "../middlewares/user";

const router = Router();

const createPost = async (req: Request, res: Response) => {
    const {title, body, sub} = req.body;
    if(title.trim() === "") {
        return res.status(400).json({error: "제목은 비워둘 수 없습니다."});
    }

    const user = res.locals.user;

    try {
        const subRecord = await Sub.findOneByOrFail({name: sub});

        const post = new Post();
        post.title = title;
        post.body = body;
        post.user = user;
        post.sub = subRecord;

        await post.save();
        
        return res.json(post);
    } catch(error){
        console.error(error);
        return res.status(500).json({error: "문제가 발생했습니다."})
    }
};

router.post("/", userMiddleware, authMiddleware, createPost)

export default router;