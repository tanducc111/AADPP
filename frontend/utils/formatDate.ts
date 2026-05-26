export function formatDateTime(dateTimeValue: string, locale = "en-US") {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateTimeValue));
}

export function formatDate(dateValue: string, locale = "en-US") {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(new Date(dateValue));
}
