import "dotenv/config";

const getOpenAIAPIResponse = async (message) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NVAPI_KEY}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      input: message,
    }),
  };
  try {
    const response = await fetch(
      "https://integrate.api.nvidia.com/v1/responses",
      options,
    );
    const data = await response.json();
    return data.output?.[1]?.content?.[0]?.text;// reply
  } catch (error) {
    console.error("Error:", error);
  }
};

export default getOpenAIAPIResponse;