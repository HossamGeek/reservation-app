/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionsEnum, CategoriesEnum } from 'src/libs/enums/permission.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Index('logging_created_at_idx', ['createdAt'])
@Index('logging_user_idx', ['userId'])
@Index('logging_category_idx', ['actionableEntity'])
@Entity({ name: 'logging' })
export class Logging {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', enum: CategoriesEnum })
  actionableEntity: CategoriesEnum;

  @Column({ type: 'varchar', length: 50, nullable: true })
  actionableId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  params: any | null;

  @Column({ type: 'jsonb', nullable: true })
  body: any | null;

  @Column({ type: 'varchar', enum: ActionsEnum })
  action: ActionsEnum;

  @Column({ type: 'varchar', length: 40, default: '' })
  slug: string;

  @Column({ type: 'varchar', length: 45 })
  ip: string;

  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'boolean', default: false })
  authorized: boolean;

  @CreateDateColumn({ name: 'created_at', nullable: true })
  public createdAt: Date;
}
