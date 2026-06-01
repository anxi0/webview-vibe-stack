import fs from 'fs-extra';
import path from 'path';
import { copyTemplate } from './copy';

const TEMPLATES = path.join(process.cwd(), 'templates');

export async function scaffoldCapacitor(
  projectPath: string,
  projectName: string,
  backend: string
): Promise<void> {
  const tokens = { projectName };

  await copyTemplate(path.join(TEMPLATES, 'web'), projectPath, tokens);
  await copyTemplate(path.join(TEMPLATES, 'capacitor'), projectPath, tokens);

  if (backend !== 'supabase') {
    await fs.remove(path.join(projectPath, 'lib', 'supabase.ts'));
  }
  if (backend !== 'nextjs-api') {
    await fs.remove(path.join(projectPath, 'app', 'api'));
  }
}

export async function scaffoldFlutter(
  projectPath: string,
  projectName: string,
  backend: string
): Promise<void> {
  const tokens = { projectName };
  const webDest = path.join(projectPath, 'web');
  const nativeDest = path.join(projectPath, 'native');

  await copyTemplate(path.join(TEMPLATES, 'web'), webDest, tokens);
  await copyTemplate(path.join(TEMPLATES, 'flutter'), nativeDest, tokens);

  if (backend !== 'supabase') {
    await fs.remove(path.join(webDest, 'lib', 'supabase.ts'));
  }
  if (backend !== 'nextjs-api') {
    await fs.remove(path.join(webDest, 'app', 'api'));
  }
}
