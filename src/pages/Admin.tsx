import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAllResponses, clearAllResponses } from "@/hooks/useSurveyState";
import { generateMainCSV, generateAdditionalCategoriesCSV, downloadCSV } from "@/utils/csvExport";
import { SurveyResponse, VENDOR_CATEGORIES } from "@/utils/surveyData";
import { Download, Trash2, ChevronDown, ChevronRight, BarChart3, Upload } from "lucide-react";
import { toast } from "sonner";

const ADMIN_PASSWORD = "courtney2025";

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (authenticated) {
      loadResponses();
    }
  }, [authenticated]);

  const loadResponses = () => {
    setResponses(getAllResponses());
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      toast.success("Access granted!");
    } else {
      toast.error("Incorrect password. Please try again.");
    }
  };

  const handleExportMain = () => {
    const csv = generateMainCSV(responses);
    downloadCSV(csv, "vendor_survey_responses.csv");
    toast.success("Main data exported!");
  };

  const handleExportAdditional = () => {
    const csv = generateAdditionalCategoriesCSV(responses);
    downloadCSV(csv, "additional_categories.csv");
    toast.success("Additional categories exported!");
  };

  const handleClearAll = () => {
    clearAllResponses();
    setResponses([]);
    setShowClearDialog(false);
    toast.success("All data cleared!");
  };

  const handleImportBackup = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importedData = JSON.parse(text);
        
        // Validate it's an array
        if (!Array.isArray(importedData)) {
          toast.error("Invalid backup file: Expected an array of responses");
          return;
        }

        // Get existing responses
        const existing = getAllResponses();
        
        // Merge: Add new responses that don't already exist (by ID)
        const existingIds = new Set(existing.map(r => r.id));
        const newResponses = importedData.filter((r: SurveyResponse) => !existingIds.has(r.id));
        
        if (newResponses.length === 0) {
          toast.info("No new responses to import");
          return;
        }

        // Save merged data
        const merged = [...existing, ...newResponses];
        localStorage.setItem("vendor_survey_responses", JSON.stringify(merged));
        
        // Refresh display
        loadResponses();
        toast.success(`Imported ${newResponses.length} new response${newResponses.length === 1 ? '' : 's'}!`);
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Failed to import backup: Invalid JSON file");
      }
    };

    input.click();
  };

  const filteredResponses = responses.filter(
    (r) =>
      r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateStats = () => {
    const total = responses.length;
    const withPhone = responses.filter((r) => r.phone).length;
    const completionRate = total > 0 ? (withPhone / total) * 100 : 0;

    // Calculate most popular vendors
    const vendorCounts: Record<string, number> = {};
    responses.forEach((r) => {
      Object.values(r.responses).forEach((cat) => {
        cat.vendors.forEach((vendor) => {
          vendorCounts[vendor] = (vendorCounts[vendor] || 0) + 1;
        });
      });
    });

    const topVendors = Object.entries(vendorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return { total, completionRate, topVendors };
  };

  const getCategoryStats = () => {
    const stats: Record<
      string,
      {
        completed: number;
        skipped: number;
        dontUse: number;
        skipForNow: number;
        vendors: Record<string, number>;
        others: string[];
      }
    > = {};

    VENDOR_CATEGORIES.forEach((cat) => {
      stats[cat.id] = {
        completed: 0,
        skipped: 0,
        dontUse: 0,
        skipForNow: 0,
        vendors: {},
        others: [],
      };
    });

    responses.forEach((r) => {
      Object.entries(r.responses).forEach(([catId, catData]) => {
        if (stats[catId]) {
          if (catData.skipped) {
            stats[catId].skipped++;
            if (catData.skip_reason === "dont_use") stats[catId].dontUse++;
            if (catData.skip_reason === "skip_for_now") stats[catId].skipForNow++;
          } else {
            stats[catId].completed++;
            catData.vendors.forEach((vendor) => {
              if (vendor.startsWith("Other:")) {
                stats[catId].others.push(vendor.replace("Other: ", ""));
              } else {
                stats[catId].vendors[vendor] = (stats[catId].vendors[vendor] || 0) + 1;
              }
            });
          }
        }
      });
    });

    return stats;
  };

  const getAdditionalCategoryStats = () => {
    const stats: Record<string, { count: number; vendors: string[] }> = {};

    responses.forEach((r) => {
      r.additional_categories_requested.forEach((cat) => {
        if (!stats[cat]) {
          stats[cat] = { count: 0, vendors: [] };
        }
        stats[cat].count++;

        const catKey = cat.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
        const vendors = r.additional_vendors[catKey] || [];
        stats[cat].vendors.push(...vendors);
      });
    });

    return Object.entries(stats).sort(([, a], [, b]) => b.count - a.count);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8">
          <h1 className="text-2xl font-bold mb-4">Admin Access</h1>
          <p className="text-muted-foreground mb-6">Enter the password to view survey results</p>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const stats = calculateStats();
  const categoryStats = getCategoryStats();
  const additionalStats = getAdditionalCategoryStats();

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Survey Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button onClick={handleExportMain} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export All
            </Button>
            <Button onClick={handleExportAdditional} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Additional
            </Button>
            <Button onClick={handleImportBackup} variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              Import Backup
            </Button>
            <Button
              onClick={() => setShowClearDialog(true)}
              variant="destructive"
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <h3 className="text-sm text-muted-foreground mb-1">Total Responses</h3>
            <p className="text-3xl font-bold text-primary">{stats.total}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm text-muted-foreground mb-1">With Phone</h3>
            <p className="text-3xl font-bold">{stats.completionRate.toFixed(0)}%</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm text-muted-foreground mb-1">Most Recent</h3>
            <p className="text-lg font-semibold">
              {responses.length > 0
                ? new Date(responses[responses.length - 1].timestamp).toLocaleDateString()
                : "N/A"}
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm text-muted-foreground mb-1">Top Vendor</h3>
            <p className="text-lg font-semibold truncate">
              {stats.topVendors[0]?.[0] || "N/A"}
            </p>
          </Card>
        </div>

        {/* Response Table */}
        <Card className="p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">All Responses</h2>
            <Input
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Skipped</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResponses.map((response) => {
                  const completed = Object.values(response.responses).filter((r) => !r.skipped).length;
                  const skipped = Object.values(response.responses).filter((r) => r.skipped).length;

                  return (
                    <>
                      <TableRow key={response.id} className="cursor-pointer" onClick={() => setExpandedRow(expandedRow === response.id ? null : response.id)}>
                        <TableCell>
                          {expandedRow === response.id ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </TableCell>
                        <TableCell>{new Date(response.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{response.name || "—"}</TableCell>
                        <TableCell>{response.phone || "—"}</TableCell>
                        <TableCell>{completed}</TableCell>
                        <TableCell>{skipped}</TableCell>
                      </TableRow>
                      {expandedRow === response.id && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-secondary/30">
                            <div className="p-4 space-y-2 text-sm">
                              {Object.entries(response.responses).map(([catId, catData]) => {
                                const category = VENDOR_CATEGORIES.find((c) => c.id === catId);
                                return (
                                  <div key={catId}>
                                    <strong>{category?.title}:</strong>{" "}
                                    {catData.skipped
                                      ? `Skipped (${catData.skip_reason?.replace("_", " ")})`
                                      : catData.vendors.join(", ") || "No selection"}
                                  </div>
                                );
                              })}
                              {response.additional_categories_requested.length > 0 && (
                                <div className="pt-2 border-t">
                                  <strong>Additional Categories:</strong>{" "}
                                  {response.additional_categories_requested.join(", ")}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Category Insights */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Category Insights
          </h2>
          <div className="space-y-6">
            {VENDOR_CATEGORIES.map((category) => {
              const stat = categoryStats[category.id];
              const topVendors = Object.entries(stat.vendors)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5);

              return (
                <div key={category.id} className="border-b pb-4">
                  <h3 className="font-semibold mb-2">{category.title}</h3>
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Completed:</span>{" "}
                      <span className="font-medium">{stat.completed}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Don't Use:</span>{" "}
                      <span className="font-medium">{stat.dontUse}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Skipped:</span>{" "}
                      <span className="font-medium">{stat.skipForNow}</span>
                    </div>
                  </div>
                  {topVendors.length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm text-muted-foreground">Top Vendors: </span>
                      {topVendors.map(([vendor, count]) => (
                        <span key={vendor} className="text-sm mr-3">
                          {vendor} ({count})
                        </span>
                      ))}
                    </div>
                  )}
                  {stat.others.length > 0 && (
                    <div className="mt-1 text-sm">
                      <span className="text-muted-foreground">Other: </span>
                      {stat.others.join(", ")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Additional Categories */}
        {additionalStats.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Requested Additional Categories</h2>
            <div className="space-y-4">
              {additionalStats.map(([category, data]) => (
                <div key={category} className="border-b pb-3">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold">{category}</h3>
                    <span className="text-sm text-muted-foreground">
                      Requested by {data.count} {data.count === 1 ? "person" : "people"}
                    </span>
                  </div>
                  {data.vendors.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Vendors: {data.vendors.filter(Boolean).join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Clear Confirmation Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear All Data?</DialogTitle>
            <DialogDescription>
              This will permanently delete all survey responses. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearAll}>
              Delete Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
