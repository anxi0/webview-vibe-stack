# Scaffolding CLI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `npm run create` 실행 시 대화형 CLI가 백엔드/앱껍데기 선택을 물어보고 `projects/<name>/`에 프로젝트를 생성한다.

**Architecture:** 템플릿 파일 복사 방식. `templates/` 아래 실제 코드 파일을 두고, 사용자 선택에 따라 필요한 파일만 골라 `projects/<name>/`에 복사. `.tpl` 파일은 `{{projectName}}` 토큰 치환 후 확장자 제거. Capacitor는 루트 flat 구조, Flutter는 `web/` + `native/` 중첩 구조로 생성.

**Tech Stack:** TypeScript, ts-node, prompts, fs-extra, chalk, vitest

---

## File Map

| 파일 | 역할 |
|---|---|
| `package.json` | 루트 의존성 + `create` / `test` 스크립트 |
| `tsconfig.json` | scripts/ 용 TypeScript 설정 |
| `scripts/scaffold.ts` | CLI 진입점 — 질문, 라우팅, 완료 메시지 |
| `scripts/lib/copy.ts` | `copyTemplate`, `replaceTokens` 유틸 |
| `scripts/lib/generators.ts` | `scaffoldCapacitor`, `scaffoldFlutter` |
| `scripts/lib/copy.test.ts` | copy 유틸 단위 테스트 |
| `scripts/lib/generators.test.ts` | generators 통합 테스트 |
| `templates/web/app/layout.tsx` | max-w-md 모바일 래퍼 |
| `templates/web/app/page.tsx` | 기본 홈 페이지 |
| `templates/web/app/globals.css` | Tailwind 기본 |
| `templates/web/app/api/hello/route.ts` | CASE 2 API 라우트 예시 |
| `templates/web/lib/native-bridge.ts` | Capacitor·Flutter 공용 브리지 |
| `templates/web/lib/supabase.ts` | CASE 1 Supabase 클라이언트 |
| `templates/web/package.json.tpl` | {{projectName}} 포함 Next.js 의존성 |
| `templates/web/next.config.ts` | 기본 Next.js 설정 (Flutter용) |
| `templates/web/tsconfig.json` | 생성 프로젝트용 TS 설정 |
| `templates/capacitor/capacitor.config.ts.tpl` | {{projectName}} 포함 Capacitor 설정 |
| `templates/capacitor/next.config.ts` | `output: 'export'` 오버라이드 (CASE A) |
| `templates/flutter/lib/main.dart` | WebView + JavaScriptChannel |
| `templates/flutter/pubspec.yaml.tpl` | {{projectName}} 포함 Flutter 의존성 |

---

## Task 1: 루트 프로젝트 설정

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`

- [ ] **Step 1: package.json 작성**

```json
{
  "name": "webview-vibe-stack",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "create": "ts-node scripts/scaffold.ts",
    "test": "vitest run"
  },
  "devDependencies": {
    "typescript": "^5",
    "ts-node": "^10",
    "vitest": "^2",
    "prompts": "^2.4.2",
    "fs-extra": "^11",
    "chalk": "^5",
    "@types/prompts": "^2",
    "@types/fs-extra": "^11",
    "@types/node": "^20"
  }
}
```

- [ ] **Step 2: tsconfig.json 작성**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "rootDir": "."
  },
  "include": ["scripts/**/*"]
}
```

- [ ] **Step 3: 의존성 설치**

```bash
npm install
```

Expected: `node_modules/` 생성, 에러 없음

- [ ] **Step 4: 커밋**

```bash
git init
git add package.json tsconfig.json
git commit -m "chore: init project with TS + scaffolding deps"
```

---

## Task 2: copy 유틸 (TDD)

**Files:**
- Create: `scripts/lib/copy.ts`
- Create: `scripts/lib/copy.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

`scripts/lib/copy.test.ts`:
```typescript
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
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm test
```

Expected: `Cannot find module './copy'` 에러

- [ ] **Step 3: copy.ts 구현**

`scripts/lib/copy.ts`:
```typescript
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
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npm test
```

Expected: `8 passed`

- [ ] **Step 5: 커밋**

```bash
git add scripts/lib/copy.ts scripts/lib/copy.test.ts
git commit -m "feat: add copyTemplate and replaceTokens utils"
```

---

## Task 3: 웹 템플릿 파일 작성

**Files:** `templates/web/` 하위 전체

- [ ] **Step 1: templates/web/app/layout.tsx**

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '{{projectName}}',
  description: 'Built with webview-vibe-stack',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="max-w-md mx-auto min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: templates/web/app/page.tsx**

```tsx
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold select-none">{{projectName}}</h1>
      <p className="text-sm text-gray-500 mt-2 select-none">Built with webview-vibe-stack</p>
    </div>
  )
}
```

- [ ] **Step 3: templates/web/app/globals.css**

```css
@import "tailwindcss";
```

- [ ] **Step 4: templates/web/app/api/hello/route.ts** (CASE 2용)

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Hello from {{projectName}}' })
}
```

