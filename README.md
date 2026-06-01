# webview-vibe-stack

모바일 WebView 앱용 풀스택 스타터 킷. Cursor·Bolt·Lovable 같은 AI 도구로 작업할 때 레이아웃과 분기 규칙을 맞추기 쉽게 잡아 둔 저장소다.

백엔드는 **Supabase** 또는 **Next.js API**, 앱 껍데기는 **Capacitor** 또는 **Flutter** 중에서 고른다. 선택 기준은 [`app-architecture.md`](./app-architecture.md)에 정리돼 있다.

---

## Tech Stack

| Layer | Technology | Status | Role |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Next.js (App Router)** | Fixed | Core web app |
| **Styling** | **Tailwind CSS** | Fixed | Responsive UI |
| **Components** | **Shadcn UI** | Fixed | Mobile-friendly Radix primitives |
| **Backend** | **Supabase** or **Next.js API** | Choose at scaffold | Auth, DB, business logic |
| **App shell** | **Capacitor** or **Flutter** | Choose at scaffold | Native WebView wrapper |

---

## Architecture

플레이스홀더 파일을 쌓기보다, AI가 읽을 지침 문서를 기준으로 둔다.

- **[`app-architecture.md`](./app-architecture.md)**: 백엔드·앱 셸 분기, 모바일 UI/UX 제약

### Backend

| Case | Stack | When |
| :--- | :--- | :--- |
| **1** | **Supabase** | 빠른 프로토타입, 소셜/이메일 로그인, 실시간(채팅, 라이브 위치) |
| **2** | **Next.js API Routes + ORM** | 복잡한 서버 로직, 여러 써드파티 API, 모놀리스 한 repo |

### App shell

| Case | Stack | When |
| :--- | :--- | :--- |
| **A** | **Capacitor** | 일반 웹앱, 커머스, 커뮤니티, 대시보드, 경량 O2O |
| **B** | **Flutter WebView** | 백그라운드 GPS/오디오, 15분 미만 주기 작업, BLE 상시 연결 |

---

## Use

### 1. Clone

```bash
git clone https://github.com/anxi0/webview-vibe-stack.git
cd webview-vibe-stack
npm install
```

### 2. Scaffold

```bash
npm run create
```

CLI가 이름, 백엔드, 앱 셸을 묻는다.

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

### 3. Run the generated app

**Capacitor:**

```bash
cd projects/my-app
npm install
npm run dev
```

**Flutter:**

```bash
# Web
cd projects/my-app/web
npm install && npm run dev

# Native
cd projects/my-app/native
flutter pub get && flutter run
```

### 4. Open in your AI editor

생성된 폴더를 Cursor나 Claude Code로 연다. `app-architecture.md`를 컨텍스트에 넣고 요구사항을 적는다.

```
app-architecture.md를 읽고, 아래 요구사항에 맞는 기능을 개발해줘.
```

---

## Generated layout

### Case A — Capacitor

```
projects/my-app/
├── app/
│   ├── layout.tsx          # max-w-md mobile wrapper
│   ├── page.tsx
│   └── api/hello/route.ts  # Next.js API (Case 2)
├── lib/
│   ├── native-bridge.ts
│   └── supabase.ts         # Case 1
├── capacitor.config.ts
├── next.config.ts          # output: 'export'
└── package.json
```

### Case B — Flutter

```
projects/my-app/
├── web/
│   ├── app/
│   ├── lib/
│   │   ├── native-bridge.ts
│   │   └── supabase.ts     # Case 1
│   └── package.json
└── native/
    ├── lib/main.dart       # WebView + JavaScriptChannel
    └── pubspec.yaml
```

---

## Web-to-native bridge

Capacitor와 Flutter가 같은 `native-bridge.ts` 패턴을 쓴다.

```typescript
// lib/native-bridge.ts
export const sendNativeMessage = (action: string, data: any = {}) => {
  const message = JSON.stringify({ action, data });

  if (window.Capacitor?.Plugins) {
    // Capacitor plugin call
  } else if (window.JavaScriptChannel) {
    window.JavaScriptChannel.postMessage(message);
  }
};
```

---

## Mobile UI checklist

WebView가 네이티브처럼 보이게 하려면:

- [ ] Layout: `max-w-md mx-auto`
- [ ] Touch targets: at least `h-11` (44px)
- [ ] Disable stray selection: `select-none`, `pointer-events-none` where needed
- [ ] Bottom sheets: Shadcn `Drawer`
- [ ] Loading: Shadcn `Skeleton`
- [ ] Feedback: Shadcn `Toast`

---

## License

MIT
