export function formatNumber(num: number): string {
  let formattedNum = num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (formattedNum.endsWith('.00')) {
    formattedNum = formattedNum.slice(0, -3);
  }
  return formattedNum;
}

export function camelToSnake(camelCase: string) {
  return camelCase.replace(/[A-Z]/g, (match) => '_' + match.toLowerCase());
}
