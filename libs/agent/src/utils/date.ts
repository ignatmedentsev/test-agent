import dayjs from 'dayjs';

export const ONE_DAY = 864e5; // 24*60*60*1000
export const DICOM_DATE_FORMAT = 'YYYYMMDD';
// 070907.0705 represents a time of 7 hours, 9 minutes and 7.0705 seconds.
export const DICOM_TIME_FORMAT = 'HHmmss';
// Leads date to format: e.g 1613041923
// SECONDS SINCE JAN 01 1970. (UTC)

export function parseDate(dateString: string, format = 'YYYY-MM-DD', utc = false) {
  const dayjsDate = dayjs(dateString, { format, utc });

  return dayjsDate.isValid()
    ? dayjsDate.toDate()
    : undefined;
}

export function parseDateTimeFromDicomTag(dateString: string, timeString: string) {
  return parseDate(dateString + timeString, DICOM_DATE_FORMAT + DICOM_TIME_FORMAT, false);
}

export function parseDateFromDicomTag(dateString: string) {
  return parseDate(dateString, DICOM_DATE_FORMAT, false);
}

export function formatDate(
  date: Date,
  isUtc = false,
  outputFormat = 'MM/DD/YYYY',
) {
  if (!dayjs(date).isValid()) {
    return '-';
  }

  return dayjs(date, { format: outputFormat, utc: isUtc });
}
