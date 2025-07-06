import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UserSubmissionsPage() {
  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>My Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page will show your past code submissions. It's under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
