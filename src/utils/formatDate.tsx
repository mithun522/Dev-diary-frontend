export const formatDate = (dateString?: string | null) => {
  if (!dateString) return ""; // return empty string if no date
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ""; // invalid date case
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};
