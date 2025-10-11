import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface PredictionCardProps {
  title: string;
  description: string;
  numbers: number[];
}

export function PredictionCard({ title, description, numbers }: PredictionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center items-center gap-2">
        {numbers.map((num) => (
          <div
            key={num}
            className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-xl"
          >
            {num}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
