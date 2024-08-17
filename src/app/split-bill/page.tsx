'use client';

import { parseValue } from '@/libraries/parse-value';
import { ITable, ItemUser, TableView, User } from '@/types/table';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function SpillBillPage() {
  const searchParams = useSearchParams();
  const [dataView, setdataView] = useState<TableView>();
  const [name, setName] = useState<string>('');

  useEffect(() => {
    const data = searchParams.get('data');

    if (data) {
      try {
        // Decode the Base64 string
        const decodedString = Buffer.from(data, 'base64').toString('utf-8');
        // Parse the decoded string as JSON
        const json = JSON.parse(decodedString) as User;
        const view = {
          total: json.total,
          tax: json.tax,
          list: json.items.map(({description, price, quantity, total}) => ({
            description,
            price,
            amount: quantity,
            total
          }))
        } as ITable;
        setName(json.name)
        setdataView(parseValue(view));
      } catch (error) {
        setdataView(undefined)
        console.error('Error decoding Base64 or parsing JSON:', error);
      }
    }
  }, [searchParams]);

  if (!dataView) {
    return <div className="flex min-h-screen flex-col justify-between pt-12">Loading...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col justify-between pt-12">
      <div className='w-full'>
        <div className="md:flex justify-center block p-2">
          <div className="w-1/2 bg-white p-4 min-h-[80vh] md:w-[450px] shadow-lg md:mx-4 mx-auto w-[320px]">
            <div className='flex justify-between items-center px-2 py-4'>
              <h1 className='text-gray-800'>Hi <span className='font-semibold'>{name}</span>!</h1>
            </div>
            <div className='md:w-[420px] w-[280px] h-[65vh] relative'>
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
                      dataView?.list.length > 0 ?
                      dataView?.list.map((item, index) =>
                          <tr key={index}>
                            <td className="px-4 py-2 w-auto min-w-[250px] border border-slate-300">{item.description}</td>
                            <td className="px-4 py-2 w-auto max-w-full border border-slate-300 text-center">{item.amount}</td>
                            <td className="px-4 py-2 w-auto min-w-[250px] border border-slate-300">{item.price}</td>
                            <td className="px-4 py-2 w-auto min-w-[250px] border border-slate-300">{item.total}</td>
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
                      <td className="px-4 py-2 w-auto max-w-full border border-slate-300 font-semibold" colSpan={3}>Pajak</td>
                      <td className="px-4 py-2 w-auto max-w-full border border-slate-300">{dataView.tax}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 w-auto max-w-full border border-slate-300 font-semibold" colSpan={3}>Total</td>
                      <td className="px-4 py-2 w-auto max-w-full border border-slate-300 font-semibold">{dataView.total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SuspenseWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SpillBillPage />
    </Suspense>
  );
}