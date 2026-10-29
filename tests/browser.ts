import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { existsSync } from 'node:fs';
import chromium, { inflate, setupLambdaEnvironment } from '@sparticuz/chromium';
/** Local Linux test browser; production never includes or executes this package. */
export async function browserLaunchOptions() {
  const executablePath = process.env.CHROMIUM_PATH || await chromium.executablePath();
  if (!process.env.CHROMIUM_PATH && process.platform === 'linux') {
    const libraries = resolve(tmpdir(), 'al2023');
    if (!existsSync(resolve(libraries, 'lib/libnspr4.so'))) await inflate(resolve('node_modules/@sparticuz/chromium/bin/al2023.tar.br'));
    setupLambdaEnvironment(resolve(libraries, 'lib'));
  }
  return { executablePath, args: chromium.args.filter(arg => !['--disable-web-security', '--allow-running-insecure-content', '--disable-site-isolation-trials', '--single-process'].includes(arg)) };
}
