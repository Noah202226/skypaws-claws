"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Zap, UserPlus, LogIn } from "lucide-react";
import { account, ID } from "@/lib/appwrite";

export function AuthForm() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleAuth = async (e: React.FormEvent, type: "login" | "register") => {
    e.preventDefault();
    try {
      if (type === "register") {
        await account.create(ID.unique(), email, password, name);
      }
      await account.createEmailPasswordSession(email, password);
      window.location.href = "/dashboard";
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="perspective-1000 w-full max-w-md h-[500px]">
      <motion.div
        className="relative w-full h-full transition-all duration-500 preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* --- LOGIN SIDE (FRONT) --- */}
        <Card className="absolute inset-0 backface-hidden bg-slate-900 border-slate-800 p-8 flex flex-col justify-center gap-6">
          <div className="text-center">
            <Zap className="h-10 w-10 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-50">Welcome Back</h2>
            <p className="text-slate-400 text-sm">
              Log in to your Skypaws account
            </p>
          </div>

          <form onSubmit={(e) => handleAuth(e, "login")} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              className="bg-slate-950 border-slate-800"
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              className="bg-slate-950 border-slate-800"
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <button
              onClick={() => setIsFlipped(true)}
              className="text-indigo-400 font-semibold hover:underline"
            >
              Register
            </button>
          </p>
        </Card>

        {/* --- REGISTER SIDE (BACK) --- */}
        <Card
          className="absolute inset-0 backface-hidden bg-slate-900 border-slate-800 p-8 flex flex-col justify-center gap-6"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="text-center">
            <UserPlus className="h-10 w-10 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-50">Create Account</h2>
            <p className="text-slate-400 text-sm">Join the Skypaws community</p>
          </div>

          <form
            onSubmit={(e) => handleAuth(e, "register")}
            className="space-y-4"
          >
            <Input
              placeholder="Full Name"
              className="bg-slate-950 border-slate-800"
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              type="email"
              placeholder="Email"
              className="bg-slate-950 border-slate-800"
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              className="bg-slate-950 border-slate-800"
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <button
              onClick={() => setIsFlipped(false)}
              className="text-indigo-400 font-semibold hover:underline"
            >
              Login
            </button>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
