import Link from "next/link";
import { Activity, Shield, Users, Calendar, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-teal-50 dark:from-slate-950 dark:via-sky-950/30 dark:to-teal-950/20">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-12 py-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
            <Activity className="text-white" size={22} />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            SmartHospital
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-teal-500 rounded-xl hover:from-sky-600 hover:to-teal-600 transition-all shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-xs font-semibold mb-6">
          <Activity size={14} />
          Smart Hospital Workflow System
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
          Modern Healthcare
          <br />
          <span className="gradient-text">Management Made Simple</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
          Streamline your hospital operations with role-based dashboards,
          intelligent appointment workflows, and secure data management.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-teal-500 rounded-2xl hover:from-sky-600 hover:to-teal-600 shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 transition-all hover:-translate-y-0.5"
          >
            Start Now
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:-translate-y-0.5"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Users,
              color: "#0ea5e9",
              title: "Multi-Role Access",
              desc: "Dedicated dashboards for Patients, Doctors, Staff, and Administrators with tailored workflows.",
            },
            {
              icon: Calendar,
              color: "#14b8a6",
              title: "Smart Appointments",
              desc: "Automated appointment management with verification, assignment, and status tracking.",
            },
            {
              icon: Shield,
              color: "#8b5cf6",
              title: "Secure & Compliant",
              desc: "Row-level security policies ensure every user sees only their authorized data.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group relative rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-slate-900/40 transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${f.color}15` }}
              >
                <f.icon size={24} style={{ color: f.color }} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        © 2026 Smart Hospital Workflow System. All rights reserved.
      </footer>
    </div>
  );
}
