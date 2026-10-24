import { createApp } from './app';
import { loadConfig } from './config';

async function bootstrap() {
  const app = await createApp(loadConfig());
  await app.listen(Number(process.env.PORT ?? 3000));
}
bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
