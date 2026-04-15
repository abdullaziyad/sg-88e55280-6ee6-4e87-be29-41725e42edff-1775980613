<![CDATA[
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];
type AuditLogInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];

export type AuditAction = 
  | "create" | "update" | "delete" | "login" | "logout"
  | "settings_change" | "transaction_complete" | "product_restock"
  | "user_invite" | "user_remove" | "backup_create" | "data_export";

export type EntityType = 
  | "product" | "transaction" | "settings" | "user" 
  | "store" | "backup" | "system";

interface LogAuditParams {
  storeId: string;
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  oldData?: any;
  newData?: any;
  description?: string;
}

export const auditService = {
  async logAction(params: LogAuditParams) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("audit_logs").insert({
        store_id: params.storeId,
        user_id: user.id,
        user_email: user.email || "unknown",
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId,
        old_data: params.oldData,
        new_data: params.newData,
        ip_address: null, // Can be populated from request headers in real deployment
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      });

      if (error) console.error("Audit log error:", error);
    } catch (error) {
      console.error("Failed to log audit:", error);
    }
  },

  async getAuditLogs(
    storeId: string,
    filters?: {
      userId?: string;
      action?: AuditAction;
      entityType?: EntityType;
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ): Promise<AuditLog[]> {
    let query = supabase
      .from("audit_logs")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });

    if (filters?.userId) {
      query = query.eq("user_id", filters.userId);
    }

    if (filters?.action) {
      query = query.eq("action", filters.action);
    }

    if (filters?.entityType) {
      query = query.eq("entity_type", filters.entityType);
    }

    if (filters?.startDate) {
      query = query.gte("created_at", filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte("created_at", filters.endDate);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getUserActivity(storeId: string, userId: string, days = 30): Promise<AuditLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.getAuditLogs(storeId, {
      userId,
      startDate: startDate.toISOString(),
    });
  },

  async getRecentActivity(storeId: string, limit = 50): Promise<AuditLog[]> {
    return this.getAuditLogs(storeId, { limit });
  },

  async exportAuditLogs(storeId: string, startDate?: string, endDate?: string) {
    const logs = await this.getAuditLogs(storeId, { startDate, endDate });
    
    const csv = [
      ["Timestamp", "User", "Action", "Entity Type", "Entity ID", "Details"].join(","),
      ...logs.map(log => [
        new Date(log.created_at).toISOString(),
        log.user_email,
        log.action,
        log.entity_type,
        log.entity_id || "",
        JSON.stringify(log.new_data || {}).replace(/,/g, ";"),
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
</![CDATA[>
