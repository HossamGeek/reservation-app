export class DocumentResponseDto {
  id: string;

  fullUrl: string | null;

  originalFileName: string | null;

  status: string;

  rejectionReason: string | null;

  createdAt: Date;

  verifiedBy?: string | null;

  updatedAt?: Date | null;
}
