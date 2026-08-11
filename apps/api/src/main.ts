import { env } from "./infrastructure/config/env.js";
import { createApp } from "./presentation/http/app.js";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`D-Shirtak API listening on http://localhost:${env.PORT}`);
});
