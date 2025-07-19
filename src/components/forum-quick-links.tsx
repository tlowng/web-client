import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, BarChart3, Users, Star } from 'lucide-react';

export function ForumQuickLinks() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Community
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
            <Link to="/forum/leaderboard">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <div className="text-center">
                <div className="font-medium">Leaderboard</div>
                <div className="text-xs text-muted-foreground">Top contributors</div>
              </div>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
            <Link to="/forum/stats">
              <BarChart3 className="h-6 w-6 text-blue-500" />
              <div className="text-center">
                <div className="font-medium">Statistics</div>
                <div className="text-xs text-muted-foreground">Forum insights</div>
              </div>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
            <Link to="/members">
              <Users className="h-6 w-6 text-green-500" />
              <div className="text-center">
                <div className="font-medium">Members</div>
                <div className="text-xs text-muted-foreground">All users</div>
              </div>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
