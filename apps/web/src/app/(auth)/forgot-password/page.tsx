'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/axios";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [form, setForm] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Password dan konfirmasi tidak cocok!");
      return;
    }

    if (form.newPassword.length < 8) {
      toast.error("Password minimal 8 karakter.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.patch("/auth/reset-password", {
        email: form.email,
        newPassword: form.newPassword,
      });

      toast.success(res.data.message || "Password berhasil diperbarui!");
      setStep('success');
    } catch (error: any) {
      toast.error("❌ " + (error.response?.data?.message || "Gagal memperbarui password."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex bg-[#0052FF] font-sans overflow-hidden">
      
      {/* SISI KIRI: Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 text-white relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0052FF] via-blue-600 to-[#1A1A1A] opacity-90 z-0"></div>
        
        <div className="relative z-10">
          <Image 
            src="/logo.png" 
            alt="StackPlus Studio" 
            width={180} 
            height={60} 
            className="object-contain filter brightness-0 invert"
            priority
          />
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            Reset<br />Password Anda.
          </h1>
          <p className="text-blue-100 font-medium text-lg leading-relaxed">
            Masukkan email dan password baru Anda. Fitur ini tersedia untuk semua pengguna terdaftar di StackPlus HRIS.
          </p>
          <div className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
            <p className="text-sm text-blue-100 font-medium">
              💡 <strong>Catatan:</strong> Jika Anda lupa email yang terdaftar, silakan hubungi Admin perusahaan atau tim support StackPlus.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-xs text-blue-200 font-medium">
          © 2026 StackPlus Studio. All rights reserved.
        </div>
      </div>

      {/* SISI KANAN: Form Reset Password */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F5F1E8]">
        
        <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 space-y-8">
          
          {step === 'form' ? (
            <>
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">Reset Password</h2>
                <p className="text-gray-500 font-medium text-sm">
                  Masukkan email terdaftar dan password baru Anda.
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email Terdaftar</label>
                  <input 
                    type="email"
                    name="email"
                    placeholder="email@perusahaan.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 text-[#1A1A1A] px-5 py-4 rounded-2xl font-medium focus:ring-2 focus:ring-[#0052FF] focus:bg-white outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Password Baru</label>
                  <input 
                    type="password"
                    name="newPassword"
                    placeholder="Minimal 8 karakter"
                    value={form.newPassword}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="w-full bg-gray-50 border border-gray-200 text-[#1A1A1A] px-5 py-4 rounded-2xl font-medium focus:ring-2 focus:ring-[#0052FF] focus:bg-white outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Konfirmasi Password Baru</label>
                  <input 
                    type="password"
                    name="confirmPassword"
                    placeholder="Ulangi password baru"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border border-gray-200 text-[#1A1A1A] px-5 py-4 rounded-2xl font-medium focus:ring-2 focus:ring-[#0052FF] focus:bg-white outline-none transition-all"
                  />
                  {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                    <p className="text-xs text-red-500 font-medium">Password tidak cocok</p>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0052FF] hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-base shadow-[0_8px_30px_rgb(0,82,255,0.3)] transition-all transform hover:-translate-y-0.5 disabled:opacity-70"
                >
                  {isLoading ? "Memproses..." : "🔒 Perbarui Password"}
                </button>
              </form>

              <p className="text-center text-sm font-medium text-gray-500">
                Ingat password Anda?{" "}
                <Link href="/login" className="text-[#0052FF] font-bold hover:underline">
                  Kembali Login
                </Link>
              </p>
            </>
          ) : (
            /* Success State */
            <div className="text-center space-y-6 py-8">
              <div className="text-7xl">✅</div>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-[#1A1A1A]">Password Diperbarui!</h2>
                <p className="text-gray-500 font-medium">
                  Password Anda telah berhasil diperbarui. Silakan login dengan password baru Anda.
                </p>
              </div>
              <Link 
                href="/login"
                className="inline-block bg-[#0052FF] hover:bg-blue-700 text-white py-4 px-8 rounded-2xl font-bold text-base shadow-[0_8px_30px_rgb(0,82,255,0.3)] transition-all transform hover:-translate-y-0.5"
              >
                Login Sekarang →
              </Link>
            </div>
          )}
        </div>
      </div>

    </main>
  );
}

