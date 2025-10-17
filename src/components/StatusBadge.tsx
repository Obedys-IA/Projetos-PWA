import React from 'react';
import { Badge } from '@/components/ui/badge';
import { STATUS_CORES } from '../types';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 'destructive';
      case 'Entregue':
        return 'default';
      case 'Cancelada':
        return 'secondary';
      case 'Devolvida':
        return 'outline';
      case 'Reenviada':
        return 'outline';
      case 'Paga':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getBadgeColor = (status: string) => {
    return STATUS_CORES[status as keyof typeof STATUS_CORES] || 'bg-gray-500';
  };

  return (
    <Badge 
      variant={getBadgeVariant(status)}
      className={`${getBadgeColor(status)} text-white`}
    >
      {status}
    </Badge>
  );
};
