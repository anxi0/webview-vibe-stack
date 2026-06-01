export const sendNativeMessage = (action: string, data: unknown = {}) => {
  const message = JSON.stringify({ action, data });

  if ((window as any).Capacitor?.Plugins) {
    (window as any).Capacitor.Plugins.App?.sendMessage?.({ message });
  } else if ((window as any).NativeBridge) {
    (window as any).NativeBridge.postMessage(message);
  }
};
