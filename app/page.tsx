"use client";

import Image from "next/image";
import { AuthForm } from "@/app/components/auth/auth-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  MapPin,
  Phone,
  ShieldCheck,
  Clock,
  Facebook,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-950 font-sans text-slate-50 selection:bg-pink-500/30">
      {/* Decorative Brand Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation Header */}
      <header className="flex h-20 w-full items-center justify-between px-6 md:px-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {/* Using the Sky Paws & Claws Logo Style */}
          <div className="relative h-12 w-12 rounded-full border-2 border-pink-500 bg-white p-1 overflow-hidden shrink-0">
            <Image
              src="/favicon-512x512.png" // Ensure you save the uploaded logo here
              alt="Sky Paws Logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black leading-none tracking-tight">
              SKY PAWS
            </span>
            <span className="text-[10px] font-bold text-blue-500 tracking-[0.2em]">
              CLINIC & CLAWS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge
            variant="outline"
            className="hidden md:flex border-pink-500/50 text-pink-400 gap-1.5 px-3 py-1"
          >
            <Clock className="h-3 w-3" /> Closed Now
          </Badge>
          <a
            href="https://www.facebook.com/profile.php?id=100090768115762&rdid=buZj9GKmCpbeVOBW&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1C3gPEKxSo%2F#"
            className="text-slate-400 hover:text-blue-500 transition-colors"
          >
            <Facebook className="h-5 w-5" />
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col lg:flex-row max-w-[1600px] mx-auto">
        {/* Left: Informational Branding */}
        <section className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24 space-y-10">
          <div className="space-y-6">
            <Badge className="bg-blue-600 hover:bg-blue-600 text-white border-none px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              Veterinary Services
            </Badge>
            <h1 className="text-5xl md:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight">
              Expert Care for <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-pink-500">
                Your Happy Pets.
              </span>
            </h1>
            <p className="max-w-xl text-lg text-slate-400 leading-relaxed">
              Based in Albuera, Leyte, Sky Paws & Claws provides world-class
              medical, surgical, and professional grooming services for your
              beloved companions.
            </p>
          </div>

          {/* Neat Service Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            <div className="flex items-start gap-4 p-2">
              <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-pink-500 shrink-0 shadow-lg">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100">Medical Services</h3>
                <p className="text-sm text-slate-500">
                  Diagnostics, Surgery, and Consultation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-2">
              <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-500 shrink-0 shadow-lg">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100">Pet Grooming</h3>
                <p className="text-sm text-slate-500">
                  Professional styling and hygiene care.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Bar */}
          <div className="flex flex-wrap gap-8 pt-10 border-t border-slate-800/50">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
              <MapPin className="h-5 w-5 text-pink-500" />
              Brgy. Lawis, Albuera, Leyte
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
              <Phone className="h-5 w-5 text-blue-500" />
              +1 (555) SKY-PAWS
            </div>
          </div>
        </section>

        {/* Right: Focused Auth Form */}
        <section className="flex-1 bg-slate-900/30 border-l border-slate-800/50 flex items-center justify-center p-8 md:p-16">
          <div className="w-full max-w-md relative">
            {/* Subtle glow behind the form */}
            <div className="absolute -inset-4 bg-pink-500/5 blur-2xl rounded-full" />
            <AuthForm />
          </div>
        </section>
      </main>

      <footer className="py-6 px-8 md:px-16 border-t border-slate-900 bg-black flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">
          Sky Paws & Claws &copy; 2026
        </span>
        <div className="flex gap-6 text-[10px] font-bold text-slate-500 uppercase">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
        </div>
      </footer>
    </div>
  );
}
