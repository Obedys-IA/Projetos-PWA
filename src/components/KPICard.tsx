import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon, color }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
          </div>
          <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white text-xl`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};