/**
 * Network Status Component
 * Displays in-network vs out-of-network status
 */

import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * NetworkStatus Component
 * @param {Object} props
 * @param {boolean} props.inNetwork - Whether the clinician is in-network
 * @param {string} props.status - Status string ('in-network', 'out-of-network', 'unknown')
 * @param {string} props.className - Additional CSS classes
 */
export function NetworkStatus({ inNetwork, status = 'unknown', className }) {
  const getStatusConfig = () => {
    switch (status.toLowerCase()) {
      case 'in-network':
        return {
          variant: 'default',
          icon: CheckCircle2,
          text: 'In-Network',
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        };
      case 'out-of-network':
        return {
          variant: 'secondary',
          icon: XCircle,
          text: 'Out-of-Network',
          className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        };
      default:
        return {
          variant: 'outline',
          icon: AlertCircle,
          text: 'Status Unknown',
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1",
        config.className,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="text-xs font-semibold">{config.text}</span>
    </Badge>
  );
}

