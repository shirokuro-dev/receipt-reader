import { ITable } from "@/types/table";
import DownloadIcon from "@/component/icons/download-icon";

export default function CSVDownload({ data }: { data: ITable }) {
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
        <button onClick={() => handleDownload()} className="btn btn-primary"><DownloadIcon />CSV</button>
    );
}