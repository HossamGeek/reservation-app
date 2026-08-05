import { HttpStatus } from '@nestjs/common';

export class ApiResponse {
  static successResponse(message: string, data = {}, status = HttpStatus.OK) {
    return { message, ...data, status };
  }
}
