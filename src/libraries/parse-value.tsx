import { ITable, User } from "@/types/table";

export const formatRupiah = (number:number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);

export const parseValue = (data:ITable) => {
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

export const parseUserValue = (data:User) => {
    const {total, name, index, tax, items} = data;
    
    return {
        name, 
        index,
        total: formatRupiah(total),
        tax: formatRupiah(tax),
        items: items.map(({quantity, index, description, price, total}) => ({
            index,
            description,
            quantity,
            price: formatRupiah(price),
            total: formatRupiah(total)
        }))
    }
}