import { ITable, Item, TableView } from '@/types/table'
import { useState } from 'react';
import DeleteIcon from './icons/delete-icon';

type ValidKey = 'description' | 'price' | 'total' | 'amount';

export default function Table({ view, data, onchange, ondelete }: { view: TableView, data: ITable, onchange: Function, ondelete: Function }) {
  const [value, setValue] = useState<string>('');
  const [editIndex, setEditIndex] = useState<number>(NaN);
  const [editKey, setEditKey] = useState<string>('');

  const edit = (str: string, mode: string, key: string, index: number) => {
    const result = +(str.replace(/[^0-9,-]+/g, "").replace(",", "."))
    setValue(mode === 'number' ? `${result === 0 ? '' : result}` : str);
    setEditIndex(index);
    setEditKey(key)
  }

  const saveValue = (str: string, mode: string, key: string, index: number) => {
    if (!['word', 'number'].includes(mode)) return
    if (!data?.list) return

    let newData: ITable;
    if (isFinite(index) && ['description', 'price', 'total', 'amount'].includes(key)) {
      newData = { ...data, list: data.list.map((item: Item, i) => ({ ...item, [key as ValidKey]: i === index ? (mode === 'number' ? +str : str) : item[key as ValidKey] })) }
      // if (key === 'total') newData = { ...newData, list: newData.list.map(({ description, amount, total }) => ({ description, amount, total, price: total / amount })) }
      // else if(['total', 'price'].includes(key)) newData = { ...newData, list: newData.list.map(({ description, amount, price }) => ({ description, amount, price, total: price * amount })) }
    } else {
      newData = { ...data, [key]: mode === 'number' ? +str : str };
    }
    newData = { ...newData, total: newData.list.reduce((accumulator, currentValue) => accumulator + currentValue.total, 0) + newData.tax };
    setEditIndex(NaN);
    setEditKey('')
    onchange(newData);
  }

  return (
    <div className='overflow-x-auto'>
      <table className="table-auto w-full border-collapse border border-slate-400 ">
        <thead className=' w-full'>
          <tr>
            <th className="px-4 py-2 w-auto max-w-full border border-slate-300">Item</th>
            <th className="px-4 py-2 w-auto max-w-full border border-slate-300">Kuantitas</th>
            <th className="px-4 py-2 w-auto max-w-full border border-slate-300">Harga</th>
            <th className="px-4 py-2 w-auto max-w-full border border-slate-300">Total</th>
            {/* <th className="px-4 py-2 w-auto max-w-full border border-slate-300"></th> */}
          </tr>
        </thead>
        <tbody>
          {
            view?.list.length > 0 ?
              view.list.map((item, index) =>
                <tr key={index}>
                  <td contentEditable suppressContentEditableWarning onFocus={e => edit(e.target.innerText, 'word', 'description', index)} onBlur={e => saveValue(e.target.innerText, 'word', 'description', index)} className="px-4 py-2 w-auto min-w-[250px] border border-slate-300">{index === editIndex && editKey === 'description' ? value : item.description}</td>
                  <td contentEditable suppressContentEditableWarning onFocus={e => edit(e.target.innerText, 'number', 'amount', index)} onBlur={e => saveValue(e.target.innerText, 'number', 'amount', index)} className="px-4 py-2 w-auto max-w-full border border-slate-300 text-center">{index === editIndex && editKey === 'amount' ? value : item.amount}</td>
                  <td contentEditable suppressContentEditableWarning onFocus={e => edit(e.target.innerText, 'number', 'price', index)} onBlur={e => saveValue(e.target.innerText, 'number', 'price', index)} className="px-4 py-2 w-auto min-w-[250px] border border-slate-300">{index === editIndex && editKey === 'price' ? value : item.price}</td>
                  <td contentEditable suppressContentEditableWarning onFocus={e => edit(e.target.innerText, 'number', 'total', index)} onBlur={e => saveValue(e.target.innerText, 'number', 'total', index)} className="px-4 py-2 w-auto min-w-[250px] border border-slate-300">{index === editIndex && editKey === 'total' ? value : item.total}</td>
                  {/* <td className="px-4 py-2 w-auto border border-slate-300">
                    <button className='hover:text-red-600' onClick={() => ondelete(index)}>
                      <DeleteIcon/>
                    </button>
                  </td> */}
                </tr>
              )
              :
              <tr>
                <td colSpan={4} className="px-4 py-2 w-auto border border-slate-300">
                  <p className="text-center text-slate-400 text-base">No Items</p>
                </td>
              </tr>
          }
          {/* <tr>
            <td className="px-4 py-2 w-auto max-w-full border border-slate-300 font-semibold" colSpan={3}>Ongkir</td>
            <td contentEditable suppressContentEditableWarning onFocus={e => edit(e.target.innerText, 'number', 'ongkir', NaN)} onBlur={e => saveValue(e.target.innerText, 'number', 'ongkir', NaN)} className="px-4 py-2 w-auto max-w-full border border-slate-300">{view?.tax || '-'}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 w-auto max-w-full border border-slate-300 font-semibold" colSpan={3}>Diskon</td>
            <td contentEditable suppressContentEditableWarning onFocus={e => edit(e.target.innerText, 'number', 'diskon', NaN)} onBlur={e => saveValue(e.target.innerText, 'number', 'diskon', NaN)} className="px-4 py-2 w-auto max-w-full border border-slate-300">{view?.tax || '-'}</td>
          </tr> */}
          <tr>
            <td className="px-4 py-2 w-auto max-w-full border border-slate-300 font-semibold" colSpan={3}>Pajak</td>
            <td colSpan={2} contentEditable suppressContentEditableWarning onFocus={e => edit(e.target.innerText, 'number', 'tax', NaN)} onBlur={e => saveValue(e.target.innerText, 'number', 'tax', NaN)} className="px-4 py-2 w-auto max-w-full border border-slate-300">{!isFinite(editIndex) && editKey === 'tax' ? value : view.tax}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 w-auto max-w-full border border-slate-300 font-semibold" colSpan={3}>Total</td>
            <td colSpan={2} className="px-4 py-2 w-auto max-w-full border border-slate-300 font-semibold">{view?.total}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}