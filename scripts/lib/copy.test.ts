import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { replaceTokens, copyTemplate } from './copy';

describe('replaceTokens', () => {
  it('replaces single token', () => {
    expect(replaceTokens('Hello {{name}}!', { name: 'world' })).toBe('Hello world!');
  });

  it('replaces multiple occurrences', () => {
    expect(replaceTokens('{{a}}-{{a}}', { a: 'x' })).toBe('x-x');
  });

  it('replaces multiple distinct tokens', () => {
    expect(replaceTokens('{{a}} {{b}}', { a: '1', b: '2' })).toBe('1 2');
  });

  it('leaves unknown tokens untouched', () => {
    expect(replaceTokens('{{unknown}}', {})).toBe('{{unknown}}');
  });
});

describe('copyTemplate', () => {
  let tmpSrc: string;
  let tmpDest: string;

  beforeEach(() => {
    tmpSrc = fs.mkdtempSync(path.join(os.tmpdir(), 'src-'));
    tmpDest = fs.mkdtempSync(path.join(os.tmpdir(), 'dest-'));
  });

  afterEach(() => {
    fs.removeSync(tmpSrc);
    fs.removeSync(tmpDest);
  });

  it('copies a plain file', async () => {
    fs.writeFileSync(path.join(tmpSrc, 'hello.txt'), 'hello');
    await copyTemplate(tmpSrc, tmpDest, {});
    expect(fs.readFileSync(path.join(tmpDest, 'hello.txt'), 'utf-8')).toBe('hello');
  });

  it('strips .tpl extension', async () => {
    fs.writeFileSync(path.join(tmpSrc, 'package.json.tpl'), '{"name":"x"}');
    await copyTemplate(tmpSrc, tmpDest, {});
    expect(fs.existsSync(path.join(tmpDest, 'package.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDest, 'package.json.tpl'))).toBe(false);
  });

  it('replaces tokens in file content', async () => {
    fs.writeFileSync(path.join(tmpSrc, 'name.txt'), '{{projectName}}');
    await copyTemplate(tmpSrc, tmpDest, { projectName: 'my-app' });
    expect(fs.readFileSync(path.join(tmpDest, 'name.txt'), 'utf-8')).toBe('my-app');
  });

  it('copies nested directories', async () => {
    fs.mkdirSync(path.join(tmpSrc, 'sub'));
    fs.writeFileSync(path.join(tmpSrc, 'sub', 'file.ts'), 'content');
    await copyTemplate(tmpSrc, tmpDest, {});
    expect(fs.existsSync(path.join(tmpDest, 'sub', 'file.ts'))).toBe(true);
  });
});
