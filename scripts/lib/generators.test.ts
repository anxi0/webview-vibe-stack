import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { scaffoldCapacitor, scaffoldFlutter } from './generators';

describe('scaffoldCapacitor', () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cap-')); });
  afterEach(() => { fs.removeSync(tmpDir); });

  it('creates flat structure with web + capacitor files', async () => {
    await scaffoldCapacitor(tmpDir, 'test-app', 'supabase');
    expect(fs.existsSync(path.join(tmpDir, 'app', 'layout.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'capacitor.config.ts'))).toBe(true);
  });

  it('includes supabase.ts when backend is supabase', async () => {
    await scaffoldCapacitor(tmpDir, 'test-app', 'supabase');
    expect(fs.existsSync(path.join(tmpDir, 'lib', 'supabase.ts'))).toBe(true);
  });

  it('excludes supabase.ts when backend is nextjs-api', async () => {
    await scaffoldCapacitor(tmpDir, 'test-app', 'nextjs-api');
    expect(fs.existsSync(path.join(tmpDir, 'lib', 'supabase.ts'))).toBe(false);
  });

  it('includes api route when backend is nextjs-api', async () => {
    await scaffoldCapacitor(tmpDir, 'test-app', 'nextjs-api');
    expect(fs.existsSync(path.join(tmpDir, 'app', 'api', 'hello', 'route.ts'))).toBe(true);
  });

  it('excludes api route when backend is supabase', async () => {
    await scaffoldCapacitor(tmpDir, 'test-app', 'supabase');
    expect(fs.existsSync(path.join(tmpDir, 'app', 'api'))).toBe(false);
  });

  it('replaces {{projectName}} token in package.json', async () => {
    await scaffoldCapacitor(tmpDir, 'my-cool-app', 'supabase');
    const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'));
    expect(pkg.name).toBe('my-cool-app');
  });

  it('uses output:export in next.config.ts', async () => {
    await scaffoldCapacitor(tmpDir, 'test-app', 'supabase');
    const config = fs.readFileSync(path.join(tmpDir, 'next.config.ts'), 'utf-8');
    expect(config).toContain("output: 'export'");
  });
});

describe('scaffoldFlutter', () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flutter-')); });
  afterEach(() => { fs.removeSync(tmpDir); });

  it('creates web/ + native/ subdirectories', async () => {
    await scaffoldFlutter(tmpDir, 'test-app', 'supabase');
    expect(fs.existsSync(path.join(tmpDir, 'web', 'app', 'layout.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'native', 'lib', 'main.dart'))).toBe(true);
  });

  it('replaces {{projectName}} in pubspec.yaml', async () => {
    await scaffoldFlutter(tmpDir, 'my-app', 'supabase');
    const pubspec = fs.readFileSync(path.join(tmpDir, 'native', 'pubspec.yaml'), 'utf-8');
    expect(pubspec).toContain('my-app_native');
  });

  it('excludes supabase.ts when backend is nextjs-api', async () => {
    await scaffoldFlutter(tmpDir, 'test-app', 'nextjs-api');
    expect(fs.existsSync(path.join(tmpDir, 'web', 'lib', 'supabase.ts'))).toBe(false);
  });
});
