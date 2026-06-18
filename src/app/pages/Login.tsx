import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useUser, UserRole } from "../contexts/UserContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import {
  Coffee, User, ShieldCheck, Truck,
  Eye, EyeOff, ChevronDown, ArrowRight,
} from "lucide-react";

// ─── Role option card ─────────────────────────────────────────────────────────

const ROLES: {
  value: UserRole;
  label: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  demo: { email: string; password: string };
}[] = [
  {
    value: "customer",
    label: "Customer",
    desc: "Browse menu & place orders",
    icon: <User className="h-5 w-5" />,
    color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
    demo: { email: "customer@usm.my", password: "password" },
  },
  {
    value: "admin",
    label: "Admin",
    desc: "Manage cafe & orders",
    icon: <ShieldCheck className="h-5 w-5" />,
    color: "text-violet-600 bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-800",
    demo: { email: "admin@usm.my", password: "admin123" },
  },
  {
    value: "driver",
    label: "Driver",
    desc: "Handle deliveries",
    icon: <Truck className="h-5 w-5" />,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800",
    demo: { email: "driver@usm.my", password: "driver123" },
  },
];

function RoleCard({
  r, selected, onSelect,
}: {
  r: typeof ROLES[0];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex flex-col items-center gap-2 rounded-xl border-2 py-4 px-3 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-primary/40 hover:bg-accent/20"
      }`}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
          selected ? "bg-primary text-primary-foreground border-primary" : r.color
        }`}
      >
        {r.icon}
      </span>
      <span className={`text-sm font-semibold ${selected ? "text-primary" : ""}`}>{r.label}</span>
      <span className="text-[11px] leading-tight text-muted-foreground">{r.desc}</span>
      {selected && (
        <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
      )}
    </button>
  );
}

// ─── Login page ───────────────────────────────────────────────────────────────

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useUser();

  const [selectedRole, setSelectedRole] = useState<UserRole>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password, selectedRole);
      setLoading(false);
      if (result.ok) {
        navigate("/");
      } else {
        setError(result.error ?? "Login failed.");
      }
    }, 400);
  };

  const fillDemo = (role: UserRole) => {
    const demo = ROLES.find(r => r.value === role)?.demo;
    if (demo) { setEmail(demo.email); setPassword(demo.password); setSelectedRole(role); }
  };

  const currentRole = ROLES.find(r => r.value === selectedRole)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Branding */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <Coffee className="h-9 w-9" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">USM Cafe</h1>
          <p className="text-muted-foreground mt-1">University of Science Malaysia</p>
        </div>

        {/* Role selection */}
        <div>
          <p className="text-sm font-medium text-center text-muted-foreground mb-3">Sign in as</p>
          <div className="grid grid-cols-3 gap-3">
            {ROLES.map(r => (
              <RoleCard key={r.value} r={r} selected={selectedRole === r.value} onSelect={() => setSelectedRole(r.value)} />
            ))}
          </div>
        </div>

        {/* Login form */}
        <Card className="shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`flex h-7 w-7 items-center justify-center rounded-lg border ${currentRole.color}`}>
                {currentRole.icon}
              </span>
              <span className="font-semibold">Sign in as {currentRole.label}</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="login-email">Email address</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
                {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground pt-1">
              Don't have an account?{" "}
              <Link
                to={`/register/${selectedRole}`}
                className="font-medium text-primary hover:underline"
              >
                Register as {currentRole.label}
              </Link>
            </p>

            {/* Demo credentials */}
            <div className="border-t pt-3">
              <button
                type="button"
                onClick={() => setShowDemo(v => !v)}
                className="flex w-full items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>Demo credentials</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showDemo ? "rotate-180" : ""}`} />
              </button>
              {showDemo && (
                <div className="mt-3 rounded-xl bg-muted/60 p-3 space-y-2">
                  {ROLES.map(r => (
                    <div key={r.value} className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold">{r.label}:</span>{" "}
                        <span className="text-muted-foreground font-mono">{r.demo.email}</span>
                        <span className="text-muted-foreground"> / {r.demo.password}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => fillDemo(r.value)}
                        className="ml-2 shrink-0 text-primary hover:underline"
                      >
                        use
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
