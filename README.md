# webview-vibe-stack

Full-stack starter for mobile WebView apps. You pick backend and native shell once; the repo gives AI tools (Cursor, Bolt, Lovable, Claude Code) the same layout and branching rules so generated code stays consistent.

Backend: **Supabase** or **Next.js API**. App shell: **Capacitor** or **Flutter**. Pick criteria live in [`app-architecture.md`](./app-architecture.md).

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

We ship guidance docs, not a pile of placeholder files. Point your agent at them before it writes code.

- **[`app-architecture.md`](./app-architecture.md)**: backend and shell branches, mobile UI/UX constraints

### Backend

| Case | Stack | When |
| :--- | :--- | :--- |
| **1** | **Supabase** | Fast prototype, social/email auth, realtime (chat, live location) |
| **2** | **Next.js API Routes + ORM** | Heavy server logic, many third-party APIs, one monorepo |

### App shell

| Case | Stack | When |
| :--- | :--- | :--- |
| **A** | **Capacitor** | Typical web app, commerce, community, dashboard, light O2O |
| **B** | **Flutter WebView** | Background GPS/audio, jobs under ~15 minutes, always-on BLE |

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

The CLI asks for project name, backend, and app shell.

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

Open the generated folder in Cursor or Claude Code. Add `app-architecture.md` to context, then describe what you want.

```
Read app-architecture.md and build the feature below.
```

### 5. Idea to shipped code (Claude Code skills)

Run these [Superpowers](https://github.com/obra/superpowers) / gstack slash commands in order before you let the agent loose on `main`. Same order works in Cursor if you have the commands installed.

| Step | Skill | You get |
| :---: | :--- | :--- |
| 1 | **`/office-hours`** | Hard questions on problem, demand, and wedge. No code. | Draft design under `~/.gstack/projects/.../*-design-*.md` |
| 2 | **`/brainstorming`** | Repo-aware Q&A, two or three approaches, design sign-off before any implementation. | `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` |
| 3 | **`/writing-plans`** | Task list with file paths, tests, and commit steps from the approved spec. | `docs/superpowers/plans/YYYY-MM-DD-<feature>.md` |
| 4 | **`/using-git-worktrees`** | Isolated worktree (or editor workspace), deps installed, baseline tests green. | Separate working directory |
| 5 | **`/subagent-driven-development`** | One subagent per plan task, spec check then code review, then commit. | Small commits, tests passing |

Flow: `/office-hours` nails why → `/brainstorming` locks what → `/writing-plans` splits how → `/using-git-worktrees` gives you a safe branch → `/subagent-driven-development` runs the plan.

**Where to start**

- Vague idea: step 1.
- Requirements already written: step 2.
- Need demand proof or wedge clarity: prefer `/office-hours`.
- Tweaking a feature inside this repo: prefer `/brainstorming`.
- After step 3, tell the agent: run `/subagent-driven-development` on the plan file. For a second session in parallel, use `/executing-plans` (see Superpowers docs).

**Sample prompts** (inside `projects/my-app`)

```text
/office-hours
I want a push opt-in flow on this Capacitor + Supabase app.
Start with who needs it, the smallest wedge, and how we know it worked.
```

```text
/brainstorming
Use the office-hours design. Lock opt-in UI and Supabase wiring.
Follow the mobile checklist in app-architecture.md.
```

```text
/writing-plans
Write an implementation plan from docs/superpowers/specs/...-design.md.
```

```text
/using-git-worktrees
Create an isolated workspace on branch feature/push-opt-in.
```

```text
/subagent-driven-development
Execute docs/superpowers/plans/...-plan.md task by task.
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

Capacitor and Flutter share the same `native-bridge.ts` pattern.

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

Before you ship, check:

- [ ] Layout: `max-w-md mx-auto`
- [ ] Touch targets: at least `h-11` (44px)
- [ ] Disable stray selection: `select-none`, `pointer-events-none` where needed
- [ ] Bottom sheets: Shadcn `Drawer`
- [ ] Loading: Shadcn `Skeleton`
- [ ] Feedback: Shadcn `Toast`

---

## License

MIT
