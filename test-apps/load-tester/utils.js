export function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals).toFixed(decimals);
}

export function formatSize(size) {
  if (size < 1000) {
    return round(size, 0) + " B";
  } else if (size < 1000000) {
    return round(size / 1000, 1) + " kB";
  } else if (size < 1000000000) {
    return round(size / 1000000, 1) + " MB";
  } else {
    throw new Error("can't format a number over 1,000,000,000");
  }
}