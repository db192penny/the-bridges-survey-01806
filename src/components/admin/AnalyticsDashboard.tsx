import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateAnalytics } from "@/utils/surveyAnalytics";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, UserX, Clock, Mail, Phone } from "lucide-react";

export function AnalyticsDashboard() {
  const analytics = calculateAnalytics();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Starts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalStarts}</div>
            <p className="text-xs text-muted-foreground">
              Survey sessions initiated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCompletions}</div>
            <p className="text-xs text-muted-foreground">
              Successfully submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drop-offs</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalAbandoned}</div>
            <p className="text-xs text-muted-foreground">
              Abandoned surveys
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Start to completion
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Visual representation of user journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Started Survey</span>
                <span className="text-sm text-muted-foreground">{analytics.totalStarts}</span>
              </div>
              <Progress value={100} />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">In Progress</span>
                <span className="text-sm text-muted-foreground">
                  {analytics.totalStarts - analytics.totalCompletions - analytics.totalAbandoned}
                </span>
              </div>
              <Progress 
                value={analytics.totalStarts > 0 
                  ? ((analytics.totalStarts - analytics.totalCompletions - analytics.totalAbandoned) / analytics.totalStarts) * 100 
                  : 0
                } 
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Completed</span>
                <span className="text-sm text-muted-foreground">{analytics.totalCompletions}</span>
              </div>
              <Progress 
                value={analytics.totalStarts > 0 ? (analytics.totalCompletions / analytics.totalStarts) * 100 : 0} 
                className="bg-green-200"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Abandoned</span>
                <span className="text-sm text-muted-foreground">{analytics.totalAbandoned}</span>
              </div>
              <Progress 
                value={analytics.totalStarts > 0 ? (analytics.totalAbandoned / analytics.totalStarts) * 100 : 0}
                className="bg-red-200"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Drop-off Points</CardTitle>
            <CardDescription>Categories where users abandon the survey</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(analytics.dropoffByCategory).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(analytics.dropoffByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([category, count]) => (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">
                          {category.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm text-muted-foreground">{count} drop-offs</span>
                      </div>
                      <Progress 
                        value={analytics.totalAbandoned > 0 ? (count / analytics.totalAbandoned) * 100 : 0}
                      />
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No drop-off data available yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Average Completion Time
            </CardTitle>
            <CardDescription>Time taken from start to completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analytics.averageTimeToComplete.toFixed(1)} minutes
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Based on {analytics.totalCompletions} completed surveys
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Methods</CardTitle>
            <CardDescription>Preferred contact method distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {analytics.contactMethods.email} ({analytics.contactMethods.emailPercentage.toFixed(1)}%)
                </span>
              </div>
              <Progress value={analytics.contactMethods.emailPercentage} />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Phone</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {analytics.contactMethods.phone} ({analytics.contactMethods.phonePercentage.toFixed(1)}%)
                </span>
              </div>
              <Progress value={analytics.contactMethods.phonePercentage} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
