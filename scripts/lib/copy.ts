import fs from 'fs-extra';
import path from 'path';

export function replaceTokens(content: string, tokens: Record<string, string>): string {
  return Object.entries(tokens).reduce(
    (acc, [key, value]) => acc.split(`{{${key}}}`).join(value),
    content
  );
}

export async function copyTemplate(
  src: string,
  dest: string,
  tokens: Record<string, string>
): Promise<void> {
  await fs.ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destName = entry.name.endsWith('.tpl') ? entry.name.slice(0, -4) : entry.name;
    const destPath = path.join(dest, destName);

    if (entry.isDirectory()) {
      await copyTemplate(srcPath, destPath, tokens);
    } else {
      const content = await fs.readFile(srcPath, 'utf-8');
      await fs.writeFile(destPath, replaceTokens(content, tokens));
    }
  }
}
