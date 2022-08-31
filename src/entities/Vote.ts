import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import Comment from "./Comment";
import BaseEntity from "./Entity";
import Post from "./Post";
import User from "./User";

@Entity("votes")
export default class Vote extends BaseEntity {
  @Column()
  value: number;

  @Column()
  username: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "username", referencedColumnName: "username" })
  user: User;

  @Column({ nullable: true })
  postId: number;

  @ManyToOne(() => Post)
  post: Post;

  @Column({ nullable: true })
  commentId: number;

  @ManyToOne(() => Comment)
  comment: Comment;
}
