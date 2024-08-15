'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "process";

export const generateText = async (prompt:string) => {
    try {
        const apiKey = env.NEXT_API_KEY as string;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro"});
        const result = await model.generateContent([prompt]);
        return result.response.text()
      } catch (e) {
        console.error(e);
        return ''
      }
}