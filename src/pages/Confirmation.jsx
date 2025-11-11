/**
 * Confirmation Page
 * Displays appointment confirmation
 */

import { AppointmentConfirmation } from "@/components/scheduling/AppointmentConfirmation"
import { Layout } from "@/components/common/Layout"

export default function Confirmation() {
  return (
    <Layout>
      <AppointmentConfirmation />
    </Layout>
  );
}

