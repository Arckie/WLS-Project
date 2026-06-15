import type { Favorite } from "../types/Favorite";

export const makeLectureFavoriteUrl = (lectureId: number) => {
  return `/lecture/list?lectureId=${lectureId}`;
};

export const findFavoriteByLectureId = (
  favorites: Favorite[],
  lectureId: number
) => {
  const favoriteUrl = makeLectureFavoriteUrl(lectureId);

  return favorites.find((favorite) => favorite.favoriteUrl === favoriteUrl);
};
