import { Loader2 } from "lucide-react";

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-900">Carregando perguntas...</p>
        <p className="text-sm text-gray-600">Preparando seu quiz personalizado</p>
      </div>
    </div>
  );
}
