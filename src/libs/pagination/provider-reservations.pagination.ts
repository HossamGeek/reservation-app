import { PaginateConfig } from 'nestjs-paginate';
import { ReservationEntity } from 'src/modules/reservations/entities/reservation.entity';

export const getProviderReservationsPaginationConfig: PaginateConfig<ReservationEntity> = {
  sortableColumns: ['id', 'date'],
  filterableColumns: {
    status: true,
    date: true,
    serviceId: true,
  },
  defaultSortBy: [
    ['date', 'DESC'],
    ['id', 'DESC'],
  ],
  defaultLimit: 20,
  maxLimit: 100,
};