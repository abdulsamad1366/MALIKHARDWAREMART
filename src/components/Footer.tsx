/**
 * @file Footer.tsx
 * @description Apple & Google Minimalist B2B Footer styled with Tailwind CSS.
 * Outlines corporate trade services, physical distribution hub,
 * category links, and legal trade credentials.
 */

import React from 'react';
import Link from 'next/link';
import { Wrench, Phone, Mail, MapPin, ShieldCheck, Truck, CreditCard, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#F5F5F7] border-t border-slate-200/80 pt-12 pb-8 text-slate-600">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Value Proposition Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-10 mb-10 border-b border-slate-200/80">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Award size={22} />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900">100% Genuine Brands</div>
              <div className="text-[11px] text-slate-500">Direct from authorized OEM plants</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900">B2B Wholesale Rates</div>
              <div className="text-[11px] text-slate-500">Tiered trade volume discounts</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Truck size={22} />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900">Express Site Freight</div>
              <div className="text-[11px] text-slate-500">Direct warehouse & site logistics</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <CreditCard size={22} />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900">Trade Credit & COD</div>
              <div className="text-[11px] text-slate-500">Flexible contractor billing</div>
            </div>
          </div>
        </div>

        {/* Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand & Warehouse Info */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
                <Wrench size={18} />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm tracking-tight text-slate-900">MALIK</span>
                <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase -mt-0.5">HARDWARE MART</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Premier B2B distributor of industrial power tools, high tensile fasteners,
              architectural ironmongery, electrical switchgear, and plumbing assemblies.
              Serving contractors and fabricators across India.
            </p>
            <div className="flex flex-col gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-amber-600 shrink-0" />
                <span>124 G.T. Road, Industrial Hardware Hub, Delhi 110006, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-amber-600 shrink-0" />
                <span>+91 98765 43210 / 011-23948572</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-amber-600 shrink-0" />
                <span>trade@malikhardware.com</span>
              </div>
            </div>
          </div>

          {/* Catalog Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
              Product Catalog
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-slate-500">
              <li><Link href="/category/hand-power-tools" className="hover:text-red-600 transition-colors">Hand & Power Tools</Link></li>
              <li><Link href="/category/fasteners-fixings" className="hover:text-red-600 transition-colors">Fasteners & Fixings</Link></li>
              <li><Link href="/category/electrical-lighting" className="hover:text-red-600 transition-colors">Electrical & Lighting</Link></li>
              <li><Link href="/category/plumbing-pipes" className="hover:text-red-600 transition-colors">Plumbing & Valves</Link></li>
              <li><Link href="/category/architectural-hardware" className="hover:text-red-600 transition-colors">Architectural Hardware</Link></li>
              <li><Link href="/category/safety-workwear" className="hover:text-red-600 transition-colors">Safety & Workwear</Link></li>
              <li><Link href="/category/paints-chemicals" className="hover:text-red-600 transition-colors">Paints & Sealants</Link></li>
            </ul>
          </div>

          {/* Trade Accounts */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
              Trade Accounts
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-slate-500">
              <li><Link href="/login" className="hover:text-red-600 transition-colors">Wholesale Login</Link></li>
              <li><Link href="/register" className="hover:text-red-600 transition-colors">Create Trade Account</Link></li>
              <li><Link href="/cart" className="hover:text-red-600 transition-colors">Trade Cart</Link></li>
              <li><Link href="/orders" className="hover:text-red-600 transition-colors">Order Tracking</Link></li>
              <li><Link href="/account" className="hover:text-red-600 transition-colors">Billing & Addresses</Link></li>
              <li><Link href="/admin" className="hover:text-red-600 transition-colors">Staff Admin Portal</Link></li>
            </ul>
          </div>

          {/* Wholesale Help */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
              Contractor Support
            </h4>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Need bulk quotations, project tenders, or test certificates (MTC)?
              Speak directly with our dedicated hardware engineers.
            </p>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Wholesale Inquiry Desk
              </div>
              <div className="text-base font-extrabold text-amber-600 mt-1">
                +91 98765 43210
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Mon - Sat: 9:00 AM - 7:30 PM IST
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal / Credentials */}
        <div className="border-t border-slate-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} Malik Hardware Mart. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>GST Registered B2B Distributor</span>
            <span>•</span>
            <span>CIN: U28999DL2018PTC328900</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
