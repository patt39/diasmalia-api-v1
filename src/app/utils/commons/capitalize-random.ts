export const capitalizeName = (s: string) => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const capitalizeFirstLetter = (
  firstItem: string,
  secondItem: string,
) => {
  return (
    capitalizeName(firstItem).charAt(0) + capitalizeName(secondItem).charAt(0)
  ).toUpperCase();
};

export const capitalizeOneFirstLetter = (firstItem: string) => {
  return capitalizeName(firstItem).charAt(0).toUpperCase();
};
