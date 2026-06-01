# 📱 webview-vibe-stack

> **The Ultimate Adaptive Full-Stack WebView App Starter Kit for Vibe Coding.**

`webview-vibe-stack`은 AI(Cursor, Bolt.new, Lovable 등)와의 협업을 극대화하여 모바일 웹뷰(WebView) 앱을 가장 빠르게 빌드할 수 있도록 설계된 풀스택 스타터 킷 아키텍처입니다.

기획 요구사항에 따라 백엔드 아키텍처(**Supabase vs Next.js Native**)와 앱 껍데기 스택(**Capacitor vs Flutter**)을 유연하게 선택하여 작동하도록 가이드라인이 표준화되어 있습니다.

---

## 🛠️ Tech Stack Matrix

| Layer | Technology | Status | Role |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Next.js (App Router)** | 🔒 Fixed | Core Web Application |
| **Styling** | **Tailwind CSS** | 🔒 Fixed | Utility-First Responsive UI |
| **Components** | **Shadcn UI** | 🔒 Fixed | Mobile-Optimized Radix Primitives |
| **Backend** | **Supabase** OR **Next.js API** | 🔀 Dynamic | Auth, Database, and Business Logic |
| **App Shell** | **Capacitor** OR **Flutter** | 🔀 Dynamic | Native WebView Wrapper |

---

## 📐 Architecture Overview

이 프로젝트는 무의미한 플레이스홀더 코드를 양산하는 대신, AI가 프로젝트의 구조를 완벽히 이해하도록 돕는 가이드라인 문서를 중심으로 작동합니다.

- **[`./app-architecture.md`](./app-architecture.md)**: AI가 코드를 생성할 때 반드시 준수해야 하는 백엔드/앱 껍데기 선택 분기점 및 모바일 UI/UX 제약 조건이 명시된 마스터 지침서입니다.

### 🔀 Decision Fork for AI

AI 어시스턴트는 기획 요구사항에 따라 아래 구조를 자동으로 채택합니다.

#### 1. Backend Layer

| Case | Stack | 선택 기준 |
| :--- | :--- | :--- |
| **CASE 1** | **Supabase** | 빠른 프로토타이핑, 소셜/이메일 인증, 실시간 기능 (채팅, 라이브 트래킹) |
| **CASE 2** | **Next.js API Routes + ORM** | 복잡한 서버 비즈니스 로직, 다단계 써드파티 API 연동, 완전한 모놀리식 아키텍처 |

#### 2. App Shell Layer

| Case | Stack | 선택 기준 |
| :--- | :--- | :--- |
| **CASE A** | **Capacitor** | 표준 웹앱, 이커머스, 커뮤니티, AI 대시보드, 경량 O2O 서비스 |
| **CASE B** | **Flutter WebView** | 백그라운드 GPS/오디오 스트리밍, 15분 미만 주기의 백그라운드 태스크, 지속적 BLE 통신 |

---

## 🚀 How to Use

### 1. 레포 클론

```bash
git clone https://github.com/your-org/webview-vibe-stack.git
cd webview-vibe-stack
npm install
```

### 2. 프로젝트 생성

```bash
npm run create
```

대화형 CLI가 아래 질문을 순서대로 물어봅니다.

```
🚀 webview-vibe-stack

✔ Project name: · my-app
✔ Backend: › Supabase  (BaaS — auth, DB, realtime)
✔ App shell: › Capacitor  (standard web features)

  Summary
  Name:    my-app
  Backend: supabase
  Shell:   capacitor

✔ Create project? · yes

✓ Done!

Project created at projects/my-app/
```

### 3. 생성된 프로젝트 실행

**Capacitor 선택 시:**
```bash
cd projects/my-app
npm install
npm run dev
```

**Flutter 선택 시:**
```bash
# 웹 앱
cd projects/my-app/web
npm install && npm run dev

# Flutter 네이티브
cd projects/my-app/native
flutter pub get && flutter run
```

### 4. AI 컨텍스트로 제공

생성된 프로젝트를 Cursor, Claude Code 등 AI 어시스턴트에게 열어주고, `app-architecture.md`를 함께 제공하세요.

```
app-architecture.md를 읽고, 아래 요구사항에 맞는 기능을 개발해줘.
```

---

## 📁 Generated Project Structure

### CASE A — Capacitor

```
projects/my-app/
├── app/
│   ├── layout.tsx          # max-w-md 모바일 래퍼
│   ├── page.tsx
│   └── api/hello/route.ts  # Next.js API Routes (CASE 2 선택 시)
├── lib/
│   ├── native-bridge.ts    # Web-to-Native 브리지
│   └── supabase.ts         # Supabase 클라이언트 (CASE 1 선택 시)
├── capacitor.config.ts
├── next.config.ts          # output: 'export' 적용
└── package.json
```

### CASE B — Flutter

```
projects/my-app/
├── web/                    # Next.js 프로젝트
│   ├── app/
│   ├── lib/
│   │   ├── native-bridge.ts
│   │   └── supabase.ts     # CASE 1 선택 시
│   └── package.json
└── native/                 # Flutter 래퍼
    ├── lib/main.dart       # WebView + NativeBridge 채널
    └── pubspec.yaml
```

---

## 🌉 Web-to-Native Bridge

Capacitor와 Flutter 양쪽을 모두 지원하는 표준화된 브리지 패턴을 사용합니다.

```typescript
// lib/native-bridge.ts
export const sendNativeMessage = (action: string, data: any = {}) => {
  const message = JSON.stringify({ action, data });

  // CASE A: Capacitor
  if (window.Capacitor?.Plugins) {
    // Capacitor 플러그인 호출
  }
  // CASE B: Flutter JavaScriptChannel
  else if (window.JavaScriptChannel) {
    window.JavaScriptChannel.postMessage(message);
  }
};
```

---

## 📋 Mobile UI/UX Checklist

WebView가 네이티브 앱처럼 느껴지도록 아래 규칙을 반드시 적용합니다.

- [ ] 레이아웃 래퍼에 `max-w-md mx-auto` 적용 (모바일 뷰포트 고정)
- [ ] 모든 인터랙티브 요소에 최소 터치 타겟 `h-11` (44px) 적용
- [ ] 텍스트/이미지 선택 방지: `select-none`, `pointer-events-none`
- [ ] 하단 시트/메뉴에 Shadcn `Drawer` 컴포넌트 사용
- [ ] 로딩 상태에 Shadcn `Skeleton` 컴포넌트 사용
- [ ] 피드백에 Shadcn `Toast` 컴포넌트 사용

---

## 📄 License

MIT
