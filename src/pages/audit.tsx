import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { auditService } from "@/services/auditService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Search, Filter, Download, Activity, User, Package, Settings as SettingsIcon, CreditCard, FileText, ShieldAlert } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/integrations/supabase/types";

type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];

export default function AuditTrail() {
  const { currentStoreId, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("7");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentStoreId && isAdmin()) {
      loadAuditLogs();
    }
  }, [currentStoreId, dateFilter]);

  const loadAuditLogs = async () => {
    if (!currentStoreId) return;
    
    setIsLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateFilter));
      
      const data = await auditService.getAuditLogs(currentStoreId, {
        startDate: startDate.toISOString(),
        limit: 1000,
      });
      
      setLogs(data);
      setFilteredLogs(data);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = logs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(log =>
        log.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entity_id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Action filter
    if (actionFilter !== "all") {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Entity filter
    if (entityFilter !== "all") {
      filtered = filtered.filter(log => log.entity_type === entityFilter);
    }

    setFilteredLogs(filtered);
  }, [searchQuery, actionFilter, entityFilter, logs]);

  const handleExport = async () => {
    if (!currentStoreId) return;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateFilter));
    
    await auditService.exportAuditLogs(
      currentStoreId,
      startDate.toISOString()
    );
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "login":
      case "logout":
        return <User className="w-4 h-4" />;
      case "create":
      case "update":
      case "delete":
        return <Package className="w-4 h-4" />;
      case "settings_change":
        return <SettingsIcon className="w-4 h-4" />;
      case "transaction_complete":
        return <CreditCard className="w-4 h-4" />;
      case "backup_create":
      case "data_export":
        return <Download className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "default";
      case "update":
        return "secondary";
      case "delete":
        return "destructive";
      case "login":
        return "default";
      case "logout":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive mb-2">
              <ShieldAlert className="w-5 h-5" />
              <CardTitle>Access Denied</CardTitle>
            </div>
            <CardDescription>
              You need admin privileges to access the audit trail.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to POS
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Audit Trail - Maldives Shop POS"
        description="Security audit trail and activity logs"
      />
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to POS
                  </Button>
                </Link>
                <div>
                  <h1 className="font-heading font-bold text-xl">Audit Trail</h1>
                  <p className="text-sm text-muted-foreground">Security and activity monitoring</p>
                </div>
              </div>
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="grid gap-6 mb-6 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Events</p>
                    <p className="text-2xl font-heading font-bold">{logs.length}</p>
                  </div>
                  <Activity className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">User Actions</p>
                    <p className="text-2xl font-heading font-bold">
                      {logs.filter(l => ["login", "logout"].includes(l.action)).length}
                    </p>
                  </div>
                  <User className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Data Changes</p>
                    <p className="text-2xl font-heading font-bold">
                      {logs.filter(l => ["create", "update", "delete"].includes(l.action)).length}
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Transactions</p>
                    <p className="text-2xl font-heading font-bold">
                      {logs.filter(l => l.action === "transaction_complete").length}
                    </p>
                  </div>
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>Filter and search all user actions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 mb-6 md:grid-cols-5">
                <div className="md:col-span-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search user, action, or entity..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="action-filter">Action</Label>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger id="action-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="logout">Logout</SelectItem>
                      <SelectItem value="create">Create</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                      <SelectItem value="transaction_complete">Transaction</SelectItem>
                      <SelectItem value="settings_change">Settings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="entity-filter">Entity Type</Label>
                  <Select value={entityFilter} onValueChange={setEntityFilter}>
                    <SelectTrigger id="entity-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="transaction">Transaction</SelectItem>
                      <SelectItem value="settings">Settings</SelectItem>
                      <SelectItem value="store">Store</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date-filter">Time Period</Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger id="date-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Last 24 hours</SelectItem>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading audit logs...
                    </div>
                  ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No audit logs found matching your filters.
                    </div>
                  ) : (
                    filteredLogs.map((log) => {
                      const timestamp = new Date(log.created_at);
                      
                      return (
                        <div
                          key={log.id}
                          className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            {getActionIcon(log.action)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant={getActionColor(log.action) as any}>
                                    {log.action.replace("_", " ")}
                                  </Badge>
                                  <Badge variant="outline">{log.entity_type}</Badge>
                                </div>
                                <p className="text-sm font-medium">
                                  <span className="text-muted-foreground">User:</span> {log.user_email}
                                </p>
                                {log.entity_id && (
                                  <p className="text-xs text-muted-foreground">
                                    Entity ID: {log.entity_id}
                                  </p>
                                )}
                              </div>

                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-medium">
                                  {timestamp.toLocaleDateString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>

                            {(log.old_data || log.new_data) && (
                              <details className="mt-2 text-xs">
                                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                  View details
                                </summary>
                                <div className="mt-2 p-3 bg-muted rounded space-y-2">
                                  {log.old_data && (
                                    <div>
                                      <p className="font-medium mb-1">Old Data:</p>
                                      <pre className="overflow-x-auto">
                                        {JSON.stringify(log.old_data, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                  {log.new_data && (
                                    <div>
                                      <p className="font-medium mb-1">New Data:</p>
                                      <pre className="overflow-x-auto">
                                        {JSON.stringify(log.new_data, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                  {log.ip_address && (
                                    <p className="text-muted-foreground">
                                      IP: {log.ip_address}
                                    </p>
                                  )}
                                  {log.user_agent && (
                                    <p className="text-muted-foreground truncate">
                                      Device: {log.user_agent}
                                    </p>
                                  )}
                                </div>
                              </details>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}