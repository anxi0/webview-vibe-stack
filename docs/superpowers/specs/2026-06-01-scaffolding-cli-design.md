# Scaffolding CLI Design

**Date:** 2026-06-01  
**Status:** Approved

---

## Goal

`webview-vibe-stack` 레포를 클론한 뒤 `npm run create`를 실행하면, 대화형 CLI가 사용자에게 질문하고 선택에 맞는 프로젝트를 `projects/<name>/` 안에 생성한다.

---

## Repo Structure

```
webview-vibe-stack/
├── templates/
│   ├── web/                      # Next.js 공통 템플릿 (CASE A·B 모두 사용)
│   │   ├── app/
│   │   │   ├── layout.tsx        # max-w-md 모바일 래퍼 적용
│   │   │   └── page.tsx
│   │   ├── components/ui/        # Shadcn UI 기본 컴포넌트
│   │   ├── lib/
│   │   │   ├── supabase.ts       # CASE 1 전용
│   │   │   └── native-bridge.ts  # Capacitor·Flutter 공용 브리지
│   │   ├── package.json.tpl      # {{projectName}} 토큰 포함
│   │   ├── next.config.ts
│   │   └── tsconfig.json
│   ├── capacitor/                # CASE A 추가 파일
│   │   └── capacitor.config.ts.tpl
│   └── flutter/                  # CASE B 추가 파일
│       ├── lib/
│       │   └── main.dart         # WebView + JavaScriptChannel 설정
│       └── pubspec.yaml.tpl
├── scripts/
│   └── scaffold.ts               # Interactive CLI 진입점
├── projects/                     # 생성된 프로젝트가 위치
├── docs/
├── app-architecture.md
├── package.json
└── tsconfig.json
```

---

## Generated Project Structure

### CASE A — Capacitor

```
projects/<name>/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/ui/
├── lib/
│   ├── supabase.ts       # CASE 1 선택 시만 포함
│   └── native-bridge.ts
├── capacitor.config.ts
├── package.json
├── next.config.ts
└── tsconfig.json
```

### CASE B — Flutter

```
projects/<name>/
├── web/                   # Next.js 프로젝트
│   ├── app/
│   ├── components/ui/
│   ├── lib/
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
└── native/                # Flutter 프로젝트
    ├── lib/
    │   └── main.dart
    └── pubspec.yaml
```

---

## CLI Flow (`scripts/scaffold.ts`)

```
1. 프로젝트 이름 입력         → 영소문자·숫자·하이픈만 허용, 중복 체크
2. 백엔드 선택               → (1) Supabase  (2) Next.js API Routes
3. 앱 껍데기 선택            → (A) Capacitor  (B) Flutter
4. 선택 요약 출력 후 확인    → Y/N
5. projects/<name>/ 생성
   - CASE A: 루트 flat 구조
   - CASE B: web/ + native/ 중첩 구조
6. .tpl 파일에서 토큰 치환   → {{projectName}}
7. 불필요한 파일 제거        → CASE 1 미선택 시 supabase.ts 제외, CASE 2 선택 시 app/api/ 라우트 핸들러 포함
8. 완료 메시지 출력          → 다음 실행 명령어 안내
```

---

## Token Replacement

템플릿 파일 내 `{{projectName}}`을 사용자가 입력한 이름으로 치환.  
`.tpl` 확장자는 복사 후 제거 (예: `package.json.tpl` → `package.json`).

---

## Dependencies (root package.json)

| 패키지 | 용도 |
|---|---|
| `prompts` | Interactive CLI 질문 |
| `fs-extra` | 파일 복사·생성 유틸 |
| `chalk` | 터미널 컬러 출력 |
| `ts-node` | TypeScript 직접 실행 |
| `typescript` | 타입 검사 |

---

## Root package.json scripts

```json
{
  "scripts": {
    "create": "ts-node scripts/scaffold.ts"
  }
}
```

---

## Error Handling

- `projects/<name>/` 이미 존재하면 덮어쓸지 확인 후 진행
- 이름에 허용되지 않는 문자 포함 시 즉시 재입력 요청

---

## Out of Scope

- npm 배포 (`npx create-*` 형태)
- 생성 후 자동 `npm install` 실행
- Supabase 프로젝트 자동 연동 (URL·키 입력)
