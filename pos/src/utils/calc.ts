export const amountsAdd = (v1: number, v2: number) => {
  return v1 + v2;
};

export const amountsSubtract = (first: number, second: number) => {
  return first - second;
};

export const countAllItems = (el: any[]) => {
  let price = 0;
  for (let i = 0; i < el.length; i++) {
    const e = el[i].amounts.price;
    price += e;
  }
  return price;
};
