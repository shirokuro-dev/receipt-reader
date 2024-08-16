import { useState } from "react";
import { ITable } from "@/types/table";
import { generateText } from "@/libraries/generative-ai";
import AiIcon from "./icons/ai-icon";
import clsx from "clsx";

export default function AIGenerate({ text, onchange }: { text: string, onchange: Function }) {
    const [AILoading, setAILoading] = useState(false)
    const [AIerror, setAIerror] = useState(false)

    const parseReceipt = async () => {
        try {
          setAILoading(true);
          const prompt = `
          Please convert the following receipt into a JSON object with the specified structure:
          {
            "list": [
              {
                "amount": <quantity :number>, 
                "description": <item description :string>, 
                "price": <price :number>, 
                "total": <item total :number>
              }
            ], 
            "total": <total amount :number>, 
            "tax": <tax :number>
          }
    
          Ensure:
            1. All numeric values (quantity, price, total, tax) are converted to numbers.
            2. The calculated total for each item is correct.
            3. The sum of item totals matches the overall total.
            4. don't give \`\`\`json\`\`\` or .md format response 
          
          Please provide the receipt text below:
          ${text}
          `;
          const data = await generateText(prompt)
          const result = (JSON.parse(data) as ITable)
          onchange(result)
        } catch (e) {
          console.error(e);
          setAIerror(true);
          setTimeout(() => {
            setAIerror(false);
          }, 3000)
          onchange(null)
          return []
        } finally {
          setAILoading(false);
        }
      };

    return (
        <button onClick={() => parseReceipt()} className={clsx(AILoading && 'cursor-not-allowed' , "btn btn-primary")}><AiIcon/>{
            AILoading ?
            'Parsing...'
            :
            AIerror
            ?
            'Error'
            :
            'AI'
        }</button>
    );
}