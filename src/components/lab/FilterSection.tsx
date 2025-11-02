import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface FilterSectionProps {
  selectedDepartment: string;
  selectedSemester: string;
  onDepartmentChange: (value: string) => void;
  onSemesterChange: (value: string) => void;
  onApplyFilter: () => void;
}

const departments = ["All", "MECH", "CSE", "CIVIL", "EC", "AIML", "CD"];
const semesters = ["All", "1", "2", "3", "4", "5", "6", "7", "8"];

export const FilterSection = ({
  selectedDepartment,
  selectedSemester,
  onDepartmentChange,
  onSemesterChange,
  onApplyFilter,
}: FilterSectionProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Department</label>
            <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Semester</label>
            <Select value={selectedSemester} onValueChange={onSemesterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((sem) => (
                  <SelectItem key={sem} value={sem}>
                    {sem === "All" ? "All Semesters" : `Semester ${sem}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={onApplyFilter} className="w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Apply Filter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
