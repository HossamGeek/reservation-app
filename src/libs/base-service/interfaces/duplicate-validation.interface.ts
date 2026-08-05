/**
 * Utility type to recursively extract all string dot-paths of an object up to a depth of 4.
 * Useful for type-safe validation configurations pointing to nested properties.
 */
export type NestedPropertyPaths<TObject, CurrentDepth extends unknown[] = []> =
  CurrentDepth['length'] extends 4
    ? never
    : TObject extends Date
    ? never
    : TObject extends RegExp
    ? never
    : TObject extends Array<unknown>
    ? never
    : TObject extends object
    ? {
        [Key in keyof TObject & (string | number)]: Key extends string
          ? TObject[Key] extends object
            ? `${Key}` | `${Key}.${NestedPropertyPaths<TObject[Key], [...CurrentDepth, unknown]>}`
            : `${Key}`
          : never;
      }[keyof TObject & (string | number)]
    : never;

/**
 * Defines a strategy to select/extract a field's value.
 * It can be a type-safe nested dot-path (string) or a custom extractor callback function.
 */
export type FieldPathOrExtractor<T> = NestedPropertyPaths<T> | ((obj: T) => unknown);

/**
 * Configuration mapping a field in an existing database entity to a field in an incoming DTO.
 * Used to check for duplicate conflicts during validation.
 */
export interface DuplicateFieldMapping<TEntity, TDto> {
  /** The field path or custom extractor on the database entity. */
  entityField: FieldPathOrExtractor<TEntity>;
  
  /** The field path or custom extractor on the DTO. */
  dtoField: FieldPathOrExtractor<TDto>;
  
  /** 
   * The path in the response error object where the conflict validation error message should be registered. 
   * Defaults to `dtoField` if `dtoField` is a string. Must be specified if `dtoField` is a callback function.
   */
  errorField?: string;
  
  /** Optional translation key for a custom error message. If omitted, a default key is used. */
  customErrorMessageKey?: string;
}

/**
 * Input structure representing the database entity and incoming DTO for duplicate validation.
 */
export interface DuplicateValidationInput<TEntity, TDto> {
  existingEntity: TEntity;
  dto: TDto;
}

/**
 * Result structure of duplicate validation checks.
 */
export interface DuplicateValidationResult {
  isDuplicate: boolean;
  fields: Record<string, string[]>;
}

