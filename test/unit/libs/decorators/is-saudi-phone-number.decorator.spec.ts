// is-saudi-phone-number.decorator.spec.ts
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { IsSaudiPhoneNumber } from 'src/libs/decorators/is-saudi-phone-number.decorator';

class TestDto {
  @IsSaudiPhoneNumber()
  phoneNumber: string;
}

describe('IsSaudiPhoneNumber', () => {
  const expectValid = async (value: unknown) => {
    const dto = plainToInstance(TestDto, { phoneNumber: value });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  };

  const expectInvalid = async (value: unknown) => {
    const dto = plainToInstance(TestDto, { phoneNumber: value });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  };

  describe('valid Saudi mobile numbers in E.164 format Only', () => {
    it('accepts E.164 format', () => expectValid('+966512345678'));
  });

  describe('rejects other countries', () => {
    it('rejects UAE numbers', () => expectInvalid('+971512345678'));
    it('rejects Egyptian numbers', () => expectInvalid('+201012345678'));
  });

  describe('rejects landlines', () => {
    it('rejects a Saudi landline number', () => expectInvalid('+966112345678')); // 01x = landline
  });

  describe('rejects invalid formats', () => {
    it('rejects whitespace anywhere', () => expectInvalid('+966 51 234 5678'));
    it('rejects leading whitespace', () => expectInvalid(' +966512345678'));
    it('rejects trailing whitespace', () => expectInvalid('+966512345678 '));
    it('rejects letters', () => expectInvalid('+966512345abc'));
    it('rejects special characters other than +', () => expectInvalid('+966-51-234-5678'));
    it('rejects empty string', () => expectInvalid(''));
    it('rejects non-string values', () => expectInvalid(12345678));
    it('rejects invalid length', () => expectInvalid('+96651234'));
  });
});