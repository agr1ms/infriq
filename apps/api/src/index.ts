import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import router from "./routes/router.js";
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
app.use("/api", router);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "infriq-api" });
});

app.get("/api/ping", (_req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime() });
});

const dev = process.env.NODE_ENV !== "production";
const keepAliveHost = process.env.KEEP_ALIVE_HOST ?? "portfolio-website-xr69.onrender.com";

const keepAlive = async () => {
  const protocol = dev ? "http" : "https";
  const host = dev ? `localhost:${port}` : keepAliveHost;
  const url = `${protocol}://${host}/api/ping`;

  const lib = (await import(url.startsWith("https") ? "https" : "http")) as typeof import("http");
  const req = lib.get(url, (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {
      if (res.statusCode === 200) {
        console.log(`✅ Keep-alive ping successful: ${res.statusCode} - ${data}`);
      } else {
        console.warn(`⚠️ Keep-alive ping returned status: ${res.statusCode}`);
      }
    });
  });

  req.on("error", (err) => {
    console.error("❌ Keep-alive ping failed:", err.message);
    setTimeout(() => {
      console.log("🔄 Retrying keep-alive ping...");
      keepAlive();
    }, 30000);
  });

  req.setTimeout(10000, () => {
    req.destroy();
    console.error("❌ Keep-alive ping timeout");
  });
};

const keepAliveInterval = setInterval(keepAlive, 5 * 60 * 1000);
setTimeout(keepAlive, 10000);

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
