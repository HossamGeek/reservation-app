import { validate } from 'class-validator';
import { IsBigIntId } from 'src/libs/decorators/is-bigint-id.decorator';

class TestDto {
  @IsBigIntId()
  id: string;
}

describe('IsBigIntId', () => {
  const validateValue = async (value: unknown) => {
    const dto = new TestDto();
    dto.id = value as string;

    return validate(dto);
  };

  it.each(['1', '25', '123456789', '9223372036854775807', '999999999999999999'])(
    'should accept valid BigInt ID value: %s',
    async (value) => {
      const errors = await validateValue(value);

      expect(errors).toHaveLength(0);
    },
  );

  it.each([
        "",                  // Empty string
        " ",                 // Space only
        "   ",              // Multiple spaces
        "\t",                // Tab
        "\n",                // New line

        "123abc",            // Numbers followed by letters
        "abc123",            // Letters before numbers
        "12abc34",           // Mixed letters and numbers

        "12-3",              // Hyphen in the middle
        "-100",              // Negative number
        "+100",              // Plus sign

        "12_3",              // Underscore
        "12.5",              // Decimal point
        "12,5",              // Comma
        "1/2",               // Slash
        "1\\2",              // Backslash
        "1:2",               // Colon

        "#123",              // Hash
        "$123",              // Dollar
        "@123",              // At sign
        "123!",              // Exclamation
        "123?",              // Question mark
        "123%",              // Percent
        "123*",              // Asterisk

        "1 23",              // Space in the middle
        "123 ",              // Trailing space
        " 123",              // Leading space

        "1e10",              // Scientific notation
        "Infinity",          // Infinity
        "NaN",               // NaN string
        "0x10",              // Hexadecimal

        "٠١٢٣",              // Arabic-Indic digits
        "٢٣",              // Arabic-Indic digits
        "１２３",             // Full-width Unicode digits

        "true",              // Boolean as string
        "false",
        "null",
        "undefined",

        "00123a",            // Leading zeros + letters
  ])('should reject invalid BigInt ID value: %s', async (value) => {
    const errors = await validateValue(value);

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('IsBigIntId');
  });

  it.each([123, 0, null, undefined, true, {}, []])(
    'should reject non-string value: %s',
    async (value) => {
      const errors = await validateValue(value);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('IsBigIntId');
    },
  );

  it('should return clear validation message', async () => {
    const errors = await validateValue('123abc');

    expect(errors[0].constraints?.IsBigIntId).toBe(
      'id must be a valid positive BIGINT identifier.',
    );
  });
});
