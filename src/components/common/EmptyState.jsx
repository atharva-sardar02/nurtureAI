/**
 * Empty State Component
 * Reusable empty state with icon, message, and optional action
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

/**
 * EmptyState Component
 * @param {Object} props
 * @param {string} props.title - Title text
 * @param {string} props.description - Description text
 * @param {LucideIcon} props.icon - Icon component
 * @param {string} props.actionLabel - Optional action button label
 * @param {Function} props.onAction - Optional action button handler
 * @param {string} props.variant - Variant: 'default' | 'minimal' | 'illustrated'
 */
export function EmptyState({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
  variant = 'default',
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {variant === 'illustrated' && Icon && (
        <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center mb-6">
          <Icon className="w-12 h-12 text-muted-foreground" />
        </div>
      )}
      {variant === 'default' && Icon && (
        <Icon className="w-16 h-16 text-muted-foreground mb-4" />
      )}
      {variant === 'minimal' && Icon && (
        <Icon className="w-12 h-12 text-muted-foreground mb-3" />
      )}

      <h3 className="text-lg font-semibold text-foreground mb-2 text-center">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * EmptyStateCard Component
 * Empty state wrapped in a card
 */
export function EmptyStateCard({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
  variant = 'default',
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-0">
        <EmptyState
          title={title}
          description={description}
          icon={Icon}
          actionLabel={actionLabel}
          onAction={onAction}
          variant={variant}
        />
      </CardContent>
    </Card>
  );
}

