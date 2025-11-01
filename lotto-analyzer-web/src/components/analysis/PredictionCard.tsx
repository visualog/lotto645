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
}

function getBallColor(number: number): string {
  if (number <= 10) return "bg-yellow-400";
  if (number <= 20) return "bg-blue-500 text-white";
  if (number <= 30) return "bg-red-500 text-white";
  if (number <= 40) return "bg-gray-600 text-white";
  return "bg-green-500 text-white";
}

export function PredictionCard({ title, description, numbers }: PredictionCardProps) {
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
      </CardContent>
    </Card>
  );
}
