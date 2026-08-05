import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logging } from './entities/logging.entity';
import { Repository } from 'typeorm';
import { CreateLogRecordDto } from './dto/request/create-log-record.dto';

@Injectable()
export class LoggingService {
  constructor(
    @InjectRepository(Logging)
    private readonly loggingRepository: Repository<Logging>,
  ) {}

  addLog(record: CreateLogRecordDto) {
    // Create a copy of the record
    const recordCopy = structuredClone(record);

    const { body } = recordCopy;
    if (body) {
      for (const key in body) {
        const lowerCaseKey = key.toLowerCase();
        if (lowerCaseKey.includes('password')) {
          // Modify the copy, not the original record
          recordCopy.body[key] = '*****';
        }
      }
    }

    // Save the copy of the record
    return this.loggingRepository.insert(recordCopy);
  }
}
