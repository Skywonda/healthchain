
import { Eye, FileText, Shield, Activity, MapPin, Monitor } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatDateTime } from '@/lib/utils';
import { AccessLog } from '@/types/audit';

const getAccessTypeColor = (accessType: string) => {
  switch (accessType) {
    case 'read': return 'bg-blue-100 text-blue-800';
    case 'write': return 'bg-green-100 text-green-800';
    case 'emergency': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};


const getAccessTypeIcon = (accessType: string) => {
  switch (accessType) {
    case 'read': return Eye;
    case 'write': return FileText;
    case 'emergency': return Shield;
    default: return Activity;
  }
};

const AccessLogCard = ({ log }: { log: AccessLog }) => {
  console.log("our logs: ", log)
  const AccessIcon = getAccessTypeIcon(log.accessType);
  const accessTypeColor = getAccessTypeColor(log.accessType);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={cn('p-2 rounded-lg', accessTypeColor)}>
              <AccessIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {log.accessor.firstName} {log.accessor.lastName}
              </h3>
              <p className="text-sm text-gray-600">{log.accessor.specialization}</p>
              {log.accessor.hospitalName && (
                <p className="text-xs text-gray-500">{log.accessor.hospitalName}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className={cn('px-2 py-1 rounded-full text-xs font-medium', accessTypeColor)}>
              {log.accessType.toUpperCase()}
            </span>
            <p className="text-xs text-gray-500 mt-1">
              {formatDateTime(log.accessedAt)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Accessed Record:</p>
            <p className="text-sm text-gray-900">{log.record.title}</p>
            <p className="text-xs text-gray-500">{log.record.recordType.replace('_', ' ')}</p>
          </div>

          {log.purpose && (
            <div>
              <p className="text-sm font-medium text-gray-700">Purpose:</p>
              <p className="text-sm text-gray-600">{log.purpose}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
            {log.duration && (
              <div>
                <span className="font-medium">Duration:</span> {Math.floor(log.duration / 60)}m {log.duration % 60}s
              </div>
            )}
            {log.downloadedFiles.length > 0 && (
              <div>
                <span className="font-medium">Downloads:</span> {log.downloadedFiles.length} files
              </div>
            )}
            {log.ipAddress && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{log.ipAddress}</span>
              </div>
            )}
            {log.userAgent && (
              <div className="flex items-center gap-1">
                <Monitor className="h-3 w-3" />
                <span className="truncate">{log.userAgent.split(' ')[0]}</span>
              </div>
            )}
          </div>

          {log.accessedFields.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Fields Accessed:</p>
              <div className="flex flex-wrap gap-1">
                {log.accessedFields.map((field, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessLogCard;