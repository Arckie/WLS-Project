import {
  ghcolors,
  prism,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";

export const getSyntaxThemeByLanguage = (language: string) => {
  if (!language) {
    return {};
  }

  switch (language.toLowerCase()) {
    case "java":
      return prism;
    case "typescript":
    case "javascript":
      return vs;
    case "sql":
      return ghcolors;
    case "text":
      return {};
    default:
      return {};
  }
};
