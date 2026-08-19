import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import { webcore } from 'webcoreui/integration';

export default defineConfig({
  output: 'server',
  outDir: '../../dist/apps/web',
  adapter: cloudflare(),
  integrations: [react(), webcore()],
});
