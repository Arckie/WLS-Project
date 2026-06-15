export const formatMonthDay = (dateTime: string) => {
  if (!dateTime) {
    return "";
  }

  const dateOnly = dateTime.split("T")[0];
  const [, month, day] = dateOnly.split("-");

  return `${month}.${day}`;
};

export const formatDateTime = (dateTime: string) => {
  if (!dateTime) {
    return "-";
  }

  return dateTime.replace("T", " ").split(".")[0];
};
