
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { parameters, type Parameter } from "@/lib/data";

export function ParameterAnalysis() {
  const getStatusVariant = (status: Parameter['status']) => {
    switch (status) {
      case 'Online':
        return 'default';
      case 'Warning':
        return 'secondary';
      case 'Offline':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle className="text-primary">Parameter Analysis</CardTitle>
        <CardDescription>Monitor data and parameters from all entities.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Entity ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dissolved Oxygen</TableHead>
                <TableHead>pH Level</TableHead>
                <TableHead className="text-right">Temperature</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {parameters.map((param) => (
                <TableRow key={param.id}>
                    <TableCell className="font-medium">{param.entityId}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusVariant(param.status)}>
                        {param.status}
                        </Badge>
                    </TableCell>
                    <TableCell>{param.do}</TableCell>
                    <TableCell>{param.ph}</TableCell>
                    <TableCell className="text-right">{param.temperature}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
