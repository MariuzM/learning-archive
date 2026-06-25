export const t = (v: string): string => v;

export const hideString = (str?: string): string => {
  if (!str) return '';
  const hiddenString = str.substring(0, 4) + '****' + str.substring(str.length - 4);
  return hiddenString;
};
