export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(dateString));
  } catch (error) {
    console.error("Invalid date string passed to formatDate:", dateString);
    return "Invalid Date";
  }
};
