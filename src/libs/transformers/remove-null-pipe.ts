import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';

const keysToSkip = ['website'];

@Injectable()
export class RemoveNullKeysPipe implements PipeTransform {
  private isObj(value: unknown): boolean {
    return typeof value === 'object' && value !== null;
  }

  private removeNullKeys(obj: unknown): unknown {
    if (!this.isObj(obj)) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item: unknown) => this.removeNullKeys(item));
    }

    const cleanedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (keysToSkip.includes(key)) {
        cleanedObj[key] = value;
        continue;
      }

      if (value === null) {
        continue;
      }
      if (this.isObj(value)) {
        cleanedObj[key] = this.removeNullKeys(value);
      } else {
        cleanedObj[key] = value;
      }
    }

    return cleanedObj;
  }

  transform(value: unknown, metadata: ArgumentMetadata) {
    const { type } = metadata;

    if (this.isObj(value) && type === 'body') {
      return this.removeNullKeys(value);
    }
    return value;
  }
}
