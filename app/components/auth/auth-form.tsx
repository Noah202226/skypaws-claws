"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Zap, UserPlus, LogIn, Eye, EyeOff } from "lucide-react";
import { account, ID } from "@/lib/appwrite";
import { toast } from "sonner"; // Import toast from sonner

export function AuthForm() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent, type: "login" | "register") => {
    e.preventDefault();
    setIsLoading(true);

    const authPromise = async () => {
      if (type === "register") {
        await account.create(ID.unique(), email, password, name);
      }
      return await account.createEmailPasswordSession(email, password);
    };

    toast.promise(authPromise(), {
      loading:
        type === "login" ? "Authenticating..." : "Creating your account...",
      success: () => {
        setTimeout(() => (window.location.href = "/dashboard"), 1000);
        return type === "login"
          ? "Welcome back!"
          : "Account created successfully!";
      },
      error: (err) => {
        setIsLoading(false);
        return err.message || "Something went wrong.";
      },
    });
  };

  const getStrength = (pass: string) => {
    let strength = 0;
    if (pass.length > 5) strength++;
    if (pass.length > 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const strength = getStrength(password);
  const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Elite"];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-emerald-500",
    "bg-indigo-500",
  ];

  const inputClasses =
    "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:ring-indigo-600 focus:border-indigo-600 pr-10";

  return (
    <div className="perspective-1000 w-full max-w-md h-[580px]">
      <motion.div
        className="relative w-full h-full transition-all duration-500 preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* --- LOGIN SIDE --- */}
        <Card className="absolute inset-0 backface-hidden bg-slate-900 border-slate-800 p-8 flex flex-col justify-center gap-6 shadow-2xl">
          <div className="text-center">
            <Zap className="h-10 w-10 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
              Welcome <span className="text-indigo-500">Back</span>
            </h2>
          </div>

          <form onSubmit={(e) => handleAuth(e, "login")} className="space-y-4">
            <Input
              type="email"
              placeholder="Email Address"
              className={inputClasses}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className={inputClasses}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Button
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs font-black uppercase rounded-xl h-11 tracking-widest shadow-lg shadow-indigo-600/20"
            >
              <LogIn className="mr-2 h-4 w-4" />{" "}
              {isLoading ? "Processing..." : "Login"}
            </Button>
          </form>

          <p className="text-center text-[10px] font-bold uppercase text-slate-500">
            Don't have an account?{" "}
            <button
              onClick={() => setIsFlipped(true)}
              className="text-indigo-400 font-black ml-1"
            >
              Register
            </button>
          </p>
        </Card>

        {/* --- REGISTER SIDE --- */}
        <Card
          className="absolute inset-0 backface-hidden bg-slate-900 border-slate-800 p-8 flex flex-col justify-center gap-6 shadow-2xl"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="text-center">
            <UserPlus className="h-10 w-10 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
              Create <span className="text-indigo-500">Account</span>
            </h2>
          </div>

          <form
            onSubmit={(e) => handleAuth(e, "register")}
            className="space-y-4"
          >
            <Input
              placeholder="Full Name"
              className={inputClasses}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
            <Input
              type="email"
              placeholder="Email Address"
              className={inputClasses}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create Password"
                  className={inputClasses}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {password.length > 0 && (
                <div className="px-1 pt-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">
                      Strength:
                    </span>
                    <span
                      className={`text-[8px] font-black uppercase tracking-widest ${strengthColors[
                        strength - 1
                      ]?.replace("bg-", "text-")}`}
                    >
                      {strengthLabels[strength - 1]}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 transition-all duration-500 ${
                          step <= strength
                            ? strengthColors[strength - 1]
                            : "bg-transparent"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs font-black uppercase rounded-xl h-11 tracking-widest mt-2 shadow-lg shadow-indigo-600/20"
            >
              {isLoading ? "Creating..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-[10px] font-bold uppercase text-slate-500">
            Already have an account?{" "}
            <button
              onClick={() => setIsFlipped(false)}
              className="text-indigo-400 font-black ml-1"
            >
              Login
            </button>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
