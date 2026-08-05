export interface ISendEmail {
  uuid?: string;
  to: string;
  mailSubject: string;
  mailText: string;
  eventType: string;
  otp?: string;
  token?: string;
  htmlTemplate: string;
}
