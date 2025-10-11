import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FrequencyAnalysis } from "@/components/analysis/FrequencyAnalysis";
import { PatternAnalysis } from "@/components/analysis/PatternAnalysis";
import { TimeSeriesAnalysis } from "@/components/analysis/TimeSeriesAnalysis";
import { MachineLearningPrediction } from "@/components/analysis/MachineLearningPrediction";
import { CoOccurrenceAnalysis } from "@/components/analysis/CoOccurrenceAnalysis";
import { IntegratedRecommendation } from "@/components/analysis/IntegratedRecommendation";
import { SumBasedRecommendations } from "@/components/analysis/SumBasedRecommendations";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12">
      <div className="w-full max-w-7xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">
          로또 번호 분석 대시보드
        </h1>
        <Tabs defaultValue="frequency">
          <TabsList className="grid w-full grid-cols-7 mb-4">
            <TabsTrigger value="frequency">번호 빈도 분석</TabsTrigger>
            <TabsTrigger value="patterns">패턴 분석</TabsTrigger>
            <TabsTrigger value="timeseries">시계열 분석</TabsTrigger>
            <TabsTrigger value="ml">머신러닝 예측</TabsTrigger>
            <TabsTrigger value="co-occurrence">동시 출현 분석</TabsTrigger>
            <TabsTrigger value="integrated">통합 분석 추천</TabsTrigger>
            <TabsTrigger value="sum-based">합계 기반 추천</TabsTrigger>
          </TabsList>
          <TabsContent value="frequency">
            <FrequencyAnalysis />
          </TabsContent>
          <TabsContent value="patterns">
            <PatternAnalysis />
          </TabsContent>
          <TabsContent value="timeseries">
            <TimeSeriesAnalysis />
          </TabsContent>
          <TabsContent value="ml">
            <MachineLearningPrediction />
          </TabsContent>
          <TabsContent value="co-occurrence">
            <CoOccurrenceAnalysis />
          </TabsContent>
          <TabsContent value="integrated">
            <IntegratedRecommendation />
          </TabsContent>
          <TabsContent value="sum-based">
            <SumBasedRecommendations />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}