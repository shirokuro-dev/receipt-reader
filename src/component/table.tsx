import { TableView } from '@/types/table'

export default function Table({data}:{data:TableView}) {
    return (
        <div className='overflow-x-auto'>
        <table className="table-auto w-full border-collapse border border-slate-400 ">
          <thead className=' w-full'>
            <tr>
              <th className="px-4 py-2 w-auto max-w-full border border-slate-300">Item</th>
              <th className="px-4 py-2 w-auto max-w-full border border-slate-300">Kuantitas</th>
              <th className="px-4 py-2 w-auto max-w-full border border-slate-300">Harga</th>
              <th className="px-4 py-2 w-auto max-w-full border border-slate-300">Total</th>
            </tr>
          </thead>
          <tbody>
            {
              data?.list.length > 0 ?
              data.list.map((item, index) =>
                <tr key={index}>
                  <td contentEditable suppressContentEditableWarning className="px-4 py-2 w-auto min-w-[250px] border border-slate-300">{item.description}</td>
                  <td contentEditable suppressContentEditableWarning className="px-4 py-2 w-auto max-w-full border border-slate-300 text-center">{item.amount}</td>
                  <td  contentEditable suppressContentEditableWarning className="px-4 py-2 w-auto min-w-[250px] border border-slate-300">{item.price}</td>
                  <td contentEditable suppressContentEditableWarning className="px-4 py-2 w-auto min-w-[250px] border border-slate-300">{item.total}</td>
                </tr>
              )
              :
              <tr>
                  <td colSpan={4} className="px-4 py-2 w-auto border border-slate-300">
                    <p className="text-center text-slate-400 text-base">No Items</p>
                  </td>
              </tr>
            }
            <tr>
              <td className="px-4 py-2 w-auto max-w-full border border-slate-300 font-semibold" colSpan={3}>Ongkir</td>
              <td contentEditable suppressContentEditableWarning className="px-4 py-2 w-auto max-w-full border border-slate-300">{data?.tax || '-'}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 w-auto max-w-full border border-slate-300 font-semibold" colSpan={3}>Diskon</td>
              <td contentEditable suppressContentEditableWarning className="px-4 py-2 w-auto max-w-full border border-slate-300">{data?.tax || '-'}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 w-auto max-w-full border border-slate-300 font-semibold" colSpan={3}>Pajak</td>
              <td contentEditable suppressContentEditableWarning className="px-4 py-2 w-auto max-w-full border border-slate-300">{data?.tax || '-'}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 w-auto max-w-full border border-slate-300 font-semibold" colSpan={3}>Total</td>
              <td className="px-4 py-2 w-auto max-w-full border border-slate-300 font-semibold">{data?.total || '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
}