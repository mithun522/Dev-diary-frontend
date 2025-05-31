export const convertToPascalCase = (str: string) => {
  return str.slice(0, 1).toUpperCase().concat(str.slice(1).toLowerCase());
};
