'use client'
import { useState } from "react";
import EditIcon from "./icons/edit-icon";
import DeleteIcon from "./icons/delete-icon";
import ShareIcon from "./icons/share-icon";
import AddIcon from "./icons/add-icon";
import Modal from "./modal";
import MinusIcon from "./icons/minu-icon";
import { ITable, Item } from "@/types/table";

interface ItemUser {
    index: number,
    quantity: number,
    price: number
    total: number
}

interface User {
    index: number,
    name: string, 
    total: number, 
    addtional: number, 
    items: ItemUser[]
}

export default function SplitBill({ data }: { data: ITable }) {
    const [isAddPersonOpen, setIsAddPersonOpen] = useState(false)
    const [isEditItemOpen, setIsEditItemOpen] = useState(false);
    const [itemUser, setItemUser] = useState<User>({
        index: 0,
        name: '',
        addtional: 0,
        total: 0,
        items: []
    })
    const [users, setUsers] = useState<User[]>([])
    const [name, setName] = useState('');

    // useEffect(() => {
    //     const result = data.list.map(({ price }: Item, index) => ({ price, index, quantity: 0 }))
    //     setItemUser(result)
    // }, [data])

    const increment = (value: number, index: number) => {
        const newData = {...itemUser, items: itemUser.items.map((item) => item.index === index ? { ...item, quantity: value + 1 } : item)}
        setItemUser(newData);
    }

    const decrement = (value: number, index: number) => {
        if (value <= 0) return;
        const newData = {...itemUser, items: itemUser.items.map((item) => item.index === index ? { ...item, quantity: value - 1 } : item)}
        setItemUser(newData);
    }

    const addUser = () => {
        const newUser = {index: users.length, name, total: 0, addtional: 0, items: data.list.map(({ price }: Item, index) => ({ price, index, quantity: 0, total: 0 }))} as User
        setUsers([...users, newUser]);
        setIsAddPersonOpen(false)
    }

    const deleteuser = (index:number) => {
        setUsers(users.filter((_, i) => i !== index).map((item:User, index) => ({...item, index})))
    }

    const openUserItem = (index:number) => {
        const user = users[index];
        setItemUser(user);
        setIsEditItemOpen(true);
    }   

    const saveUserItem = () => {
        const index = itemUser.index;
        const items = itemUser.items.map((item:ItemUser) => ({...item, total: item.quantity * item.price}));
        const total = items.reduce((accumulator, currentValue) => accumulator + currentValue.total, 0);
        const newData = {...itemUser, total: total, items}
        setUsers(users.map((item) => item.index === index ? newData : item))
        setIsEditItemOpen(false);
    }

    const shareLink = (index:number) => {
        const jsonString = JSON.stringify(users[index]);
        const base64Encoded = btoa(jsonString);
        window.open(`/split-bill?data=${base64Encoded}`, '_blank');
    }

    return (
        <div>
            {
                isAddPersonOpen ?
                    <Modal onclose={() => setIsAddPersonOpen(false)} title="Tambah Orang">
                        <div className="my-6">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nama
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <button
                                onClick={() => addUser()}
                                type="button"
                                className="btn btn-primary"
                            >
                                Simpan
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAddPersonOpen(false)}
                                className="px-4 py-2 font-bold text-white bg-gray-500 rounded hover:bg-gray-700"
                            >
                                Batal
                            </button>
                        </div>
                    </Modal>
                    : null
            }
            {
                isEditItemOpen ?
                    <Modal onclose={() => setIsEditItemOpen(false)} title={`Item Teguh`}>
                        <div className='overflow-x-auto mt-4'>
                            <table className="table-auto w-full border-collapse border border-slate-400 ">
                                <thead className=' w-full'>
                                    <tr>
                                        <th className="px-4 py-2 w-auto max-w-full border border-slate-300">Jumlah</th>
                                        <th className="px-4 py-2 w-auto max-w-full border border-slate-300">Item</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        data.list.map(({ description }: Item, index) =>
                                            <tr key={index}>
                                                <td className="px-4 py-2 w-auto border border-slate-300 min-w-[130px] text-center">
                                                    <button className="m-1 hover:text-blue-600" onClick={() => increment(itemUser.items[index].quantity, index)}><AddIcon /></button>
                                                    <span className="mx-2">{itemUser.items[index].quantity}</span>
                                                    <button className="m-1 hover:text-blue-600" onClick={() => decrement(itemUser.items[index].quantity, index)}><MinusIcon /></button>
                                                </td>
                                                <td className="px-4 py-2 w-auto min-w-[150px] border border-slate-300">{description}</td>
                                            </tr>
                                        )
                                    }
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <button
                                onClick={() => saveUserItem()}
                                type="button"
                                className="btn btn-primary"
                            >
                                Simpan
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditItemOpen(false)}
                                className="px-4 py-2 font-bold text-white bg-gray-500 rounded hover:bg-gray-700"
                            >
                                Batal
                            </button>
                        </div>
                    </Modal>
                    : null
            }
            <div className="flex justify-end">
                <button className="btn btn-primary md:w-auto w-full" onClick={() => setIsAddPersonOpen(true)}><AddIcon /> ORANG</button>
            </div>
            <div className='overflow-x-auto'>
                <table className="table-auto w-full border-collapse border border-slate-400 ">
                    <thead className=' w-full'>
                        <tr>
                            <th className="px-4 py-2 w-auto max-w-full border border-slate-300">Nama</th>
                            <th className="px-4 py-2 w-auto max-w-full border border-slate-300">Total</th>
                            <th className="px-4 py-2 w-auto max-w-full border border-slate-300"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            users.map(({name, total}:User, index) =>
                                <tr key={index}>
                                    <td className="px-4 py-2 w-auto min-w-[150px] border border-slate-300">{name}</td>
                                    <td className="px-4 py-2 w-auto  min-w-[150px] border border-slate-300">{total}</td>
                                    <td className="px-4 py-2 w-auto border border-slate-300  min-w-[120px]">
                                        <button className="m-1 hover:text-blue-600" onClick={() => openUserItem(index)}><EditIcon /></button>
                                        <button className="m-1 hover:text-blue-600" onClick={() => shareLink(index)}><ShareIcon /></button>
                                        <button className="m-1 hover:text-red-600" onClick={() => deleteuser(index)}><DeleteIcon /></button>
                                    </td>
                                </tr>
                            )
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}