export const debugShallowEqual = (obj: any, obj2: any) => {
  return !Object.keys(obj).some((k) => {
    const comparison = obj[k] !== obj2[k];
    if (obj[k] !== obj2[k]) {
      console.log(k, obj[k], obj2[k]);
    }
    return comparison;
  });
};
