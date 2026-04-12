export const formatRupiah = (angka: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);

export const formatNumber = (angka: number) =>
  new Intl.NumberFormat("id-ID").format(angka);