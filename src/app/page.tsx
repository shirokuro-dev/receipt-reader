'use client'
import { useEffect, useState, useCallback, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { generateText } from "@/libraries/generative-ai";
import { clsx } from 'clsx';
import Image from 'next/image'

import Loading from '@/component/loading'
import { Table, TableView } from '@/types/table'
import { parseValue } from '@/libraries/parse-value'
import TableIcon from '@/component/table-icon';
import AiIcon from '@/component/ai-icon';
import TextIcon from '@/component/text-icon';
import ArrowIcon from '@/component/arrow';
import CSVDownload from '@/component/csv-download';

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<string>('');
  const [table, setTable] = useState<Table>();
  const [tableView, setTableView] = useState<TableView>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [tab, setTab] = useState<number>(1);
  const [AILoading, setAILoading] = useState(false)
  const [AIerror, setAIerror] = useState(false)


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

  const parseReceipt = async (txt: string) => {
    try {
      setAILoading(true);
      const prompt = `
      Please format the following receipt into the specified JSON format (don't give .md format at the answer and ensure total per item correct and balance with total amout):
      {
        "list": [
          {
            "amount": <quantity>, 
            "description": <item description>, 
            "price": <price>, 
            "total": <item total>
          }
        ], 
        "total": <total amount>, 
        "tax": <tax>
      }

      Here is the receipt:
      ${txt}
      `;
      const data = await generateText(prompt)
      console.log(data);
      return (JSON.parse(data) as Table)
    } catch (e) {
      console.error(e);
      setAIerror(true);
      return []
    } finally {
      setAILoading(false);
    }
  };

  useEffect(() => {
    if (previewUrl && selectedFile) {
      const performOCR = async () => {
        setTab(1);
        setAIerror(false);
        setLoading(true);
        setError('');
        try {
          const worker = await createWorker();
          await worker.load();
          const { data: { text } } = await worker.recognize(selectedFile);
          setOcrResult(text);
          await worker.terminate();
          const data = await parseReceipt(text) as Table;
          if (!data) throw Error
          setTable(data)
          setTableView(parseValue(data) as TableView)
        } catch (e) {
          setError('Error performing OCR: ' + e);
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


  return (
    <main className="flex min-h-screen flex-col justify-between p-12">
      <div className='w-full'>
        <div className="md:flex justify-center block">
          <div className="w-1/2 bg-white p-4 mx-4 min-h-[80vh] w-[450px] shadow-lg">
            <div className='flex justify-between items-center px-2 py-4'>
              <h2 className='text-gray-500 dark:text-gray-400'></h2>
              <button type="button" onClick={() => handleButtonClick()} className="text-white bg-gray-800 hover:bg-gray-900 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">Upload image</button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            <div className={clsx(
              !previewUrl && 'flex items-center justify-center',
              'w-[420px] h-[65vh] relative'
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
          <div className="md:min-h-[80vh] flex justify-center items-center h-[48px] md:w-[48px] w-[450px]">
            <p className='md:rotate-0 rotate-90'>
              <ArrowIcon />
            </p>
          </div>
          <div className="w-1/2 bg-white p-4 mx-4 min-h-[80vh] w-[450px] shadow-lg">
            <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
              <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                <li className="me-2">
                  <div onClick={() => setTab(1)} className={clsx(tab === 1 && "text-blue-600", "cursor-pointer inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-blue-600 hover:border-blue-300 dark:hover:text-blue-300 group")}>
                    <TextIcon />
                    TEKS
                  </div>
                </li>
                <li className="me-2">
                  <div onClick={() => setTab(2)} className={clsx(tab === 2 && "text-blue-600", "cursor-pointer inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-blue-600 hover:border-blue-300 dark:hover:text-blue-300 group")}>
                    <TableIcon />
                    TABEL
                  </div>
                </li>
                <li className="me-2">
                  <div onClick={() => setTab(3)} className={clsx(tab === 3 && "text-blue-600", "cursor-pointer inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-blue-600 hover:border-blue-300 dark:hover:text-blue-300 group")}>
                    <AiIcon />
                    AI
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
                <p className="text-center text-slate-400 text-base">The service is not available now</p>
              </div>
            )}
            {tab === 3 && (
              AILoading ?
                <Loading />
                :
                AIerror ?
                  <p className="text-center text-slate-400 text-base">The AI has had many requests. please wait a few minute.</p>
                  :
                  !selectedFile ?
                    <p className="text-center text-slate-400 text-base">No Data</p>
                    :
                    <div>
                      {
                        table?.list && <CSVDownload data={table} />
                      }
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
                              tableView?.list.map((item, index) =>
                                <tr key={index}>
                                  <td className="px-4 py-2 w-auto min-w-[250px] border border-slate-300">{item.description}</td>
                                  <td className="px-4 py-2 w-auto max-w-full border border-slate-300 text-center">{item.amount}</td>
                                  <td className="px-4 py-2 w-auto min-w-[250px] border border-slate-300">{item.price}</td>
                                  <td className="px-4 py-2 w-auto min-w-[250px] border border-slate-300">{item.total}</td>
                                </tr>
                              )}
                            <tr>
                              <td className="px-4 py-2 w-auto max-w-full border border-slate-300" colSpan={3}>Pajak</td>
                              <td className="px-4 py-2 w-auto max-w-full border border-slate-300">{tableView?.tax || '-'}</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 w-auto max-w-full border border-slate-300" colSpan={3}>Total</td>
                              <td className="px-4 py-2 w-auto max-w-full border border-slate-300">{tableView?.total || '-'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
