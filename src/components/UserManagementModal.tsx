import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import type { User } from "@/types";

interface UserManagementModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (userData: Omit<User, "id" | "createdAt" | "createdBy">) => void;
  editUser?: User;
}

export function UserManagementModal({ open, onClose, onSave, editUser }: UserManagementModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    username: editUser?.username || "",
    password: editUser ? "" : "",
    name: editUser?.name || "",
    role: editUser?.role || "cashier" as "admin" | "cashier",
    phone: editUser?.phone || "",
    email: editUser?.email || "",
    isActive: editUser?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If editing and password is empty, don't update password
    const userData: any = {
      username: formData.username,
      name: formData.name,
      role: formData.role,
      phone: formData.phone,
      email: formData.email,
      isActive: formData.isActive,
    };

    // Only include password if it's a new user or password field is filled
    if (!editUser || formData.password) {
      userData.password = formData.password;
    } else {
      userData.password = editUser.password;
    }

    onSave(userData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {editUser ? t("editUser") : t("createNewUser")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("fullName")}</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t("enterFullName")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">{t("username")}</Label>
            <Input
              id="username"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder={t("enterUsername")}
              disabled={!!editUser}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {editUser ? t("newPassword") : t("password")}
            </Label>
            <Input
              id="password"
              type="password"
              required={!editUser}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editUser ? t("leaveBlankToKeep") : t("enterPassword")}
            />
            {editUser && (
              <p className="text-xs text-muted-foreground">{t("passwordHint")}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">{t("role")}</Label>
            <Select
              value={formData.role}
              onValueChange={(value: "admin" | "cashier") => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">{t("admin")}</SelectItem>
                <SelectItem value="cashier">{t("cashier")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{t("phone")} ({t("optional")})</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t("phoneNumber")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("email")} ({t("optional")})</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t("emailAddress")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit">
              {editUser ? t("updateUser") : t("createUser")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}