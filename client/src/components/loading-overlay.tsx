interface LoadingOverlayProps {
  isVisible: boolean;
}

export function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          <span className="text-white font-medium">Loading...</span>
        </div>
      </div>
    </div>
  );
}