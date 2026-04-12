import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { UserManagementModal } from "@/components/UserManagementModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { ArrowLeft, UserPlus, Edit, Trash2, ShieldCheck, UserCircle, AlertTriangle } from "lucide-react";
import type { User } from "@/types";

export default function UsersPage() {
  const { user, isAdmin, createUser, updateUser, deleteUser, getAllUsers } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(getAllUsers());
  };

  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-heading font-semibold mb-2">{t("accessDenied")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminOnly")}</p>
            <Link href="/">
              <Button>{t("backToHome")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateUser = (userData: Omit<User, "id" | "createdAt" | "createdBy">) => {
    if (editingUser) {
      updateUser(editingUser.id, userData);
    } else {
      createUser(userData);
    }
    loadUsers();
    setShowModal(false);
    setEditingUser(undefined);
  };

  const handleEdit = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setShowModal(true);
  };

  const handleDelete = (userId: string) => {
    deleteUser(userId);
    loadUsers();
    setDeletingUserId(null);
  };

  const toggleUserStatus = (userId: string, currentStatus: boolean) => {
    updateUser(userId, { isActive: !currentStatus });
    loadUsers();
  };

  const activeUsers = users.filter((u) => u.isActive);
  const inactiveUsers = users.filter((u) => !u.isActive);
  const adminCount = users.filter((u) => u.role === "admin" && u.isActive).length;
  const cashierCount = users.filter((u) => u.role === "cashier" && u.isActive).length;

  return (
    <>
      <SEO title={`${t("userManagement")} - ${t("appTitle")}`} />

      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("backToPos")}
                  </Button>
                </Link>
                <div>
                  <h1 className="font-heading font-bold text-xl">{t("userManagement")}</h1>
                  <p className="text-sm text-muted-foreground">{t("manageUsersAndPermissions")}</p>
                </div>
              </div>

              <Button onClick={() => setShowModal(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                {t("createNewUser")}
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("totalUsers")}</p>
                    <p className="text-2xl font-heading font-bold">{activeUsers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("admins")}</p>
                    <p className="text-2xl font-heading font-bold">{adminCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("cashiers")}</p>
                    <p className="text-2xl font-heading font-bold">{cashierCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading">{t("activeUsers")}</CardTitle>
              <CardDescription>{t("manageUserAccounts")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("username")}</TableHead>
                    <TableHead>{t("role")}</TableHead>
                    <TableHead>{t("contact")}</TableHead>
                    <TableHead>{t("createdAt")}</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="font-mono text-sm">{u.username}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                          {u.role === "admin" ? t("admin") : t("cashier")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.phone && <div>{u.phone}</div>}
                        {u.email && <div>{u.email}</div>}
                        {!u.phone && !u.email && "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(u)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            {t("edit")}
                          </Button>
                          {u.id !== user.id && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleUserStatus(u.id, u.isActive)}
                              >
                                {t("deactivate")}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeletingUserId(u.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {activeUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        {t("noUsers")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {inactiveUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">{t("inactiveUsers")}</CardTitle>
                <CardDescription>{t("deactivatedAccounts")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("name")}</TableHead>
                      <TableHead>{t("username")}</TableHead>
                      <TableHead>{t("role")}</TableHead>
                      <TableHead className="text-right">{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inactiveUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium text-muted-foreground">{u.name}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">{u.username}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {u.role === "admin" ? t("admin") : t("cashier")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserStatus(u.id, u.isActive)}
                          >
                            {t("reactivate")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      <UserManagementModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingUser(undefined);
        }}
        onSave={handleCreateUser}
        editUser={editingUser}
      />

      <AlertDialog open={!!deletingUserId} onOpenChange={() => setDeletingUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteUserConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteUserWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingUserId && handleDelete(deletingUserId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}