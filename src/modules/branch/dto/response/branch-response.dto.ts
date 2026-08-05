import { CityResponseDto } from 'src/modules/city/dto/response/city-response.dto';
import { BranchStatusEnum } from 'src/libs/enums/branch-status.enum';

export class BranchResponseDto {
  id: string;

  name: string;

  address: string;

  providerId: string;

  city: Pick<CityResponseDto, 'id' | 'name'>;

  logo: string | null;

  status: BranchStatusEnum;

  isMainBranch: boolean;

  createdAt: Date;

  updatedAt: Date;

  workersCount: number;

  requestsCount: number;
}
