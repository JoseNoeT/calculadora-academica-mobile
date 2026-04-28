import React from 'react';

import { AppBadge } from '../ui';

type AcademicStatus = 'pendiente' | 'aprobado' | 'alcanzable' | 'en riesgo' | 'no alcanzable' | 'reprobado';

type StatusBadgeProps = {
  status: AcademicStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const toneMap = {
    pendiente: 'pending',
    aprobado: 'success',
    alcanzable: 'info',
    'en riesgo': 'warning',
    'no alcanzable': 'danger',
    reprobado: 'danger',
  } as const;

  return <AppBadge label={status} tone={toneMap[status]} />;
}
