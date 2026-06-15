export const makePreviewText = (
  contents: string,
  maxLength = 34,
  emptyText = "내용이 없습니다."
) => {
  if (!contents) {
    return emptyText;
  }

  return contents.length > maxLength
    ? `${contents.slice(0, maxLength)}...`
    : contents;
};
