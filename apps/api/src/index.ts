import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

const app = express();
const port = Number(process.env.PORT) || 4000;
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000,http://localhost:3001";

app.use(helmet());
app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());


app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "dbpilot-api" });
});

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
