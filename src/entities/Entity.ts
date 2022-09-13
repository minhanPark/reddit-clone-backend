import { instanceToPlain } from "class-transformer";
import {
  BaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export default abstract class Entity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Expose한 부분을 가지고 오려면 해당 설정이 있어야 한다.
  toJSON() {
    return instanceToPlain(this);
  }
}
