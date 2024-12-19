export function toHex(num: number) {
  return `0x${num.toString(16)}`;
}

export function removeItemFromArray(arr: any[], item: any) {
  const index = arr.indexOf(item);
  if (index > -1) {
    arr.splice(index, 1);
  }
}

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
