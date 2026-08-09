import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import authRouter from "./routes/auth";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api", router);

// JSON 404 fallback: the API must never leak an HTML error page to the frontend.
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global JSON error handler: converts any thrown error into JSON, never HTML.
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, "Unhandled API error");
  res.status(500).json({ error: "Internal server error" });
});

export default app;
