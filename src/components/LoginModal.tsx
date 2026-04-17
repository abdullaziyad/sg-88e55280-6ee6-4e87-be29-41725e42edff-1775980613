import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LogIn, AlertCircle, Store, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const { login, signup } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [signupError, setSignupError] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const success = await login(loginEmail, loginPassword);
      if (success) {
        console.log("Login successful, state is ready");
        setLoginEmail("");
        setLoginPassword("");
        onClose();
      } else {
        setLoginError("Invalid email or password. Please check your credentials and try again.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Show specific error messages
      if (error.message.includes("confirm your email") || error.message.includes("Email not confirmed")) {
        setLoginError("Please confirm your email address before logging in. Check your inbox for the confirmation link.");
      } else if (error.message.includes("Invalid login credentials")) {
        setLoginError("Invalid email or password. If you just signed up, please confirm your email first.");
      } else {
        setLoginError(error.message || "An error occurred. Please try again.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");

    // Validation
    if (!signupEmail || !signupPassword || !signupConfirmPassword || !storeName) {
      setSignupError("All fields are required");
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupError("Passwords do not match");
      return;
    }

    if (signupPassword.length < 6) {
      setSignupError("Password must be at least 6 characters");
      return;
    }

    setIsSigningUp(true);

    try {
      const success = await signup(signupEmail, signupPassword, storeName);
      if (success) {
        setSignupEmail("");
        setSignupPassword("");
        setSignupConfirmPassword("");
        setStoreName("");
        onClose();
      } else {
        setSignupError("Failed to create account. Please try again.");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      
      // Show helpful error message
      if (error.message.includes("confirm your email") || error.message.includes("check your email")) {
        // This is actually a success case - account created, just needs confirmation
        setSignupError("");
        toast({
          title: "Account Created!",
          description: error.message,
        });
        // Clear form and switch to login tab after a moment
        setSignupEmail("");
        setSignupPassword("");
        setSignupConfirmPassword("");
        setStoreName("");
        setTimeout(() => onClose(), 2000);
      } else {
        setSignupError(error.message || "An error occurred. Please try again.");
      }
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess(false);

    if (!resetEmail) {
      setResetError("Please enter your email address");
      return;
    }

    setIsSendingReset(true);

    try {
      const { error } = await authService.resetPassword(resetEmail);
      if (error) {
        setResetError(error.message);
      } else {
        setResetSuccess(true);
        setResetEmail("");
      }
    } catch (error) {
      setResetError("Failed to send reset email. Please try again.");
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <LogIn className="w-5 h-5" />
            Welcome to Maldives Shop POS
          </DialogTitle>
          <DialogDescription>Sign in to your store or create a new one</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            {!showForgotPassword ? (
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn ? "Signing in..." : "Sign In"}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-muted-foreground"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {resetSuccess ? (
                  <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertDescription>
                      Password reset link sent! Check your email for instructions to reset your password.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    {resetError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{resetError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email Address</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="your@email.com"
                      />
                      <p className="text-sm text-muted-foreground">
                        Enter your email address and we'll send you a link to reset your password.
                      </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSendingReset}>
                      {isSendingReset ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </form>
                )}

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetSuccess(false);
                      setResetError("");
                      setResetEmail("");
                    }}
                  >
                    ← Back to Login
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              {signupError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{signupError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="store-name">
                  <Store className="w-4 h-4 inline mr-1" />
                  Store Name
                </Label>
                <Input
                  id="store-name"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="My Shop"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  required
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSigningUp}>
                {isSigningUp ? "Creating account..." : "Create Store & Sign Up"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}