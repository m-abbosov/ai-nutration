import { Suspense, lazy } from "react";

import { useParams } from "react-router-dom";

import { ComingSoonPage } from "@/pages/coming-soon/coming-soon-page";

import { FullscreenSpinner } from "@/shared/ui/fullscreen-spinner";

import type { CalculatorId } from "@/entities/calculator/lib/calculators";

const REGISTRY: Record<CalculatorId, ReturnType<typeof lazy>> = {
  bmi: lazy(() => import("./bmi-page")),
  bodyfat: lazy(() => import("./bodyfat-page")),
  ideal: lazy(() => import("./ideal-page")),
  bmr: lazy(() => import("./bmr-page")),
  tdee: lazy(() => import("./tdee-page")),
  calories: lazy(() => import("./calories-page")),
  macros: lazy(() => import("./macros-page")),
  protein: lazy(() => import("./protein-page")),
  water: lazy(() => import("./water-page")),
  pace: lazy(() => import("./pace-page")),
  burned: lazy(() => import("./burned-page")),
  orm: lazy(() => import("./orm-page")),
  hr: lazy(() => import("./hr-page")),
  lbm: lazy(() => import("./lbm-page")),
};

export function CalculatorRoute() {
  const { slug } = useParams<{ slug: string }>();
  const Page = slug ? REGISTRY[slug as CalculatorId] : undefined;

  if (!Page) return <ComingSoonPage />;

  return (
    <Suspense fallback={<FullscreenSpinner />}>
      <Page />
    </Suspense>
  );
}
