import { LEARNING_PROFILE_ID_MAP } from "../constants/memberProfile";

export const buildYearOptions = (startYear = new Date().getFullYear()) => {
  const years = [];

  for (let year = startYear; year >= 1900; year--) {
    years.push(year);
  }

  return years;
};

export const buildMonthOptions = () => {
  const months = [];

  for (let month = 1; month <= 12; month++) {
    months.push(month);
  }

  return months;
};

export const buildDayOptions = (year: string, month: string) => {
  const lastDay =
    year === "" || month === "" ? 31 : new Date(Number(year), Number(month), 0).getDate();
  const days = [];

  for (let day = 1; day <= lastDay; day++) {
    days.push(day);
  }

  return days;
};

export const formatPhoneNumber = (value: string) => {
  const onlyNumber = value.replace(/[^0-9]/g, "");

  if (onlyNumber.length <= 3) {
    return onlyNumber;
  }

  if (onlyNumber.length <= 7) {
    return `${onlyNumber.slice(0, 3)}-${onlyNumber.slice(3)}`;
  }

  return `${onlyNumber.slice(0, 3)}-${onlyNumber.slice(3, 7)}-${onlyNumber.slice(7, 11)}`;
};

export const convertProfileNamesToIds = (profileNames: string[]) => {
  return profileNames
    .map((name) => LEARNING_PROFILE_ID_MAP[name])
    .filter((id) => id !== undefined);
};

export const removeNonNameCharacters = (value: string) => {
  return value.replace(/[^a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣]/g, "");
};
