// import OpenAI from 'openai';

// const openai = new OpenAI({
//   apiKey: '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',
//   baseURL: 'https://integrate.api.nvidia.com/v1',
// })

// async function main() {
//   const completion = await openai.chat.completions.create({
//     model: "openai/gpt-oss-20b",
//     messages: [{"role":"user","content":"nashik"}],
//     temperature: 1,
//     top_p: 1,
//     max_tokens: 4096,
//     stream: true
//   })

//   for await (const chunk of completion) {
//     const reasoning = chunk.choices[0]?.delta?.reasoning_content;
//     if (reasoning) process.stdout.write(reasoning);
//     process.stdout.write(chunk.choices[0]?.delta?.content || '')
//   }

// }

// main();

import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI({
  apiKey:
    "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", // use correct env name
  baseURL: "https://integrate.api.nvidia.com/v1", // 🔥 MUST
});

async function main() {
  try {
    const response = await client.responses.create({
      model: "openai/gpt-oss-20b",
      input: "what is react js answer in breif ? ",
    });

    const text = response.output?.[0]?.content?.[0]?.text;

    console.log(text);
    console.log("Full Response:", response);
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
