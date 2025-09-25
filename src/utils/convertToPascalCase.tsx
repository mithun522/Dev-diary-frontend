export const convertToPascalCase = (str: string) => {
  return str.slice(0, 1).toUpperCase().concat(str.slice(1).toLowerCase());
};

export const pascalizeUnderscore = (str: string) => {
  return str
    .split("_")
    .map((word) => convertToPascalCase(word))
    .join(" ");
};
