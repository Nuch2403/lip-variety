interface ConfirmModalProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  title?: string;
}

export default function ConfirmModal({
  open,
  message,
  onConfirm,
  onCancel,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  title = "ยืนยันการดำเนินการ",
}: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm">
      <div className="admin-modal">
        <div className="text-lg font-semibold text-ink">{title}</div>
        <div className="mt-2 text-sm text-ink/70 leading-relaxed">{message}</div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="admin-btn-ghost" onClick={onCancel}>
            {cancelText}
          </button>
          <button type="button" className="admin-btn-primary" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
