import { useEffect } from "react";

export default function MiniToast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClose?.(), 1250);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-2xl border bg-white px-4 py-3 shadow-lg text-sm">
      {message}
    </div>
  );
}
