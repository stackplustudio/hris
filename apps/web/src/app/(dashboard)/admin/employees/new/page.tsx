'use client';

import { useState } from 'react';
import { FileText, IdCard, ReceiptText } from 'lucide-react';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function NewEmployeePage() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    position: '',
    employmentStatus: 'ACTIVE',
    nik: '',
    npwp: '',
  });

  // State Dokumen Karyawan (EMP-03)
  const [documents, setDocuments] = useState({
    contractFile: null as string | null,
    ktpFile: null as string | null,
    npwpFile: null as string | null,
  });

  const handleFileUpload = (type: 'contractFile' | 'ktpFile' | 'npwpFile', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran berkas maksimal 5MB');
      return;
    }

    setDocuments((prev) => ({
      ...prev,
      [type]: file.name,
    }));
    toast.success(`Berkas ${file.name} siap diunggah!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.tenant?.id) return toast.error('Sesi tidak valid');
    
    setIsSubmitting(true);
    try {
      await api.post('/employees', {
        ...formData,
        tenantId: session.tenant.id,
      });

      toast.success('Karyawan berhasil didaftarkan & akun portal aktif!');
      router.push('/admin/employees');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menambahkan karyawan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      
      {/* Header Glass */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">Pendaftaran Karyawan Baru</h1>
          <p className="text-gray-600 font-medium mt-1">Buat profil kerja, akun kredensial portal, dan unggah dokumen pendukung.</p>
        </div>
        <Link 
          href="/admin/employees" 
          className="px-6 py-3 bg-white/60 hover:bg-white text-gray-700 font-bold rounded-2xl border border-white/80 transition-all text-sm"
        >
          ← Kembali ke Direktori
        </Link>
      </div>

      {/* Form Glassmorphism */}
      <div className="bg-white/30 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)]">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Bagian 1: Data Utama Karyawan */}
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">1. Informasi Profil & Akses Portal</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-5 py-4 bg-white/50 border border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-[#1A1A1A] font-medium placeholder-gray-400 transition-all"
                  placeholder="Contoh: Pratama Arhan"
                />
              </div>

              {/* Email Perusahaan */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Perusahaan (Untuk Login)</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-5 py-4 bg-white/50 border border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-[#1A1A1A] font-medium placeholder-gray-400 transition-all"
                  placeholder="arhan@stackplustudio.com"
                />
              </div>

              {/* Password Awal */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password Akun</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-5 py-4 bg-white/50 border border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-[#1A1A1A] font-medium placeholder-gray-400 transition-all"
                  placeholder="Minimal 6 karakter"
                />
              </div>

              {/* Posisi / Jabatan */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Posisi / Jabatan</label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-5 py-4 bg-white/50 border border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-[#1A1A1A] font-medium placeholder-gray-400 transition-all"
                  placeholder="Contoh: Senior Frontend Developer"
                />
              </div>

              {/* Status Karyawan */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Status Ikatan Kerja</label>
                <select
                  value={formData.employmentStatus}
                  onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                  className="w-full px-5 py-4 bg-white/50 border border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-[#1A1A1A] font-medium transition-all"
                >
                  <option value="ACTIVE">Karyawan Tetap (ACTIVE)</option>
                  <option value="PROBATION">Masa Percobaan (PROBATION)</option>
                  <option value="ON_LEAVE">Cuti Panjang (ON_LEAVE)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bagian 2: Upload Dokumen Karyawan (EMP-03) */}
          <div className="space-y-4 pt-6 border-t border-white/40">
            <div>
              <h2 className="text-xl font-extrabold text-[#1A1A1A]">2. Dokumen Legalitas Karyawan (EMP-03)</h2>
              <p className="text-gray-500 font-medium text-xs mt-1">Unggah berkas kontrak kerja, identitas KTP, dan NPWP untuk arsip kepatuhan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Berkas Kontrak Kerja */}
              <div className="bg-white/40 border border-dashed border-gray-300 rounded-2xl p-5 text-center space-y-3">
                <div className="w-10 h-10 bg-blue-50 text-[#0052FF] rounded-xl flex items-center justify-center font-bold mx-auto text-lg">
                  <FileText aria-hidden="true" size={20} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Surat Perjanjian Kerja</p>
                  <p className="text-xs text-gray-400">Format PDF (Maks. 5MB)</p>
                </div>
                {documents.contractFile ? (
                  <p className="text-xs font-bold text-green-600 truncate">✓ {documents.contractFile}</p>
                ) : (
                  <label className="inline-block px-4 py-2 bg-white text-[#0052FF] font-bold text-xs rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all">
                    Pilih File
                    <input 
                      type="file" 
                      accept=".pdf" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload('contractFile', e)}
                    />
                  </label>
                )}
              </div>

              {/* Berkas KTP */}
              <div className="bg-white/40 border border-dashed border-gray-300 rounded-2xl p-5 text-center space-y-3">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center font-bold mx-auto text-lg">
                  <IdCard aria-hidden="true" size={20} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Scan / Foto KTP</p>
                  <p className="text-xs text-gray-400">Format JPG, PNG, PDF</p>
                </div>
                {documents.ktpFile ? (
                  <p className="text-xs font-bold text-green-600 truncate">✓ {documents.ktpFile}</p>
                ) : (
                  <label className="inline-block px-4 py-2 bg-white text-[#0052FF] font-bold text-xs rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all">
                    Pilih File
                    <input 
                      type="file" 
                      accept=".jpg,.jpeg,.png,.pdf" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload('ktpFile', e)}
                    />
                  </label>
                )}
              </div>

              {/* Berkas NPWP */}
              <div className="bg-white/40 border border-dashed border-gray-300 rounded-2xl p-5 text-center space-y-3">
                <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center font-bold mx-auto text-lg">
                  <ReceiptText aria-hidden="true" size={20} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Kartu NPWP</p>
                  <p className="text-xs text-gray-400">Format JPG, PNG, PDF</p>
                </div>
                {documents.npwpFile ? (
                  <p className="text-xs font-bold text-green-600 truncate">✓ {documents.npwpFile}</p>
                ) : (
                  <label className="inline-block px-4 py-2 bg-white text-[#0052FF] font-bold text-xs rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all">
                    Pilih File
                    <input 
                      type="file" 
                      accept=".jpg,.jpeg,.png,.pdf" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload('npwpFile', e)}
                    />
                  </label>
                )}
              </div>

            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-5 bg-gradient-to-r from-[#0052FF] to-blue-500 text-white font-bold rounded-2xl hover:shadow-[0_8px_30px_rgb(0,82,255,0.4)] transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-70 flex items-center gap-3 text-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              {isSubmitting ? 'Mendaftarkan Akun...' : 'Simpan & Terbitkan Akun'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
