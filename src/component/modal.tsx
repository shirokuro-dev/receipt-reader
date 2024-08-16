import { useState } from 'react';

interface Item {
    name: string;
    item: string;
    quantity: number;
}

const Modal = ({ onclose, children, title }: { onclose: Function, children: React.ReactNode, title:string }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="w-auto max-w-lg p-6 bg-white rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button onClick={() => onclose()} className="text-xl">
                        &times;
                    </button>
                </div>
                {children}
            </div>
        </div>


    );
};

export default Modal;
