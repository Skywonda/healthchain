import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  trend 
}: {
  icon: any;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: string; isPositive: boolean };
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-full">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <TrendingUp className={cn(
            "h-4 w-4 mr-1",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )} />
          <span className={cn(
            "font-medium",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            {trend.value}
          </span>
          <span className="text-gray-600 ml-1">vs last month</span>
        </div>
      )}
    </CardContent>
  </Card>
);

export default StatCard;