import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI({
  apiKey: "" // use correct env name
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
