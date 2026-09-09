export const POSTGRES_UNIQUE_VIOLATION_CODE = '23505';

export interface PostgresDriverError {
  code?: string;
  constraint?: string;
}

export function getPostgresDriverError(
  error: unknown,
): PostgresDriverError | undefined {
  if (!error || typeof error !== 'object' || !('driverError' in error)) {
    return undefined;
  }

  const driverError = (error as { driverError?: unknown }).driverError;

  if (!driverError || typeof driverError !== 'object') {
    return undefined;
  }

  return driverError as PostgresDriverError;
}

export function isPostgresUniqueViolation(error: unknown): boolean {
  const driverError = getPostgresDriverError(error);

  return driverError?.code === POSTGRES_UNIQUE_VIOLATION_CODE;
}