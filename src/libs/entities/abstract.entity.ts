import { Exclude, Expose } from 'class-transformer';
import { format } from 'date-fns';
import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Exclude()
  @CreateDateColumn({ name: 'createdAt', nullable: true })
  public createdAt: Date;

  @Exclude()
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updatedAt: Date;

  @Expose({ name: 'createdAt' })
  getCreatedAt() {
    if (!this.createdAt) {
      return undefined;
    }
    return format(new Date(this.createdAt), 'dd MMMM, yyyy HH:mm:ss');
  }

  @Expose({ name: 'updatedAt' })
  getUpdatedAt() {
    if (!this.updatedAt) {
      return undefined;
    }
    return format(new Date(this.updatedAt), 'dd MMMM, yyyy HH:mm:ss');
  }
}

export abstract class AbstractEntityWithDeletedAt extends AbstractEntity {
  @Exclude()
  @DeleteDateColumn({ name: 'deletedAt', nullable: true, default: null })
  public deletedAt?: Date | null;
}
