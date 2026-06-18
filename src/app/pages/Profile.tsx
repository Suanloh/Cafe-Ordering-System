import { useState } from "react";
import { useUser } from "../contexts/UserContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { User, ShieldCheck, Truck, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

function roleIcon(role: string) {
  if (role === "admin") return <ShieldCheck className="h-4 w-4" />;
  if (role === "driver") return <Truck className="h-4 w-4" />;
  return <User className="h-4 w-4" />;
}

function roleBadgeClass(role: string) {
  if (role === "admin") return "border-violet-200 bg-violet-50 text-violet-700 dark:bg-violet-950/30";
  if (role === "driver") return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30";
  return "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/30";
}

function AvatarCircle({ name, role }: { name: string; role: string }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const bg = role === "admin" ? "bg-violet-100 text-violet-700" : role === "driver" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700";
  return (
    <div className={`flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold ${bg}`}>
      {initials || "?"}
    </div>
  );
}

export function Profile() {
  const { currentUser, updateProfile } = useUser();

  // personal info
  const [name, setName] = useState(currentUser?.name ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [studentId, setStudentId] = useState(currentUser?.studentId ?? "");

  // admin fields
  const [staffId, setStaffId] = useState(currentUser?.staffId ?? "");
  const [department, setDepartment] = useState(currentUser?.department ?? "");

  // driver fields
  const [vehicleNumber, setVehicleNumber] = useState(currentUser?.vehicleNumber ?? "");
  const [vehicleType, setVehicleType] = useState(currentUser?.vehicleType ?? "");

  // password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  if (!currentUser) return null;

  const handleSaveInfo = () => {
    if (!name.trim()) { toast.error("Name is required."); return; }
    if (!email.trim()) { toast.error("Email is required."); return; }
    if (!phone.trim()) { toast.error("Phone is required."); return; }

    const result = updateProfile({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      ...(currentUser.role === "customer" ? { studentId: studentId.trim() || undefined } : {}),
      ...(currentUser.role === "admin" ? { staffId: staffId.trim(), department: department.trim() } : {}),
      ...(currentUser.role === "driver" ? { vehicleNumber: vehicleNumber.trim(), vehicleType } : {}),
    });
    if (result.ok) toast.success("Profile updated successfully!");
    else toast.error(result.error);
  };

  const handleChangePassword = () => {
    if (!currentPw) { toast.error("Enter your current password."); return; }
    if (newPw.length < 6) { toast.error("New password must be at least 6 characters."); return; }
    if (newPw !== confirmPw) { toast.error("Passwords do not match."); return; }
    const result = updateProfile({ currentPassword: currentPw, newPassword: newPw });
    if (result.ok) {
      toast.success("Password changed successfully!");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-5">
            <AvatarCircle name={currentUser.name} role={currentUser.role} />
            <div>
              <h1 className="text-2xl font-bold">{currentUser.name}</h1>
              <p className="text-muted-foreground text-sm">{currentUser.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline" className={`flex items-center gap-1.5 ${roleBadgeClass(currentUser.role)}`}>
                  {roleIcon(currentUser.role)}
                  {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your name, email, and contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="p-name">Full Name</Label>
              <Input id="p-name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-phone">Phone Number</Label>
              <Input id="p-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="p-email">Email Address</Label>
              <Input id="p-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>

          {/* Customer extra */}
          {currentUser.role === "customer" && (
            <div className="space-y-1.5">
              <Label htmlFor="p-student">Student ID <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input id="p-student" placeholder="USM2024001" value={studentId} onChange={e => setStudentId(e.target.value)} />
            </div>
          )}

          {/* Admin extra */}
          {currentUser.role === "admin" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="p-staff">Staff ID</Label>
                <Input id="p-staff" value={staffId} onChange={e => setStaffId(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-dept">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger id="p-dept"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Cafe Operations", "Kitchen", "Management", "Customer Service", "Finance"].map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Driver extra */}
          {currentUser.role === "driver" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="p-vehicle">Vehicle Number</Label>
                <Input id="p-vehicle" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-vtype">Vehicle Type</Label>
                <Select value={vehicleType} onValueChange={setVehicleType}>
                  <SelectTrigger id="p-vtype"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Motorcycle", "Car", "Bicycle", "Electric Scooter"].map(v => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button onClick={handleSaveInfo} className="mt-2">Save Changes</Button>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your login password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="p-cpw">Current Password</Label>
            <div className="relative">
              <Input
                id="p-cpw"
                type={showCurrent ? "text" : "password"}
                placeholder="••••••••"
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
              />
              <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label htmlFor="p-npw">New Password</Label>
            <div className="relative">
              <Input
                id="p-npw"
                type={showNew ? "text" : "password"}
                placeholder="••••••••"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
              />
              <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-confirm">Confirm New Password</Label>
            <Input
              id="p-confirm"
              type="password"
              placeholder="••••••••"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              className={confirmPw && confirmPw !== newPw ? "border-destructive" : ""}
            />
            {confirmPw && confirmPw !== newPw && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
          </div>

          <Button onClick={handleChangePassword} variant="outline">Update Password</Button>
        </CardContent>
      </Card>
    </div>
  );
}
