export const getFavoriteTitle = (favoriteUrl: string) => {
  const lectureId = favoriteUrl.split("lectureId=")[1];

  if (!lectureId) {
    return favoriteUrl;
  }

  return `강의 #${lectureId}`;
};
