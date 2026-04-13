"use client";

import Link from "next/link";
import { Activity, Shield, Users, Calendar, ArrowRight, Sparkles, Heart, Activity as Pulse } from "lucide-react";
import { Component as InfiniteGrid } from "@/components/ui/the-infinite-grid";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-950 relative overflow-hidden font-sans selection:bg-sky-500/20">
      {/* Background Shader & Ethereal Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-100">
        <InfiniteGrid />
      </div>

      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-200/40 blur-[120px] rounded-full" />
      <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-teal-100/40 blur-[120px] rounded-full" />
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-purple-100/30 blur-[100px] rounded-full" />

      {/* Header */}
      <header className="sticky top-0 z-50 px-6 md:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass px-6 py-3 rounded-2xl border-white/60 shadow-xl shadow-slate-200/50 backdrop-blur-xl bg-white/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Activity className="text-white" size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              SmartHospital
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
            <Link href="#features" className="hover:text-sky-600 transition-colors">Features</Link>
            <Link href="#solutions" className="hover:text-sky-600 transition-colors">Solutions</Link>
            <Link href="#contact" className="hover:text-sky-600 transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-sky-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-sky-500 via-sky-600 to-teal-500 rounded-xl hover:scale-105 transition-all shadow-xl shadow-sky-500/20 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-32 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 border border-sky-200 text-sky-700 text-xs font-bold mb-8 backdrop-blur-md">
          <Sparkles size={14} className="animate-pulse text-sky-500" />
          <span>Smart Hospital Workflow System</span>
        </div>
        
        <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tighter">
          Modern Healthcare
          <br />
          <span className="bg-gradient-to-r from-sky-600 via-teal-600 to-sky-700 bg-clip-text text-transparent">
            Management Made Simple
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-semibold">
          Streamline your hospital operations with role-based dashboards,
          intelligent appointment workflows, and secure data management.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href="/register"
            className="group relative inline-flex items-center gap-3 px-10 py-4 text-base font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 rounded-2xl hover:scale-105 shadow-2xl shadow-sky-600/20 transition-all active:scale-95 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Now
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-3 px-10 py-4 text-base font-bold text-slate-700 bg-white/60 border border-white rounded-2xl hover:bg-white transition-all shadow-lg hover:-translate-y-1 backdrop-blur-md"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features - Bento Grid Style */}
      <section id="features" className="max-w-7xl mx-auto px-6 md:px-12 pb-32 animate-fade-in delay-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Users,
              color: "#0284c7",
              title: "Multi-Role Access",
              desc: "Dedicated dashboards for Patients, Doctors, Staff, and Administrators with tailored workflows.",
              span: "col-span-1",
              accent: "bg-sky-50"
            },
            {
              icon: Calendar,
              color: "#0d9488",
              title: "Smart Appointments",
              desc: "Automated appointment management with verification, assignment, and status tracking.",
              span: "col-span-1 md:col-span-2",
              accent: "bg-teal-50"
            },
            {
              icon: Shield,
              color: "#dc2626",
              title: "Secure & Compliant",
              desc: "Row-level security policies ensure every user sees only their authorized data.",
              span: "col-span-1 md:col-span-2",
              accent: "bg-red-50"
            },
            {
              icon: Pulse,
              color: "#7c3aed",
              title: "Vital Tracking",
              desc: "Real-time monitoring and historical data analysis for informed clinical decisions.",
              span: "col-span-1",
              accent: "bg-purple-50"
            }
          ].map((f, i) => (
            <div
              key={f.title}
              className={`group relative rounded-3xl bg-white/50 border border-white p-8 hover:bg-white transition-all duration-500 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-sky-500/5 hover:-translate-y-1 backdrop-blur-md ${f.span}`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${f.accent}`}
              >
                <f.icon size={28} style={{ color: f.color }} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                {f.title}
              </h3>
              <p className="text-base text-slate-500 leading-relaxed font-semibold opacity-80 group-hover:opacity-100 transition-opacity">
                {f.desc}
              </p>
              
              {/* Decorative corner element */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={20} className="text-slate-300 -rotate-45" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-12 border-t border-slate-200 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
          <Activity className="text-sky-500" size={18} />
          <span className="text-sm font-black tracking-tight text-slate-900 uppercase">
            SmartHospital
          </span>
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          © 2026 Smart Hospital Workflow System. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
           <Link href="#" className="hover:text-sky-600">Security</Link>
           <Link href="#" className="hover:text-sky-600">Terms</Link>
           <Link href="#" className="hover:text-sky-600">Network</Link>
        </div>
      </footer>

      <style jsx>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
