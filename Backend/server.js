import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);


app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
  connectDB();
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)              
    console.log("Connected with DB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

// app.post("/test", async (req, res) => {
//   const options = {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.NVAPI_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "openai/gpt-oss-20b",
//       input: req.body.message,
//     }),
//   };
//   try {
//     const response = await fetch("https://integrate.api.nvidia.com/v1/responses", options);
//     const data = await response.json();
//     // console.log(data.output?.[1]?.content?.[0]?.text); // reply
//     res.send(data.output?.[1]?.content?.[0]?.text);
//   } catch (error) {
//     console.error("Error:", error);
//   }
// });
