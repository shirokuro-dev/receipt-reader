'use client'
import { useEffect, useState } from "react";
import EditIcon from "./icons/edit-icon";
import DeleteIcon from "./icons/delete-icon";
import ShareIcon from "./icons/share-icon";
import AddIcon from "./icons/add-icon";
import Modal from "./modal";
import MinusIcon from "./icons/minu-icon";
import { ITable, Item, ItemUser, User } from "@/types/table";
import { formatRupiah } from "@/libraries/parse-value";

export default function SplitBill({ data, users, onchange }: { data: ITable, users: User[], onchange: Function }) {
    const [isEditItemOpen, setIsEditItemOpen] = useState(false);
    const [itemUser, setItemUser] = useState<User>({
        index: 0,
        name: '',
        tax: 0,
        total: 0,
        items: []
    })
    const [value, setValue] = useState<string>('');
    const [editIndex, setEditIndex] = useState<number>(NaN);
    

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
        const newUser = {index: users.length, name: `Orang ${users.length + 1}`, total: 0, tax: 0, items: data.list.map(({ price, description }: Item, index) => ({ price, index, quantity: 0, total: 0, description }))} as User
        onchange([...users, newUser]);
    }

    const deleteuser = (index:number) => {
        onchange(users.filter((_, i) => i !== index).map((item:User, index) => ({...item, index})))
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
        const taxPercent = data.tax / data.subtotal;
        const newData = {...itemUser, total: (total * (1 + taxPercent)), items, tax: total * taxPercent}
        onchange(users.map((item) => item.index === index ? newData : item))
        setIsEditItemOpen(false);
    }

    const shareLink = (index:number) => {
        const jsonString = JSON.stringify({...users[index], items: users[index].items.filter(({total}) => total > 0)});
        const base64Encoded = btoa(jsonString);
        window.open(`/split-bill?data=${base64Encoded}`, '_blank');
    }

    const editValue = (str: string, index: number) => {
        setValue(str)
        setEditIndex(index)
    }

    const saveValue = (str: string, index: number) => {
        const newData = users.map((user, i) => ({...user, name: index === i ? str : user.name}));
        onchange(newData)
        setEditIndex(NaN)
    }

    return (
        <div>
            {
                isEditItemOpen ?
                    <Modal onclose={() => setIsEditItemOpen(false)} title={`Item ${itemUser.name}`}>
                        <div className='overflow-x-auto mt-4'>
                            <table className="table-auto w-full border-collapse border border-slate-400 ">
                                <thead className=' w-full'>
                                    <tr>
                                        <th className="px-4 py-2 w-auto max-w-full border border-slate-300">Jumlah</th>
                                        <th className="px-4 py-2 w-auto max-w-full border border-slate-300 min-w-[150px]">Item</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        itemUser.items.length === 0 ?
                                        <tr className="px-4 py-2 w-auto h-12 border border-slate-300 text-center">
                                            <td colSpan={2}>
                                                <p className="text-center text-slate-400 text-base">No Items</p>
                                            </td>
                                        </tr>
                                        :
                                        itemUser.items.map(({ description }: ItemUser, index) =>
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
                        <div className="flex items-center justify-between mt-4 pt-2">
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
                                className="btn btn-secondary"
                            >
                                Batal
                            </button>
                        </div>
                    </Modal>
                    : null
            }
            <div className="flex justify-end">
                <button className="btn btn-primary md:w-auto w-full" onClick={() => addUser()}><AddIcon /> ORANG</button>
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
                                    <td className="px-4 py-2 w-auto min-w-[150px] border border-slate-300"  contentEditable suppressContentEditableWarning onFocus={e => editValue(e.target.innerText, index)} onBlur={e => saveValue(e.target.innerText, index)}>{ index === editIndex ? value : name}</td>
                                    <td className="px-4 py-2 w-auto  min-w-[150px] border border-slate-300">{formatRupiah(total)}</td>
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