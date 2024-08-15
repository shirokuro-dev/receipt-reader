import { Table } from "@/types/table";

const formatRupiah = (number:number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);

export const parseValue = (data:Table) => {
    const {total, tax, list} = data;
    return {
        total: formatRupiah(total),
        tax: formatRupiah(tax),
        list: list.map(({amount, description, price, total}) => ({
            description,
            amount,
            price: formatRupiah(price),
            total: formatRupiah(total)
        }))
    }
}