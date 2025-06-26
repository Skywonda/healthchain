import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const QuickActionCard = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  color = 'blue' 
}: {
  icon: any;
  title: string;
  description: string;
  onClick: () => void;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-white to-gray-50">
      <CardContent className="p-6">
        <div 
          onClick={onClick}
          className="flex items-center space-x-4"
        >
          <div className={cn(
            'p-3 rounded-xl bg-gradient-to-br text-white shadow-lg',
            colorClasses[color]
          )}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionCard;