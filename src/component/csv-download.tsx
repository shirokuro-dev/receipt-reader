import { Table } from "@/types/table";
import CSVIcon from "@/component/csv-icon";

export default function CSVDownload({ data }: { data: Table }) {
    const list = data.list

    const arrayToCSV = <T extends Record<string, any>>(array: T[]): string => {
        if (array.length === 0) return '';
        const keys = Object.keys(array[0]);
        const header = keys.join(',');
        const rows = array.map(item =>
            keys.map(key => JSON.stringify(item[key], replacer)).join(',')
        );
        return [header, ...rows].join('\n');
    };

    const replacer = (_: string, value: any) => {
        if (value === null || value === undefined) return '';
        return value;
    };

    const downloadCSV = (csvContent: string, fileName: string) => {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownload = () => {
        const csvContent = arrayToCSV(list);
        downloadCSV(csvContent, 'data.csv');
    };

    return (
        <div className="w-full text-right">
            <button onClick={() => handleDownload()} className="text-white bg-gray-800 hover:bg-gray-900 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"><CSVIcon />Download Data</button>
        </div>
    );
}