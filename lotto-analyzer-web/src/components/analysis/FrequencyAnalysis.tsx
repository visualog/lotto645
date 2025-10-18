"use client"; // This component needs client-side features

"use client"; // This component needs client-side features

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PredictionCard } from "./PredictionCard";
import { HelpCircle } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- Helper Functions ---
function getBallColor(number: number): string {
  if (number <= 10) return "bg-yellow-400";
  if (number <= 20) return "bg-blue-500 text-white";
  if (number <= 30) return "bg-red-500 text-white";
  if (number <= 40) return "bg-gray-600 text-white";
  return "bg-green-500 text-white";
}

// --- Type Definitions ---
type AnalysisResult = {
  number: number;
  count: number;
};

type FrequencyData = {
  hotNumbers: AnalysisResult[];
  coldNumbers: AnalysisResult[];
  hotBonusNumbers: AnalysisResult[];
  coldBonusNumbers: AnalysisResult[];
};

type MlPredictionData = {
  hot_numbers_prediction: number[];
  overdue_numbers_prediction: number[];
};

// --- Component Interfaces ---
interface AnalysisTableProps {
  title: string;
  description: string;
  tooltipContent: string;
  data: AnalysisResult[];
  type: "hot" | "cold" | "hot-bonus" | "cold-bonus";
}

interface FrequencyChartProps {
  data: AnalysisResult[];
}

// --- Sub-components ---
function AnalysisTable({ title, description, tooltipContent, data, type }: AnalysisTableProps) {
  const headerClass = cn("text-center", {
    "bg-red-100 dark:bg-red-900/50": type === "hot",
    "bg-blue-100 dark:bg-blue-900/50": type === "cold",
    "bg-green-100 dark:bg-green-900/50": type.includes("bonus"),
  });

  return (
    <Card>
      <CardHeader className={cn(headerClass, "rounded-t-lg")}>
        <CardTitle className="flex items-center justify-center gap-2">
          {title}
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-gray-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltipContent}</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-1/2">번호</TableHead>
              <TableHead className="text-center w-1/2">횟수</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.number} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <TableCell className="text-center font-medium">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center mx-auto",
                      getBallColor(item.number)
                    )}
                  >
                    {item.number}
                  </div>
                </TableCell>
                <TableCell className="text-center text-lg font-bold">
                  {item.count}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function FrequencyChart({ data }: FrequencyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="number" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" name="출현 횟수">
          {data.map((entry, index) => (
            <Bar
              key={`cell-${index}`}
              dataKey="count"
              fill={getBallColor(entry.number).split(" ")[0]} // Use the background color
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// --- Main Component ---
export function FrequencyAnalysis() {
  const [frequencyData, setFrequencyData] = useState<FrequencyData | null>(null);
  const [mlPredictionData, setMlPredictionData] = useState<MlPredictionData | null>(null);
  const [hitRate, setHitRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
    const fetchData = async () => {
      try {
        const [frequencyRes, mlRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/analysis/frequency`),
          fetch(`${API_BASE_URL}/api/recommendations/ml`),
        ]);

        if (!frequencyRes.ok) throw new Error(`Frequency API error! status: ${frequencyRes.status}`);
        if (!mlRes.ok) throw new Error(`ML API error! status: ${mlRes.status}`);

        const frequencyJson: FrequencyData = await frequencyRes.json();
        const mlJson: MlPredictionData = await mlRes.json();

        setFrequencyData(frequencyJson);
        setMlPredictionData(mlJson);

      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!mlPredictionData) return;

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
    const fetchHitRate = async () => {
      try {
        const params = new URLSearchParams();
        mlPredictionData.hot_numbers_prediction.forEach(n => params.append('numbers', String(n)));
        const res = await fetch(`${API_BASE_URL}/api/recommendations/hit-rate?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json = await res.json();
        setHitRate(json.hit_rate);
      } catch (e) {
        console.error("Failed to fetch hit rate:", e);
      }
    };

    fetchHitRate();
  }, [mlPredictionData]);

  if (loading) return <div className="text-center py-8">데이터를 불러오는 중...</div>;
  if (error) return <div className="text-center py-8 text-red-500">오류 발생: {error}</div>;
  if (!frequencyData || !mlPredictionData) return null;

  const allNumbers = [...frequencyData.hotNumbers, ...frequencyData.coldNumbers].sort((a, b) => a.number - b.number);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>번호 출현 빈도</CardTitle>
          <CardDescription>가장 많이 나온 번호와 가장 적게 나온 번호의 출현 빈도를 보여줍니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <FrequencyChart data={allNumbers} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AnalysisTable
          title="가장 많이 나온 번호"
          description="자주 나오는 번호는 다음에도 나올 확률이 높을 수 있습니다."
          tooltipContent="'핫' 번호는 통계적으로 다른 번호보다 자주 출현한 번호입니다. 과거 데이터에 기반한 경향이며, 미래의 당첨을 보장하지는 않습니다."
          data={frequencyData.hotNumbers}
          type="hot"
        />
        <AnalysisTable
          title="가장 적게 나온 번호"
          description="오랫동안 나오지 않은 번호는 나올 때가 되었을 수 있습니다."
          tooltipContent="'콜드' 번호는 통계적으로 다른 번호보다 드물게 출현한 번호입니다. '오랫동안 나오지 않았으니 이제 나올 때가 됐다'는 생각(도박사의 오류)에 주의해야 합니다."
          data={frequencyData.coldNumbers}
          type="cold"
        />
        <AnalysisTable
          title="가장 많이 나온 보너스 번호"
          description="보너스 번호의 경향성을 파악합니다."
          tooltipContent="보너스 번호 중 가장 자주 출현한 번호입니다. 2등 당첨에 영향을 미치는 번호의 경향성을 보여줍니다."
          data={frequencyData.hotBonusNumbers}
          type="hot-bonus"
        />
        <AnalysisTable
          title="가장 적게 나온 보너스 번호"
          description="드물게 나오는 보너스 번호를 확인합니다."
          tooltipContent="보너스 번호 중 가장 드물게 출현한 번호입니다. 주 번호와는 다른 경향성을 보일 수 있습니다."
          data={frequencyData.coldBonusNumbers}
          type="cold-bonus"
        />
      </div>

      <PredictionCard
        title="'핫 넘버' 기반 추천"
        description="가장 자주 나온 번호는 다음 회차에서도 다시 나올 확률이 높다는 통계적 경향을 이용합니다. 이 추천 번호는 최근까지 가장 많이 나온 번호 6개를 조합한 것입니다."
        numbers={mlPredictionData.hot_numbers_prediction}
        confidence={hitRate}
      />
    </div>
  );
}
