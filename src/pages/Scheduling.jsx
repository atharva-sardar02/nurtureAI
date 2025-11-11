/**
 * Scheduling Page
 * Main page for appointment scheduling
 */

import { SchedulingCalendar } from "@/components/scheduling/SchedulingCalendar"
import { Layout } from "@/components/common/Layout"

export default function Scheduling() {
  return (
    <Layout>
      <SchedulingCalendar />
    </Layout>
  );
}

