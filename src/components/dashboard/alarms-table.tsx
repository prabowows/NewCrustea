"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { realTimeAlarms, historicalAlarms, type Alarm } from "@/lib/data";

export function AlarmsTable() {
  const getSeverityVariant = (severity: Alarm['severity']) => {
    switch (severity) {
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'secondary';
      case 'Low':
      default:
        return 'outline';
    }
  };

  const renderAlarmRow = (alarm: Alarm) => (
    <TableRow key={alarm.id}>
      <TableCell className="font-medium">{alarm.originator}</TableCell>
      <TableCell>{alarm.type}</TableCell>
      <TableCell>
        <Badge variant={getSeverityVariant(alarm.severity)}>
          {alarm.severity}
        </Badge>
      </TableCell>
      <TableCell className="text-right text-muted-foreground">{alarm.timestamp}</TableCell>
    </TableRow>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alarm Monitoring</CardTitle>
        <CardDescription>View real-time and historical system alarms.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="realtime">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="realtime">Real-time ({realTimeAlarms.length})</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="realtime" className="mt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Originator</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead className="text-right">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {realTimeAlarms.map(renderAlarmRow)}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                      <TableHead>Originator</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead className="text-right">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicalAlarms.map(renderAlarmRow)}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
