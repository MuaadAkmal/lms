import Link from 'next/link'
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default function HomePage() {
  const { userId } = auth()

  if (userId) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Top bar */}
      <header className="fixed top-4 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-white/40 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-sm">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-600">
                  <path d="M3 10.5L12 4l9 6.5" stroke="#0369A1" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 21V11h14v10" stroke="#0369A1" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">House Care</div>
                <div className="text-xs text-slate-500 -mt-0.5">Leave management & approvals</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link href="/sign-in" className="text-sm px-3 py-1.5 rounded-md bg-white/60 hover:bg-white/70 transition-shadow shadow-sm border border-white/10">
                Sign In
              </Link>
              <Link href="/sign-up" className="text-sm px-3 py-1.5 rounded-md bg-sky-600 text-white hover:bg-sky-700 transition-shadow shadow">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex items-center justify-center min-h-screen pt-16">
        <div className="max-w-7xl w-full px-6 py-16">
          <div className="bg-white/50 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center ring-1 ring-gray-400/20">

            {/* Left - Content */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">House Care</h1>
              <p className="text-lg text-slate-700 max-w-2xl">
                Simplify leave requests, approvals, and scheduling for households and small teams. Fast approvals, clear visibility, and role-based controls — all in a clean, minimal interface.
              </p>

              <div className="flex items-center gap-4">
                <Link href="/sign-up" className="inline-flex items-center justify-center rounded-md bg-sky-600 hover:bg-sky-700 text-white text-sm px-4 py-2 shadow-md">
                  Get Started
                </Link>
                <Link href="#features" className="inline-flex items-center justify-center rounded-md border border-white/30 text-sm px-4 py-2 bg-white/30 hover:bg-white/40">
                  Learn More
                </Link>
              </div>

              <div className="mt-4 flex gap-6">
                <div className="text-sm">
                  <div className="font-semibold text-slate-800">For</div>
                  <div className="text-xs text-slate-500">Employees • Supervisors • Admins</div>
                </div>

                <div className="text-sm">
                  <div className="font-semibold text-slate-800">Privacy</div>
                  <div className="text-xs text-slate-500">Locally-hosted data, Clerk auth</div>
                </div>
              </div>
            </div>

            {/* Right - Illustration (larger, more present) */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md p-6 rounded-xl bg-gradient-to-br from-white/80 to-sky-50 border border-white/30 shadow-lg ring-1 ring-gray-400/20">
                {/* Larger illustrative SVG: house + calendar + clock */}
                <svg viewBox="0 0 640 480" className="w-full h-auto">
                  <defs>
                    <linearGradient id="g1" x1="0" x2="1">
                      <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>

                  {/* house */}
                  <g transform="translate(80,60)">
                    <path d="M240 30 L40 150 L40 300 H200 V200 H280 V300 H360 V150 Z" fill="url(#g1)" opacity="0.14" stroke="#0369A1" strokeWidth="3" />
                    <rect x="80" y="200" width="80" height="60" rx="6" fill="#fff" stroke="#0369A1" strokeWidth="2" />
                    <rect x="200" y="220" width="100" height="80" rx="8" fill="#fff" stroke="#0369A1" strokeWidth="2" />
                  </g>

                  {/* calendar */}
                  <g transform="translate(320,80)">
                    <rect x="0" y="0" width="200" height="160" rx="12" fill="#fff" stroke="#0F172A" strokeWidth="2" />
                    <line x1="0" y1="36" x2="200" y2="36" stroke="#0F172A" strokeWidth="1" />
                    <circle cx="36" cy="24" r="6" fill="#0F172A" />
                    <circle cx="164" cy="24" r="6" fill="#0F172A" />
                    <g transform="translate(18,52)" fill="#0369A1">
                      <rect x="0" y="0" width="36" height="28" rx="6" />
                      <rect x="44" y="0" width="36" height="28" rx="6" />
                      <rect x="88" y="0" width="36" height="28" rx="6" />
                      <rect x="132" y="0" width="36" height="28" rx="6" />

                      <rect x="0" y="36" width="36" height="28" rx="6" opacity="0.9" />
                      <rect x="44" y="36" width="36" height="28" rx="6" opacity="0.9" />
                    </g>
                  </g>

                  {/* clock badge */}
                  <g transform="translate(460,18)">
                    <circle cx="40" cy="40" r="34" fill="#fff" stroke="#0369A1" strokeWidth="2" />
                    <path d="M40 24 v20" stroke="#0369A1" strokeWidth="3" strokeLinecap="round" />
                    <path d="M40 40 h12" stroke="#0369A1" strokeWidth="3" strokeLinecap="round" />
                  </g>
                </svg>
              </div>
            </div>

          </div>

          {/* Features */}
          <section id="features" className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-white/60 backdrop-blur rounded-xl border border-white/20 shadow-sm ring-1 ring-gray-400/15">
              <h4 className="font-semibold">Request Leave</h4>
              <p className="text-sm text-slate-600 mt-2">Employees submit single or multi-day requests with time details.</p>
            </div>
            <div className="p-5 bg-white/60 backdrop-blur rounded-xl border border-white/20 shadow-sm ring-1 ring-gray-400/15">
              <h4 className="font-semibold">Approve & Manage</h4>
              <p className="text-sm text-slate-600 mt-2">Supervisors approve or reject, Admin can manage users and assignments.</p>
            </div>
            <div className="p-5 bg-white/60 backdrop-blur rounded-xl border border-white/20 shadow-sm ring-1 ring-gray-400/15">
              <h4 className="font-semibold">Reports & Search</h4>
              <p className="text-sm text-slate-600 mt-2">Search requests by employee or status, export reports for analysis.</p>
            </div>
          </section>

          <div className="mt-8 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} House Care — Leave management made simple.
          </div>
        </div>
      </main>
    </div>
  )
}
