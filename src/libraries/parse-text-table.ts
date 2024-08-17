import { ITable, Item } from "@/types/table";

const numberParse = (value: string): number => {
    if (!value) return NaN;
    value = value.replace(/[^\d]/g, '');
    const result = +value;
    if (`${result}` === value) return result;
    return NaN;
}

const validate = (values: number[]): number[] => {
    if (!values) return [];
    if (values.length < 2) return values.sort((a, b) => b - a);
    if (values.length < 3) {
        const value = values.sort((a, b) => b - a);
        return [value[0], value[1], (value[0] / value[1])];
    }

    const total = values[values.length - 1];
    let quantity = 0;
    let price = 0;

    values.pop();
    values
        .sort((a, b) => b - a)
        .forEach(value => {
            if (value <= total && price === 0) {
                const mod = total % value;
                if (mod === 0) quantity = total / value;
                if (values.includes(quantity)) price = value;
            }
        });
    if (quantity > price) {
        [quantity, price] = [price, quantity];
        return [total, quantity, price];
    }
    return [total, quantity, price];
}

const countTotalValue = (values: number[]): number[] => {
    const result = values.sort((a, b) => b - a);
    if (result.length === 0) return [];
    return [result[0]];
}

const isValidNumber = (values: number[]): boolean => {
    return !(values.includes(NaN) || values.includes(Infinity) || values.includes(0));
}

const getItems = (data: [number, number[]][]): [number, number[]][] => {
    let isStart = false;
    let isStop = false;
    return data.filter(([_, item]) => {
        if (isStop) return false;
        if (isStart && item.length < 3) {
            isStop = true;
            return false;
        }
        if (item.length >= 2 || isStart) {
            isStart = true;
            return true;
        }
        return false;
    });
}

export const getData = (text: string): ITable => {
    const decimalNumberPattern = /\b\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?\b/g;
    const longNumberPattern = /\b\d{10,}\b/g;
    const datePattern = /\b\d{2}\/\d{2}\/\d{4}\b/g;
    const timePattern = /\b\d{1,2}:\d{2}\b/g;
    const phoneNumberPattern = /\b\d{2,4}[-\s]?\d{3,4}[-\s]?\d{3,4}\b/g;
    const simpleNumberPattern = /\b\d+\b/g;
    const numberWithXPattern = /\b\d+x\b/gi;

    const combinedPattern = new RegExp(
        `${decimalNumberPattern.source}|${longNumberPattern.source}|${datePattern.source}|${timePattern.source}|${phoneNumberPattern.source}|${simpleNumberPattern.source}|${numberWithXPattern.source}`,
        'g'
    );

    let list: [number, number[]][] = [];
    const texts = text.split('\n').map((txt, index) => {
        const matches = txt.match(combinedPattern) || [];
        const numbers = matches.filter(Boolean);
        const parsedData = numbers.map(value => numberParse(value));
        const result = txt.toLocaleLowerCase().includes('total') ? countTotalValue(parsedData) : validate(parsedData);
        if (result.length > 0 && isValidNumber(result)) list.push([index, result]);
        return txt;
    });

    const items = getItems(list);
    const total = items.filter(values => values[1].length === 3).reduce((accumulator, currentValue) => accumulator + currentValue[1][0], 0);

    const lastItemIndex = items[items.length - 1][0];
    const totalTaxDiscountList = list.filter(([index]) => index > lastItemIndex);

    const minTax = total * 0.10;
    const maxTax = total * 0.12;
    const taxValue = totalTaxDiscountList.find((value) => value[1][0] >= minTax && value[1][0] <= maxTax);
    const totalValue = totalTaxDiscountList.find((value) => value[1][0] >= total && value[1][0] <= total);
    const totalAndTaxValue = totalTaxDiscountList.find((value) => value[1][0] >= (minTax + total) && value[1][0] <= (maxTax + total));

    const parseToJSON = (texts: string[], items: [number, number[]][], tax: [number, number[]] | undefined, total: [number, number[]] | undefined) : Item[] => {
        const secondLastItemIndex = items[items.length - 2][0];
        const lastItemIndex = items[items.length - 1][0];
        const totalIndex = total ? total[0] : 0;
        const lastLine = totalIndex - lastItemIndex;
        const firtsLine = lastItemIndex - secondLastItemIndex;
        let offset = 0;
        if (lastLine === 1 && firtsLine === 1) offset = 0; // same line
        else if (lastLine === 2 && firtsLine === 2) offset = 1; // below line
        else if (lastLine === 1 && firtsLine === 2) offset = -1; // above line
        return items.map(([index, [total, amount, price]]) => ({
            description: offset === 0 ?
                texts[index + offset].replace(/\b\d+[.,]?\d*\b/g, '').trim()
                :
                texts[index + offset],
            total,
            amount,
            price
        }));
    }

    const tax = taxValue ? taxValue[1][0] : 0;
    const totalAndTax = totalAndTaxValue ? totalAndTaxValue[1][0] : total + tax;
    return ({
        subtotal: total,
        total: totalAndTax,
        tax,
        list: parseToJSON(texts, items, taxValue, totalValue)
    });
}