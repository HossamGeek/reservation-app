export class ServiceResponseDto {
  id: string;
  categoryId: string;
  serviceTypeId: string;
  name: string;
  description: string;
  isActive: boolean;
  logoId?: string | null;
  createdAt: Date;
}
