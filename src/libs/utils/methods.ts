export const convertJwtTimeToMilliseconds = (time: string): number => {
  const timeUnit = time.slice(-1);
  const timeValue = parseInt(time.slice(0, -1));
  let milliseconds = 0;

  switch (timeUnit) {
    case 's':
      milliseconds = timeValue * 1000;
      break;
    case 'm':
      milliseconds = timeValue * 60 * 1000;
      break;
    case 'h':
      milliseconds = timeValue * 60 * 60 * 1000;
      break;
    case 'd':
      milliseconds = timeValue * 24 * 60 * 60 * 1000;
      break;
    default:
      throw new Error('Invalid time unit');
  }

  return milliseconds;
};
