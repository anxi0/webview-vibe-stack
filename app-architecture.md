# Mobile WebView App Architecture Guide

This document defines the core architecture, tech stack constraints, and guidelines that the AI Assistant must follow when developing the mobile WebView application and full-stack web app. Always reference this guide before generating code or configuring environments.

---

## 1. Frontend & UI Stack (Fixed)

The frontend and design system are strictly locked to ensure consistency, eliminate CSS file pollution, and maximize AI code-generation accuracy.

- **Frontend Framework:** Next.js (App Router), TypeScript
- **Styling:** Tailwind CSS (Utility-first only; do NOT create separate CSS files)
- **UI Components:** Shadcn UI (Built on Radix UI Primitives, highly optimized for mobile)

---

## 2. Dynamic Backend Architecture Selection (Supabase vs. Next.js Backend)

The AI must evaluate the backend requirements based on the feature complexity and choose the optimal backend strategy.

### 📌 [BACKEND CASE 1] Supabase (Backend-as-a-Service)
- **Selection Criteria:** Requires rapid prototyping, standard authentication (Social/Email), instant database CRUD operations, or real-time features (e.g., chat, live tracking).
- **AI Guideline:** Leverage Supabase Auth and PostgreSQL directly via the `@supabase/supabase-js` client. Use Supabase Realtime Subscriptions (`supabase.channel()`) to update the UI instantly without manual polling or app reloads.

### 📌 [BACKEND CASE 2] Next.js Native Backend (API Routes + ORM)
- **Selection Criteria:** Requires complex server-side business logic, heavy data transformation, multi-step third-party API integrations (e.g., legacy PG payment gateways, custom ERPs), or a fully self-contained monolithic architecture.
- **AI Guideline:** Create secure API endpoints under the `app/api/` directory using Next.js Route Handlers. Use an ORM like Prisma or Drizzle to connect to the database, ensuring type safety between the frontend and backend.

---

## 3. Dynamic App Shell Selection (Capacitor vs. Flutter)

The AI must analyze the mobile feature requirements—specifically background processing and native hardware access—to determine the appropriate native wrapper.

### 📌 [APP SHELL CASE A] Capacitor (Web-Centric Wrapper)
- **Selection Criteria:** Standard web applications, e-commerce, community boards, AI dashboards, or lightweight O2O services.
- **Feature Scope:** Standard push notifications (FCM), native camera/gallery access, biometric authentication, and basic web capabilities.
- **AI Guideline:** Treat the app as a pure web app. Generate a `capacitor.config.ts` configuration file to package the Next.js production build (`out` directory) directly into an iOS/Android binary.

### 📌 [APP SHELL CASE B] Flutter (Native-Centric Wrapper)
- **Selection Criteria:** Apps requiring robust, unrestricted background execution, or persistent hardware control.
- **Feature Scope:** Continuous background GPS tracking (e.g., running/navigation apps), background audio streaming, precise low-interval background tasks (under 15 minutes), or continuous Bluetooth/BLE communication.
- **AI Guideline:** Use Flutter's `webview_flutter` package to render the Next.js web app. Implement heavy background or hardware logic natively inside Flutter using packages like `flutter_background_service` or `workmanager`. Bridge the communication via `JavaScriptChannel`.

---

## 4. Mobile WebView UI/UX Optimization Rules

To make the WebView feel like a truly native mobile application, apply these styling and interactive constraints to the web code:

- **Viewport Lock:** Force layouts to a mobile-first aspect ratio using a centralized wrapper bounded by `max-w-md` and centered on the desktop screen.
- **Native Touch Feel:** Ensure all interactive elements have a minimum touch target of `h-11` (44px). Apply Tailwind selection-preventing utilities (`select-none`, `pointer-events-none`) appropriately to stop accidental web-like text highlighting and image dragging.
- **Mobile Interaction Patterns:** Use Shadcn UI's `Drawer` component for bottom sheets and menus. Utilize `Skeleton` and `Toast` components to mimic native platform UI feedback.

---

## 5. Web-to-Native Communication (Bridge) Standard

Regardless of the App Shell chosen (Capacitor or Flutter), use this standardized bridge pattern when the Next.js web code needs to trigger native device actions.

```typescript
export const sendNativeMessage = (action: string, data: any = {}) => {
  const message = JSON.stringify({ action, data });
  
  // CASE A: Capacitor Environment
  if (window.Capacitor?.Plugins) {
    // Invoke specific Capacitor plugin or custom listener
  } 
  // CASE B: Flutter WebView Channel Environment
  else if (window.JavaScriptChannel) {
    window.JavaScriptChannel.postMessage(message);
  }
};
```
