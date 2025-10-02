import { Clock } from "lucide-react";

interface TimerProps {
  timeSpent: number;
}

export default function Timer({ timeSpent }: TimerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getColorClass = () => {
    if (timeSpent > 120) return "text-red-600"; // Over 2 minutes
    if (timeSpent > 60) return "text-orange-600"; // Over 1 minute
    return "text-gray-900";
  };

  return (
    <div className="flex items-center space-x-2">
      <Clock className={`h-5 w-5 ${timeSpent > 120 ? 'text-red-600' : 'text-orange-600'}`} />
      <span className={`font-mono text-lg font-semibold ${getColorClass()}`}>
        {formatTime(timeSpent)}
      </span>
    </div>
  );
}
