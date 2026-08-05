import { Readable } from 'stream';
export interface DocumentDownloadResult {
  stream: Readable;
  originalName: string;
  contentType: string;
  size: string;
}
