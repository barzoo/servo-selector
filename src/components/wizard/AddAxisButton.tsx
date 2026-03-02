'use client';

interface AddAxisButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function AddAxisButton({ onClick, disabled }: AddAxisButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="
        w-full p-3 rounded-lg border border-dashed border-gray-300
        text-gray-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50
        transition-colors flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    >
      <span>➕</span>
      <span className="font-medium">添加新轴</span>
    </button>
  );
}