- [ ] **Step 5: templates/web/lib/native-bridge.ts**

```typescript
export const sendNativeMessage = (action: string, data: unknown = {}) => {
  const message = JSON.stringify({ action, data });

  if ((window as any).Capacitor?.Plugins) {
    // Capacitor: invoke plugin or custom listener
    (window as any).Capacitor.Plugins.App?.sendMessage?.({ message });
  } else if ((window as any).NativeBridge) {
    (window as any).NativeBridge.postMessage(message);
  }
};
```

- [ ] **Step 6: templates/web/lib/supabase.ts** (CASE 1용)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

- [ ] **Step 7: templates/web/package.json.tpl**

```json
{
  "name": "{{projectName}}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15",
    "react": "^19",
    "react-dom": "^19",
    "@supabase/supabase-js": "^2"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4",
    "eslint": "^9",
    "eslint-config-next": "^15"
  }
}
```

- [ ] **Step 8: templates/web/next.config.ts** (Flutter용 기본)

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {}

export default nextConfig
```

- [ ] **Step 9: templates/web/tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 10: 커밋**

```bash
git add templates/web/
git commit -m "feat: add Next.js web template files"
```

---

## Task 4: Capacitor·Flutter 템플릿 파일 작성

**Files:** `templates/capacitor/`, `templates/flutter/`

- [ ] **Step 1: templates/capacitor/capacitor.config.ts.tpl**

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.{{projectName}}',
  appName: '{{projectName}}',
  webDir: 'out',
};

export default config;
```

- [ ] **Step 2: templates/capacitor/next.config.ts** (static export 오버라이드)

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
}

export default nextConfig
```

- [ ] **Step 3: templates/flutter/pubspec.yaml.tpl**

```yaml
name: {{projectName}}_native
description: Flutter native wrapper for {{projectName}}
version: 1.0.0+1

environment:
  sdk: ">=3.0.0 <4.0.0"
  flutter: ">=3.10.0"

dependencies:
  flutter:
    sdk: flutter
  webview_flutter: ^4.10.0
  flutter_background_service: ^5.0.9

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true
```

- [ ] **Step 4: templates/flutter/lib/main.dart**

```dart
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: WebViewScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..addJavaScriptChannel(
        'NativeBridge',
        onMessageReceived: (message) {
          _handleMessage(message.message);
        },
      )
      ..loadRequest(Uri.parse('http://localhost:3000'));
  }

  void _handleMessage(String message) {
    // Handle messages from Next.js web app
    debugPrint('Web message: $message');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: WebViewWidget(controller: _controller),
      ),
    );
  }
}
```

- [ ] **Step 5: 커밋**

```bash
git add templates/capacitor/ templates/flutter/
git commit -m "feat: add Capacitor and Flutter template files"
```

---

## Task 5: generators (TDD)

**Files:**
- Create: `scripts/lib/generators.ts`
- Create: `scripts/lib/generators.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

`scripts/lib/generators.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { scaffoldCapacitor, scaffoldFlutter } from './generators';

const TEMPLATES = path.join(process.cwd(), 'templates');

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
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm test
```

Expected: `Cannot find module './generators'` 에러

- [ ] **Step 3: generators.ts 구현**

`scripts/lib/generators.ts`:
```typescript
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

  // 1. 웹 템플릿 복사 (기본 next.config.ts 포함)
  await copyTemplate(path.join(TEMPLATES, 'web'), projectPath, tokens);

  // 2. Capacitor 파일 복사 (next.config.ts 오버라이드 포함)
  await copyTemplate(path.join(TEMPLATES, 'capacitor'), projectPath, tokens);

  // 3. backend 선택에 따른 파일 조정
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

  // 1. 웹 템플릿 → web/ 에 복사
  await copyTemplate(path.join(TEMPLATES, 'web'), webDest, tokens);

  // 2. Flutter 템플릿 → native/ 에 복사
  await copyTemplate(path.join(TEMPLATES, 'flutter'), nativeDest, tokens);

  // 3. backend 선택에 따른 파일 조정
  if (backend !== 'supabase') {
    await fs.remove(path.join(webDest, 'lib', 'supabase.ts'));
  }
  if (backend !== 'nextjs-api') {
    await fs.remove(path.join(webDest, 'app', 'api'));
  }
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npm test
```

Expected: 전체 테스트 통과

- [ ] **Step 5: 커밋**

