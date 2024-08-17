'use client'
import { useEffect, useState, useCallback, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { clsx } from 'clsx';
import Image from 'next/image'

import Loading from '@/component/loading'
import { ITable, Item, TableView, User, UserView } from '@/types/table'
import { parseUserValue, parseValue } from '@/libraries/parse-value'
import TableIcon from '@/component/icons/table-icon';
import TextIcon from '@/component/icons/text-icon';
import ArrowIcon from '@/component/icons/arrow';
import CSVDownload from '@/component/csv-download';
import { getData } from '@/libraries/parse-text-table';
import Table from '@/component/table';
import AIGenerate from '@/component/ai-generate';
import ReceiptIcon from '@/component/icons/receipt-icon';
import SplitBill from '@/component/split-bill';
import AddIcon from '@/component/icons/add-icon';

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<string>('');
  const [table, setTable] = useState<ITable>({
    subtotal: 0,
    total: 0,
    tax: 0,
    list: []
  });
  const [tableView, setTableView] = useState<TableView>(parseValue({
    subtotal: 0,
    total: 0,
    tax: 0,
    list: []
  }));
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [tab, setTab] = useState<number>(1);
  const [users, setUsers] = useState<User[]>([])
  const [usersView, setUsersView] = useState<UserView[]>([])


  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);

      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      setOcrResult('');
      setError('');
    }
  }, []);

  useEffect(() => {
    if (previewUrl && selectedFile) {
      const performOCR = async () => {
        setTab(1);
        setLoading(true);
        setError('');
        try {
          const worker = await createWorker();
          await worker.load();
          const { data: { text } } = await worker.recognize(selectedFile);
          setOcrResult(text);
          await worker.terminate();
          const data = getData(text) as ITable
          if (!data) throw Error
          setTable(data)
          setTableView(parseValue(data) as TableView)
          setLoading(false);

        } catch (e) {
          // setError(e);
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      performOCR();
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, selectedFile]);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const showParsedDataAI = (data: ITable) => {
    setTableView(parseValue(data) as TableView)
  }

  const addItem = () => {
    const item:Item = {
      description: `Barang ${table.list.length + 1}`,
      total: 0,
      amount: 0,
      price: 0,
    }
    const newData = {...table, list: [...table.list, item]}
    setTable(newData)
    setTableView(parseValue(newData));
  }

  const deletItem = (index:number) => {
    let newData = {...table, list: table.list.filter((_, i) => i !== index)}
    const newUsersData = users.map(user => ({...user, items: user.items.filter((_, i) => i !== index)}))
    changeTableUser(newUsersData)
    changeTableView(newData)
  }

  const changeTableView = (data:ITable) => {
    const subtotal = data.list.reduce((accumulator, currentValue) => accumulator + currentValue.total, 0)
    const newTable = {...data, total: subtotal + data.tax, subtotal}
    setTable(newTable)
    setTableView(parseValue(newTable));
    const newData = users.map(user => ({...user, items: user.items.map(item => ({...item, price: newTable.list[item.index].price, total: newTable.list[item.index].price * item.quantity})) }))
    const taxPercent = newTable.tax / newTable.subtotal;
    
    const newDataUser = newData.map(user => {
      const total = user.items.reduce((accumulator, currentValue) => accumulator + currentValue.total, 0);
      return {...user, total: total * (1 + taxPercent), tax: total * taxPercent}
    })
    changeTableUser(newDataUser)
  }

  const changeTableUser = (data:User[]) => {
    setUsers(data)
    const newData = data.map(item => parseUserValue(item))
    setUsersView(newData)
  }


  return (
    <main className="flex min-h-screen flex-col justify-between pt-12">
      <div className='w-full'>
        <div className="md:flex justify-center block p-2">
          <div className="w-1/2 bg-white p-4 min-h-[80vh] md:w-[450px] shadow-lg md:mx-4 mx-auto w-[320px]">
            <div className='flex justify-between items-center px-2 py-4'>
              <h2 className='text-gray-500'></h2>
              <button type="button" onClick={() => handleButtonClick()} className="btn btn-primary">Upload image</button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            <div className={clsx(
              !previewUrl && 'flex items-center justify-center',
              'md:w-[420px] w-[280px] h-[65vh] relative'
            )}>
              {previewUrl
                ? (
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                )
                :
                <p className="text-center text-slate-400 text-base">No Pictures</p>
              }
            </div>
          </div>
          <div className="md:min-h-[80vh] flex justify-center items-center h-[48px] md:mx-4 mx-auto md:w-[48px] w-[320px]">
            <p className='md:rotate-0 rotate-90'>
              <ArrowIcon />
            </p>
          </div>
          <div className="w-1/2 bg-white p-4 min-h-[80vh] md:w-[450px] shadow-lg md:mx-4 mx-auto w-[320px]">
            <div className="border-b border-gray-200 mb-4">
              <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500">
                <li className="my-2">
                  <div onClick={() => setTab(1)} className={clsx(tab === 1 && "text-blue-600", "cursor-pointer inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-blue-600 hover:border-blue-300 group")}>
                    <TextIcon />
                    TEKS
                  </div>
                </li>
                <li className="my-2">
                  <div onClick={() => setTab(2)} className={clsx(tab === 2 && "text-blue-600", "cursor-pointer inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-blue-600 hover:border-blue-300 group")}>
                    <TableIcon />
                    TABEL
                  </div>
                </li>
                <li className="my-2">
                  <div onClick={() => setTab(3)} className={clsx(tab === 3 && "text-blue-600", "cursor-pointer inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-blue-600 hover:border-blue-300 group")}>
                    <ReceiptIcon />
                    SPLIT
                  </div>
                </li>
              </ul>
            </div>
            {tab === 1 && (
              loading ?
                <Loading />
                :
                !selectedFile ?
                  <p className="text-center text-slate-400 text-base">No Data</p>
                  :
                  <>
                    {error && (
                      <div className="error">
                        <p>{error}</p>
                      </div>
                    )}
                    <div className='max-h-[70vh] overflow-y-auto'>
                      <pre>{ocrResult}</pre>
                    </div>
                  </>
            )}
            {tab === 2 && (
                <div>
                  <div className='md:flex block justify-between'>
                    <div className='md:block flex justify-between'>
                      {
                        table?.list && <CSVDownload data={table} />
                      }
                      <AIGenerate text={ocrResult} onchange={showParsedDataAI} />
                    </div>
                    <div>
                      <button className='btn btn-primary md:w-auto w-full' onClick={() => addItem()}><AddIcon/> ITEM</button>
                    </div>
                  </div>
                  {
                    tableView?.list &&
                    <Table view={tableView} data={table} onchange={(e:ITable) => changeTableView(e)} ondelete={(index:number) => deletItem(index)}/>
                  }
                </div>
            )}
            {tab === 3 && (
              <SplitBill data={table} users={users} onchange={(e:User[]) => changeTableUser(e)}/>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
