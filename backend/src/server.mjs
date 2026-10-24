import { createApp } from './app.mjs';
import { backendConfig } from './config.mjs';

const config = backendConfig(process.env);
const app = createApp();
app.listen(config.port, config.host, () => console.log(`Backend listening on configured port ${config.port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => app.close());
