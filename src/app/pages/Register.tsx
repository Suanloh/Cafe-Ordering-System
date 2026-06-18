import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { useUser, UserRole } from "../contexts/UserContext";
import { User } from "../types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Coffee, User as UserIcon, ShieldCheck, Truck, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";

// ─── Config per role ──────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<UserRole, {
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}> = {
  customer: {
    label: "Customer",
    icon: <UserIcon className="h-5 w-5" />,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    description: "Create a customer account to browse the menu and place orders.",
  },
  admin: {
    label: "Admin",
    icon: <ShieldCheck className="h-5 w-5" />,
    color: "text-violet-600 bg-violet-50 border-violet-200",
    description: "Admin accounts require a valid staff ID issued by the cafe management.",
  },
  driver: {
    label: "Driver",
    icon: <Truck className="h-5 w-5" />,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    description: "Driver accounts require vehicle information to handle campus deliveries.",
  },
};

// ─── Field component ──────────────────────────────────────────────────────────

function Field({
  label, id, required, hint, children,
}: {
  label: string; id?: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ─── Register page ────────────────────────────────────────────────────────────

export function Register() {
  const { role: roleParam } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { register } = useUser();

  const role = (roleParam as UserRole) || "customer";
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.customer;

  // common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // customer
  const [studentId, setStudentId] = useState("");

  // admin
  const [staffId, setStaffId] = useState("");
  const [department, setDepartment] = useState("");

  // driver
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Validation ──
  const validate = (): string | null => {
    if (!name.trim()) return "Full name is required.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "A valid email is required.";
    if (!phone.trim()) return "Phone number is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirm) return "Passwords do not match.";
    if (role === "admin") {
      if (!staffId.trim()) return "Staff ID is required for admin accounts.";
      if (!department.trim()) return "Department is required.";
    }
    if (role === "driver") {
      if (!vehicleNumber.trim()) return "Vehicle number is required.";
      if (!vehicleType) return "Vehicle type is required.";
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setTimeout(() => {
      const data: Omit<User, "id"> = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role,
        ...(role === "customer" ? { studentId: studentId.trim() || undefined } : {}),
        ...(role === "admin" ? { staffId: staffId.trim(), department: department.trim() } : {}),
        ...(role === "driver" ? { vehicleNumber: vehicleNumber.trim(), vehicleType } : {}),
      };
      const result = register(data);
      setLoading(false);
      if (result.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/"), 1200);
      } else {
        setError(result.error ?? "Registration failed.");
      }
    }, 400);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto" />
          <h2 className="text-xl font-bold">Account created!</h2>
          <p className="text-muted-foreground">Redirecting you to the app…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex flex-col items-center justify-center p-4 py-10">
      <div className="w-full max-w-md space-y-5">

        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow">
              <Coffee className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-muted-foreground text-sm mt-1">USM Cafe · {config.label} Registration</p>
        </div>

        {/* Role badge */}
        <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${config.color}`}>
          {config.icon}
          <div>
            <p className="text-sm font-semibold">{config.label} Account</p>
            <p className="text-xs opacity-80">{config.description}</p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Personal Information</CardTitle>
            <CardDescription>All fields marked * are required</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Common fields */}
              <Field label="Full Name" id="reg-name" required>
                <Input id="reg-name" placeholder="Ahmad Bin Abdullah" value={name} onChange={e => setName(e.target.value)} />
              </Field>

              <Field label="Email Address" id="reg-email" required>
                <Input id="reg-email" type="email" placeholder="you@usm.my" value={email} onChange={e => setEmail(e.target.value)} />
              </Field>

              <Field label="Phone Number" id="reg-phone" required>
                <Input id="reg-phone" type="tel" placeholder="012-3456789" value={phone} onChange={e => setPhone(e.target.value)} />
              </Field>

              {/* Customer-specific */}
              {role === "customer" && (
                <Field label="Student ID" id="reg-student" hint="Optional — for student discounts">
                  <Input id="reg-student" placeholder="USM2024001" value={studentId} onChange={e => setStudentId(e.target.value)} />
                </Field>
              )}

              {/* Admin-specific */}
              {role === "admin" && (
                <>
                  <Field label="Staff ID" id="reg-staff" required hint="Provided by cafe management (e.g. STF-001)">
                    <Input id="reg-staff" placeholder="STF-001" value={staffId} onChange={e => setStaffId(e.target.value)} />
                  </Field>
                  <Field label="Department" id="reg-dept" required>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger id="reg-dept"><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        {["Cafe Operations", "Kitchen", "Management", "Customer Service", "Finance"].map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </>
              )}

              {/* Driver-specific */}
              {role === "driver" && (
                <>
                  <Field label="Vehicle Number" id="reg-vehicle" required hint="e.g. PEN 1234">
                    <Input id="reg-vehicle" placeholder="PEN 1234" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} />
                  </Field>
                  <Field label="Vehicle Type" id="reg-vtype" required>
                    <Select value={vehicleType} onValueChange={setVehicleType}>
                      <SelectTrigger id="reg-vtype"><SelectValue placeholder="Select vehicle type" /></SelectTrigger>
                      <SelectContent>
                        {["Motorcycle", "Car", "Bicycle", "Electric Scooter"].map(v => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </>
              )}

              {/* Password */}
              <div className="border-t pt-4 space-y-4">
                <Field label="Password" id="reg-pw" required hint="Minimum 6 characters">
                  <div className="relative">
                    <Input
                      id="reg-pw"
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {[2, 4, 6, 8].map(n => (
                        <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${password.length >= n ? (password.length >= 8 ? "bg-green-500" : password.length >= 6 ? "bg-yellow-500" : "bg-red-400") : "bg-muted"}`} />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">
                        {password.length < 6 ? "Weak" : password.length < 8 ? "OK" : "Strong"}
                      </span>
                    </div>
                  )}
                </Field>

                <Field label="Confirm Password" id="reg-cpw" required>
                  <div className="relative">
                    <Input
                      id="reg-cpw"
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      className={confirm && confirm !== password ? "border-destructive" : ""}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirm && confirm !== password && (
                    <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                  )}
                </Field>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account…" : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
