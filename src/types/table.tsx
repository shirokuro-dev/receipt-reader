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

export interface ITable {
    subtotal: number,
    total: number,
    tax: number,
    list: Item[]
}

export interface TableView {
    total: string,
    tax: string,
    list: ItemView[]
}
export interface ItemUser {
    index: number,
    quantity: number,
    price: number,
    subtotal: number,
    total: number,
    description: string
}

export interface ItemUserView {
    index: number,
    quantity: number,
    price: string
    total: string
    description: string
}

export interface User {
    index: number,
    name: string, 
    total: number, 
    tax: number, 
    items: ItemUser[]
}

export interface UserView {
    index: number,
    name: string, 
    total: string, 
    tax: string, 
    items: ItemUserView[]
}