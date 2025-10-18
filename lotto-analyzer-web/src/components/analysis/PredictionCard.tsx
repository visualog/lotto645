import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PredictionCardProps {
  title: string;
  description: string;
  numbers: number[];
  confidence: number;
}

function getBallColor(number: number): string {
  if (number <= 10) return "bg-yellow-400";
  if (number <= 20) return "bg-blue-500 text-white";
  if (number <= 30) return "bg-red-500 text-white";
  if (number <= 40) return "bg-gray-600 text-white";
  return "bg-green-500 text-white";
}

export function PredictionCard({ title, description, numbers, confidence }: PredictionCardProps) {
  const getConfidenceColor = (value: number) => {
    if (value < 50) return "bg-red-500";
    if (value < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center items-center gap-2">
          {numbers.map((num) => (
            <div
              key={num}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl",
                getBallColor(num)
              )}
            >
              {num}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">추천 신뢰도</h4>
            <span className="text-lg font-bold">{confidence}%</span>
          </div>
          <Progress value={confidence} className={cn(getConfidenceColor(confidence))} />
        </div>
      </CardContent>
    </Card>
  );
}
