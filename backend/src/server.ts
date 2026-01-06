import app from "./app";
import { gracefulShutdown } from "./util";

const PORT = process.env.PORT || 4001;

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

process.on("SIGINT", () => gracefulShutdown("SIGINT", server));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM", server));
