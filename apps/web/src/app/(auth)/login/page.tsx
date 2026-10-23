'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Cookies from "js-cookie";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await api.post("/auth/login", { email, password });
      
      if (res.data.access_token) {
        const token = res.data.access_token;
        
        Cookies.set("token", token, { expires: 1 });
        localStorage.setItem("token", token);
        
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decodedToken = JSON.parse(jsonPayload);
        
        toast.success("Otentikasi Berhasil! Mengalihkan...");

        if (decodedToken.role === 'SUPER_ADMIN' || decodedToken.role === 'COMPANY_ADMIN') {
          router.push("/admin");
        } else {
          router.push("/employee");
        }
      }
    } catch (error: any) {
      toast.error("❌ Gagal: " + (error.response?.data?.message || "Email atau Password salah"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex bg-[#0052FF] font-sans overflow-hidden">
      
      {/* SISI KIRI: Branding / Hero Text */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 text-white relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0052FF] via-blue-600 to-[#1A1A1A] opacity-90 z-0"></div>
        
        {/* Logo StackPlus */}
        <div className="relative z-10">
          <Link href="/">
            <Image 
              src="/logo.png" 
              alt="StackPlus Studio" 
              width={180} 
              height={60} 
              className="object-contain filter brightness-0 invert cursor-pointer"
              priority
            />
          </Link>
        </div>

        {/* Teks Sambutan */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            Hey, Hello! <br />Welcome Back.
          </h1>
          <p className="text-blue-100 font-medium text-lg leading-relaxed">
            Platform HRIS Terintegrasi untuk mengelola operasional tim, kehadiran, payroll, dan analitik perusahaan tanpa batas.
          </p>
          <div className="pt-4">
            <span className="inline-block bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-sm font-bold tracking-wider">
              StackPlus Core Engine V1.0
            </span>
          </div>
        </div>

        <div className="relative z-10 text-xs text-blue-200 font-medium">
          © 2026 StackPlus Studio. All rights reserved.
        </div>
      </div>

      {/* SISI KANAN: Card Form Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F5F1E8] relative">
        
        <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 space-y-8">
          
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">Welcome Back</h2>
            <p className="text-gray-500 font-medium text-sm">Silakan masukkan kredensial akun Anda.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                placeholder="nama@stackplus.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full bg-gray-50 border border-gray-200 text-[#1A1A1A] px-5 py-4 rounded-2xl font-medium focus:ring-2 focus:ring-[#0052FF] focus:bg-white outline-none transition-all" 
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
                <Link href="/forgot-password" className="text-xs font-bold text-[#0052FF] hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="w-full bg-gray-50 border border-gray-200 text-[#1A1A1A] px-5 py-4 rounded-2xl font-medium focus:ring-2 focus:ring-[#0052FF] focus:bg-white outline-none transition-all" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-[#0052FF] hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-base shadow-[0_8px_30px_rgb(0,82,255,0.3)] transition-all transform hover:-translate-y-0.5 disabled:opacity-70"
            >
              {isLoading ? "Memproses..." : "Login"}
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">Atau</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="space-y-3 text-center">
            <p className="text-sm font-medium text-gray-600">
              Perusahaan baru?{" "}
              <Link href="/register" className="text-[#0052FF] font-bold hover:underline">
                Daftar Akun Perusahaan
              </Link>
            </p>
            <p className="text-xs text-gray-400">
              Karyawan belum punya akun? Hubungi Admin HRD perusahaan Anda.
            </p>
          </div>

        </div>
      </div>

    </main>
  );
}