```bash
git add scripts/lib/generators.ts scripts/lib/generators.test.ts
git commit -m "feat: add scaffoldCapacitor and scaffoldFlutter generators"
```

---

## Task 6: 메인 CLI 작성

**Files:**
- Create: `scripts/scaffold.ts`
- Create: `projects/.gitkeep`

- [ ] **Step 1: projects/.gitkeep 생성**

```bash
mkdir -p projects && touch projects/.gitkeep
```

- [ ] **Step 2: scripts/scaffold.ts 작성**

```typescript
import prompts from 'prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { scaffoldCapacitor, scaffoldFlutter } from './lib/generators';

async function main() {
  console.log(chalk.bold('\n🚀 webview-vibe-stack'));
  console.log(chalk.gray('Mobile WebView app scaffolder\n'));

  // 1. 프로젝트 이름
  const { projectName } = await prompts({
    type: 'text',
    name: 'projectName',
    message: 'Project name:',
    validate: (v) =>
      /^[a-z0-9-]+$/.test(v) ? true : 'Lowercase letters, numbers, and hyphens only',
  });
  if (!projectName) process.exit(0);

  // 2. 중복 체크
  const projectPath = path.join(process.cwd(), 'projects', projectName);
  if (fs.existsSync(projectPath)) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `projects/${projectName} already exists. Overwrite?`,
      initial: false,
    });
    if (!overwrite) process.exit(0);
    await fs.remove(projectPath);
  }

  // 3. 백엔드 선택
  const { backend } = await prompts({
    type: 'select',
    name: 'backend',
    message: 'Backend:',
    choices: [
      { title: 'Supabase  (BaaS — auth, DB, realtime)', value: 'supabase' },
      { title: 'Next.js API Routes + ORM  (custom business logic)', value: 'nextjs-api' },
    ],
  });
  if (!backend) process.exit(0);

  // 4. 앱 껍데기 선택
  const { shell } = await prompts({
    type: 'select',
    name: 'shell',
    message: 'App shell:',
    choices: [
      { title: 'Capacitor  (standard web features)', value: 'capacitor' },
      { title: 'Flutter    (background GPS/audio/BLE)', value: 'flutter' },
    ],
  });
  if (!shell) process.exit(0);

  // 5. 요약 + 확인
  console.log('\n' + chalk.bold('Summary'));
  console.log(`  Name:    ${chalk.cyan(projectName)}`);
  console.log(`  Backend: ${chalk.cyan(backend)}`);
  console.log(`  Shell:   ${chalk.cyan(shell)}`);

  const { confirmed } = await prompts({
    type: 'confirm',
    name: 'confirmed',
    message: 'Create project?',
    initial: true,
  });
  if (!confirmed) process.exit(0);

  // 6. 생성
  console.log(chalk.gray('\nScaffolding...'));
  if (shell === 'capacitor') {
    await scaffoldCapacitor(projectPath, projectName, backend);
  } else {
    await scaffoldFlutter(projectPath, projectName, backend);
  }

  // 7. 완료 메시지
  console.log(chalk.green('\n✓ Done!'));
  console.log(`\nProject created at ${chalk.cyan(`projects/${projectName}/`)}`);
  console.log('\nNext steps:');

  if (shell === 'capacitor') {
    console.log(chalk.gray(`  cd projects/${projectName}`));
    console.log(chalk.gray('  npm install'));
    console.log(chalk.gray('  npm run dev'));
  } else {
    console.log(chalk.gray(`  cd projects/${projectName}/web`));
    console.log(chalk.gray('  npm install && npm run dev'));
    console.log(chalk.gray(`  cd projects/${projectName}/native`));
    console.log(chalk.gray('  flutter pub get && flutter run'));
  }
}

main().catch((err) => {
  console.error(chalk.red('Error:'), err.message);
  process.exit(1);
});
```

- [ ] **Step 3: 수동 동작 테스트**

```bash
npm run create
```

질문에 답하며 `projects/` 안에 올바른 구조가 생성되는지 확인:
- Capacitor 선택 시: `projects/<name>/app/`, `projects/<name>/capacitor.config.ts` 존재
- Flutter 선택 시: `projects/<name>/web/app/`, `projects/<name>/native/lib/main.dart` 존재

- [ ] **Step 4: 커밋**

```bash
git add scripts/scaffold.ts projects/.gitkeep
git commit -m "feat: add interactive scaffold CLI"
```

---

## Task 7: projects/ gitignore 설정

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: .gitignore 작성**

```
node_modules/
dist/
projects/*/
!projects/.gitkeep
```

- [ ] **Step 2: 커밋**

```bash
git add .gitignore
git commit -m "chore: add gitignore, exclude generated projects"
```
