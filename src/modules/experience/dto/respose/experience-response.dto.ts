export class ExperienceResponseDto {
  id: string;
  minYears: number;
  maxYears: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
