import { AbstractEntityWithDeletedAt } from 'src/libs/entities/abstract.entity';
import { ReservationStatusEnum } from 'src/libs/enums/reservation-status.enum';
import { ClientEntity } from 'src/modules/client/entities/client.entity';
import { ProviderEntity } from 'src/modules/provider/entities/provider.entity';
import { ServiceEntity } from 'src/modules/service/entities/service.entity';
import { ShiftEntity } from 'src/modules/shifts/entities/shift.entity';
import { WorkerEntity } from 'src/modules/user/entities/worker.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Index('IDX_RESERVATIONS_PROVIDER_DATE', ['providerId', 'date', 'status'])
@Index('IDX_RESERVATIONS_CLIENT', ['clientId', 'status'])
@Entity('reservations')
export class ReservationEntity extends AbstractEntityWithDeletedAt {
  @Column({ type: 'bigint', nullable: true })
  clientId: string | null;

  @ManyToOne(() => ClientEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'clientId' })
  client: ClientEntity | null;

  @Column({ type: 'bigint', nullable: true })
  providerId: string | null;

  @ManyToOne(() => ProviderEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'providerId' })
  provider: ProviderEntity | null;

  @Column({ type: 'bigint', nullable: true })
  serviceId: string | null;

  @ManyToOne(() => ServiceEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'serviceId' })
  service: ServiceEntity | null;

  @Column({ type: 'bigint', nullable: true })
  shiftId: string | null;

  @ManyToOne(() => ShiftEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'shiftId' })
  shift: ShiftEntity | null;

  @Column({ type: 'bigint', nullable: true })
  workerId: string | null;

  @ManyToOne(() => WorkerEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'workerId' })
  worker: WorkerEntity | null;

  @Column({ type: 'date' })
  date: string;

  @Column({
    type: 'enum',
    enum: ReservationStatusEnum,
    enumName: 'reservations_status_enum',
  })
  status: ReservationStatusEnum;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string | null;
}
