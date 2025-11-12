/**
 * Scheduling Page
 * Main page for appointment scheduling
 */

import { lazy, Suspense } from "react";
import { Layout } from "@/components/common/Layout";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

// Lazy load the SchedulingCalendar to avoid circular dependency issues
const SchedulingCalendar = lazy(() => import("@/components/scheduling/SchedulingCalendar").then(module => ({ default: module.SchedulingCalendar })));

export default function Scheduling() {
  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner fullPage message="Loading scheduler..." />}>
        <SchedulingCalendar />
      </Suspense>
    </Layout>
  );
}

