export interface Item {
    amount: number,
    description: string,
    price: number,
    total: number
}

interface ItemView {
    amount: number,
    description: string,
    price: string,
    total: string
}

export interface Table {
    total: number,
    tax: number,
    list: Item[]
}

export interface TableView {
    total: string,
    tax: string,
    list: ItemView[]
}