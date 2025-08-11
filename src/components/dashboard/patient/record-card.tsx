import { Card, CardContent } from "@/components/ui/card";
import { FileText, FileBarChart, Pill, Image, Heart, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";
import { formatFileSize, formatDate, cn } from "@/lib/utils";
import { MedicalRecord } from "@/types/medical-records";
import { RECORD_TYPE_OPTIONS } from "@/lib/constants";

const getRecordIcon = (recordType: string) => {
  switch (recordType) {
    case "MEDICAL_REPORT":
      return FileText;
    case "LAB_RESULT":
      return FileBarChart;
    case "PRESCRIPTION":
      return Pill;
    case "IMAGING":
      return Image;
    case "VACCINE_RECORD":
      return Heart;
    case "ALLERGY_INFO":
      return Heart;
    default:
      return File;
  }
};

const getRecordColor = (recordType: string) => {
  switch (recordType) {
    case "MEDICAL_REPORT":
      return "bg-blue-100 text-blue-700";
    case "LAB_RESULT":
      return "bg-green-100 text-green-700";
    case "PRESCRIPTION":
      return "bg-purple-100 text-purple-700";
    case "IMAGING":
      return "bg-orange-100 text-orange-700";
    case "VACCINE_RECORD":
      return "bg-red-100 text-red-700";
    case "ALLERGY_INFO":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const RecordCard = ({ record }: { record: MedicalRecord }) => {
  const Icon = getRecordIcon(record.recordType);
  const colorClass = getRecordColor(record.recordType);

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={cn("p-2 rounded-lg", colorClass)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{record.title}</h3>
              <p className="text-sm text-gray-600">
                {
                  RECORD_TYPE_OPTIONS.find((t: { value: string }) => t.value === record.recordType)
                    ?.label
                }
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {record.description && (
          <p className="text-sm text-gray-600 mb-3">{record.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-3">
          <div>
            <span className="font-medium">File:</span> {record.fileName}
          </div>
          <div>
            <span className="font-medium">Size:</span>{" "}
            {formatFileSize(record.fileSize)}
          </div>
          <div>
            <span className="font-medium">Date:</span>{" "}
            {formatDate(record.createdAt)}
          </div>
          {record.doctor && (
            <div>
              <span className="font-medium">Doctor:</span> Dr.{" "}
              {record.doctor.firstName} {record.doctor.lastName}
            </div>
          )}
        </div>

        {record.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {record.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};


export default RecordCard;