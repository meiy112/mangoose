import Lesson from "../models/Lesson";
import ErrorWithCode from "../errors/ErrorWithCode";
import { jsonrepair } from 'jsonrepair'
import OpenAI from "openai";
import { OPENAI_EXAMPLE, OPENAI_INSTRUCTIONS } from "../constants/openAIConstants";


class OpenAIService {
  // generates a lesson given content
  public async generateLesson(content: string) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY as string });

    let example = OPENAI_EXAMPLE;

    // remove all line breaks
    example = example.replace(/[\r\n\t]+/g, "");

    try {
      const completion = await openai.chat.completions.create({
        messages: [{
           role: "system", 
           content: OPENAI_INSTRUCTIONS},
          {
            role: "assistant",
            content: example,
          },
          {"role": "user", "content": content}
       ],

        model: "gpt-4o-mini",
      });
      
      // trim + clean data
      let result = completion.choices[0].message.content?.replace(/\n/g, '').replace(/\"/g, '"');
      let startIndex = result?.indexOf('[');
      let endIndex = result?.lastIndexOf(']');
      let trimmedResult;
      if (startIndex && endIndex) {
        trimmedResult = result?.substring(startIndex, endIndex + 1);
      } else {
        trimmedResult = result;
      }

      // repair json (fix quotes, brackets, etc)
      let repairedResult;
      if (trimmedResult) {
        repairedResult = jsonrepair(trimmedResult);
      } else {
        repairedResult = trimmedResult;
      }
      
      // serialize into json
      let jsonResult;
      if (!trimmedResult) {
        throw new Error("Unable to generate lesson");
      } else {
        jsonResult = JSON.parse(trimmedResult);
      }
      return jsonResult;

    } catch (error: any) {
      console.error('Error: ', error);
      throw new Error(error.message);
    }
  }

  public async getChatResponse(prompt: string) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY as string });

      const completion = await openai.chat.completions.create({
        messages: [
          { role: "user", content: prompt }
        ],
        model: "gpt-4o-mini",
      });

      return completion.choices[0].message.content?.trim();
    } catch (error: any) {
      console.error('Error communicating with OpenAI:', error);
      throw new Error('Failed to get response from OpenAI');
    }
  }
}

export default new OpenAIService();
