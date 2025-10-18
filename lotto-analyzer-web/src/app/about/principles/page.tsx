import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrinciplesPage() {
  const principles = [
    {
      title: "투명성 (Transparency)",
      description: "모든 분석과 추천의 근거가 되는 데이터와 알고리즘의 기본 원리를 명확하게 공개합니다.",
    },
    {
      title: "신뢰성 (Reliability)",
      description: "과장된 예측이나 사행성을 조장하지 않으며, 통계적 사실과 데이터의 한계를 정직하게 전달합니다.",
    },
    {
      title: "사용자 제어 (User Control)",
      description: "사용자가 직접 분석 조건을 설정하고, 원하는 방식으로 추천을 받을 수 있는 선택권을 최대한 보장합니다.",
    },
    {
      title: "직관성 (Intuitiveness)",
      description: "복잡한 통계 데이터라도 누구나 쉽게 이해하고 활용할 수 있도록 직관적인 시각화와 쉬운 해설을 제공합니다.",
    },
    {
      title: "책임감 (Responsibility)",
      description: "로또는 확률 기반의 게임임을 항상 명시하고, 사용자의 건전하고 책임감 있는 이용을 권장합니다.",
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">서비스 디자인 원칙</h1>
        <p className="text-lg text-muted-foreground mb-8">
          저희 로또 번호 분석 대시보드는 다음 5가지 핵심 원칙을 기반으로 설계되고 운영됩니다. 저희는 이 원칙들을 지키며 사용자에게 신뢰할 수 있고 유용한 서비스를 제공하기 위해 끊임없이 노력합니다.
        </p>
        <div className="grid gap-6 md:grid-cols-1">
          {principles.map((principle, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{`${index + 1}. ${principle.title}`}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base">{principle.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
