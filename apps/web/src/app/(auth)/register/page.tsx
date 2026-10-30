"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/axios";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    companyName: "",
    subdomain: "",
    adminEmail: "",
    adminPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({
    adminPassword: false,
    confirmPassword: false,
  });
  const router = useRouter();

  const generateSubdomain = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 30);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-generate subdomain saat nama perusahaan berubah
      if (name === "companyName") {
        updated.subdomain = generateSubdomain(value);
      }
      return updated;
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.adminPassword !== form.confirmPassword) {
      toast.error("Password dan Konfirmasi Password tidak cocok!");
      return;
    }

    if (form.adminPassword.length < 8) {
      toast.error("Password minimal 8 karakter.");
      return;
    }

    if (!form.subdomain) {
      toast.error("Subdomain tidak boleh kosong.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post("/auth/register", {
        companyName: form.companyName,
        subdomain: form.subdomain,
        adminEmail: form.adminEmail,
        adminPassword: form.adminPassword,
      });

      toast.success(res.data.message || "Akun berhasil dibuat!");

      // Redirect ke login setelah 1.5 detik
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal membuat akun. Coba lagi.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="hris-auth min-h-screen w-full flex bg-[#0052FF] font-sans overflow-hidden">
      {/* SISI KIRI: Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 text-white relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0052FF] via-blue-600 to-[#1A1A1A] opacity-90 z-0"></div>

        <div className="relative z-10">
          <Image
            src="/logo.png"
            alt="StackPlus Studio"
            width={180}
            height={90}
            className="object-contain filter brightness-0 invert"
            priority
          />
        </div>

        <div className="relative z-10 space-y-8 max-w-lg">
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            Mulai Perjalanan Digital Anda.
          </h1>
          <p className="text-blue-100 font-medium text-lg leading-relaxed">
            Daftar gratis selama 14 hari. Kelola karyawan, kehadiran, payroll,
            dan performa tim Anda dalam satu platform terintegrasi.
          </p>

          {/* Fitur-fitur unggulan */}
          <ul className="space-y-3">
            {[
              "Manajemen Karyawan & Direktori",
              "Absensi GPS Real-time",
              "Payroll & Slip Gaji Otomatis",
              "Manajemen Cuti & Perizinan",
              "Evaluasi Kinerja (KPI)",
            ].map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 text-blue-100 text-sm font-medium"
              >
                <span aria-hidden="true">✓</span>
                {f}
              </li>
            ))}
          </ul>

          <div className="pt-2">
            <span className="inline-block bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-sm font-bold tracking-wider">
              Gratis 14 Hari · Tidak Perlu Kartu Kredit
            </span>
          </div>
        </div>

        <div className="relative z-10 text-xs text-blue-200 font-medium">
          © 2026 StackPlus Studio. All rights reserved.
        </div>
      </div>

      {/* SISI KANAN: Form Register */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F5F1E8] overflow-y-auto">
        <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 space-y-6 my-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
              Buat Akun Perusahaan
            </h2>
            <p className="text-gray-500 font-medium text-sm">
              Isi data di bawah untuk memulai trial gratis 14 hari.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Nama Perusahaan */}
            <div className="space-y-1">
              <label
                htmlFor="register-company"
                className="text-xs font-bold text-gray-700 uppercase tracking-wider"
              >
                Nama perusahaan
              </label>
              <input
                id="register-company"
                type="text"
                name="companyName"
                autoComplete="organization"
                placeholder="PT. Contoh Jaya Indonesia"
                value={form.companyName}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 border border-gray-200 text-[#1A1A1A] px-5 py-4 rounded-2xl font-medium focus:ring-2 focus:ring-[#0052FF] focus:bg-white outline-none transition-all"
              />
            </div>

            {/* Subdomain */}
            <div className="space-y-1">
              <label
                htmlFor="register-subdomain"
                className="text-xs font-bold text-gray-700 uppercase tracking-wider"
              >
                Subdomain
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="register-subdomain"
                  type="text"
                  name="subdomain"
                  placeholder="contoh-jaya"
                  value={form.subdomain}
                  onChange={handleChange}
                  required
                  pattern="[a-z0-9-]+"
                  title="Hanya huruf kecil, angka, dan strip (-)"
                  className="flex-1 bg-gray-50 border border-gray-200 text-[#1A1A1A] px-5 py-4 rounded-2xl font-medium focus:ring-2 focus:ring-[#0052FF] focus:bg-white outline-none transition-all"
                />
                <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                  .stackplus.id
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Hanya huruf kecil, angka, dan tanda strip (-). Ini akan menjadi
                identitas unik perusahaan Anda.
              </p>
            </div>

            {/* Email Admin */}
            <div className="space-y-1">
              <label
                htmlFor="register-email"
                className="text-xs font-bold text-gray-700 uppercase tracking-wider"
              >
                Email admin
              </label>
              <input
                id="register-email"
                type="email"
                name="adminEmail"
                autoComplete="email"
                placeholder="admin@perusahaan.com"
                value={form.adminEmail}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 border border-gray-200 text-[#1A1A1A] px-5 py-4 rounded-2xl font-medium focus:ring-2 focus:ring-[#0052FF] focus:bg-white outline-none transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label
                htmlFor="register-password"
                className="text-xs font-bold text-gray-700 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="password-field">
                <input
                  id="register-password"
                  type={visiblePasswords.adminPassword ? "text" : "password"}
                  name="adminPassword"
                  autoComplete="new-password"
                  placeholder="Minimal 8 karakter"
                  value={form.adminPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full bg-gray-50 border border-gray-200 text-[#1A1A1A] px-5 py-4 rounded-2xl font-medium focus:ring-2 focus:ring-[#0052FF] focus:bg-white outline-none transition-all"
                />
                <button
                  aria-label={
                    visiblePasswords.adminPassword
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                  aria-pressed={visiblePasswords.adminPassword}
                  className="password-toggle"
                  onClick={() =>
                    setVisiblePasswords((current) => ({
                      ...current,
                      adminPassword: !current.adminPassword,
                    }))
                  }
                  type="button"
                >
                  {visiblePasswords.adminPassword ? (
                    <EyeOff aria-hidden="true" size={18} />
                  ) : (
                    <Eye aria-hidden="true" size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div className="space-y-1">
              <label
                htmlFor="register-password-confirm"
                className="text-xs font-bold text-gray-700 uppercase tracking-wider"
              >
                Konfirmasi password
              </label>
              <div className="password-field">
                <input
                  id="register-password-confirm"
                  type={visiblePasswords.confirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Ulangi password di atas"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  aria-invalid={
                    Boolean(form.confirmPassword) &&
                    form.adminPassword !== form.confirmPassword
                  }
                  aria-describedby={
                    form.confirmPassword &&
                    form.adminPassword !== form.confirmPassword
                      ? "register-password-error"
                      : undefined
                  }
                  className="w-full bg-gray-50 border border-gray-200 text-[#1A1A1A] px-5 py-4 rounded-2xl font-medium focus:ring-2 focus:ring-[#0052FF] focus:bg-white outline-none transition-all"
                />
                <button
                  aria-label={
                    visiblePasswords.confirmPassword
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                  aria-pressed={visiblePasswords.confirmPassword}
                  className="password-toggle"
                  onClick={() =>
                    setVisiblePasswords((current) => ({
                      ...current,
                      confirmPassword: !current.confirmPassword,
                    }))
                  }
                  type="button"
                >
                  {visiblePasswords.confirmPassword ? (
                    <EyeOff aria-hidden="true" size={18} />
                  ) : (
                    <Eye aria-hidden="true" size={18} />
                  )}
                </button>
              </div>
              {form.confirmPassword &&
                form.adminPassword !== form.confirmPassword && (
                  <p
                    aria-live="polite"
                    className="text-xs text-red-500 font-medium"
                    id="register-password-error"
                  >
                    Password tidak cocok
                  </p>
                )}
            </div>

            <button
              type="submit"
              aria-busy={isLoading}
              disabled={isLoading}
              className="w-full bg-[#0052FF] hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-base shadow-[0_8px_30px_rgb(0,82,255,0.3)] transition-all transform hover:-translate-y-0.5 disabled:opacity-70"
            >
              {isLoading ? "Memproses..." : "Daftar sekarang"}
            </button>
          </form>

          <p className="text-center text-sm font-medium text-gray-500">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-[#0052FF] font-bold hover:underline"
            >
              Masuk di sini
            </Link>
          </p>

          <p className="text-center text-xs text-gray-400">
            Dengan mendaftar, Anda menyetujui{" "}
            <span className="font-semibold text-gray-500">
              Syarat & Ketentuan
            </span>{" "}
            dan{" "}
            <span className="font-semibold text-gray-500">
              Kebijakan Privasi
            </span>{" "}
            StackPlus Studio.
          </p>
        </div>
      </div>
    </main>
  );
}
