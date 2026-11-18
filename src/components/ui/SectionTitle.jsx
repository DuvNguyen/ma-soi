import React from 'react';

/**
 * Standardized Section Title inside Cards and Views
 */
export default function SectionTitle({
  title,
  subtitle = null,
  badge = null,
  icon: Icon = null,
  className = '',
  action = null
}) {
  return (
    <div className={`flex items-center justify-between gap-2.5 pb-2 border-b border-[var(--color-line)]/60 ${className}`}>
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon className="w-4 h-4 text-[var(--color-ink-muted)] shrink-0" aria-hidden="true" />}
        <h3 className="font-semibold text-title text-slate-100 tracking-wide truncate">
          {title}
        </h3>
        {badge}
      </div>
      {subtitle && (
        <span className="text-caption text-[var(--color-ink-muted)] shrink-0">
          {subtitle}
        </span>
      )}
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
