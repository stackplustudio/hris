'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

interface EmployeeItem {
  id: string;
  fullName: string;
  position: string;
  employmentStatus: string;
  joinDate: string;
  department?: { name: string } | null;
  user?: { email: string; role: string } | null;
}

export default function AdminEmployeesPage() {
  const { session, loading: authLoading } = useAuth();
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchEmployees = async () => {
    const tenantId = session?.tenant?.id;
    if (!tenantId) return;

    try {
      const res = await api.get(`/employees?tenantId=${tenantId}`);
      setEmployees(res.data);
    } catch (error) {
      toast.error('Gagal memuat direktori karyawan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchEmployees();
  }, [session, authLoading]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data karyawan ${name}?`)) return;

    try {
      await api.delete(`/employees/${id}`);
      toast.success(`Karyawan ${name} berhasil dihapus`);
      fetchEmployees();
    } catch (error) {
      toast.error('Gagal menghapus karyawan');
    }
  };

  // AUTH-05: Salin link aktivasi & kredensial login karyawan untuk onboarding
  const handleCopyInvite = (emp: EmployeeItem) => {
    const loginUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : 'https://stackplus.id/login';
    const message = `Halo ${emp.fullName},\n\nAkun portal StackPlus HRIS Anda telah dibuat.\n\n🔗 Tautan Portal: ${loginUrl}\n📧 Email: ${emp.user?.email || '-'}\n🔑 Password Default: Stackplus123!\n\nSilakan login dan segera perbarui password Anda.`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(message);
      toast.success(`Kredensial & tautan undangan ${emp.fullName} berhasil disalin ke clipboard!`);
    } else {
      toast.success(`Email: ${emp.user?.email || '-'}`);
    }
  };

  // Unduh contoh template CSV
  const handleDownloadTemplate = () => {
    const template = 'fullName,email,password,position,employmentStatus\nBudi Santoso,budi@stackplustudio.com,Password123!,Frontend Developer,ACTIVE\nCitra Dewi,citra@stackplustudio.com,Password123!,Product Designer,PROBATION';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Template_Import_Karyawan.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // EMP-06: Proses upload berkas CSV karyawan massal via /employees/bulk
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tenantId = session?.tenant?.id;
    if (!tenantId) return toast.error('Sesi tidak valid');

    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

        if (lines.length <= 1) {
          toast.error('Berkas CSV kosong atau hanya berisi baris judul');
          setIsImporting(false);
          return;
        }

        const dataRows = lines.slice(1);
        const payload: any[] = [];

        for (const row of dataRows) {
          const cols = row.split(',').map((c) => c.replace(/(^"|"$)/g, '').trim());
          if (cols.length >= 4) {
            const [fullName, email, password, position, employmentStatus] = cols;
            payload.push({
              fullName,
              email,
              password: password || 'Stackplus123!',
              position,
              employmentStatus: employmentStatus || 'ACTIVE',
            });
          }
        }

        if (payload.length === 0) {
          toast.error('Format data CSV tidak valid');
          setIsImporting(false);
          return;
        }

        const res = await api.post('/employees/bulk', {
          tenantId,
          employees: payload,
        });

        const successList = res.data.filter((r: any) => r.success);
        toast.success(`Berhasil mengimpor ${successList.length} dari ${payload.length} karyawan!`);
        setIsImportModalOpen(false);
        fetchEmployees();
      } catch (err) {
        toast.error('Gagal memproses berkas CSV');
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.user?.email && emp.user.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === 'ALL' || emp.employmentStatus === statusFilter;

    return matchSearch && matchStatus;
  });

  if (authLoading) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      
      {/* Header Glass */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">Direktori Karyawan</h1>
          <p className="text-gray-600 font-medium mt-1">Kelola master data, profil posisi, dan akun akses staf perusahaan.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-6 py-4 bg-white/70 hover:bg-white text-gray-800 rounded-2xl font-bold border border-white/80 transition-all flex items-center gap-2 shadow-sm"
          >
            <svg className="w-5 h-5 text-[#0052FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12"></path></svg>
            Import CSV (EMP-06)
          </button>

          <Link
            href="/admin/employees/new"
            className="px-8 py-4 bg-gradient-to-r from-[#0052FF] to-blue-500 hover:shadow-[0_8px_30px_rgb(0,82,255,0.4)] text-white font-bold rounded-2xl transition-all flex items-center gap-2 shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Tambah Karyawan
          </Link>
        </div>
      </div>

      {/* Filter & Pencarian */}
      <div className="bg-white/30 backdrop-blur-xl border border-white/60 p-6 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input
            type="text"
            placeholder="Cari nama, posisi, atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-sm font-medium transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {['ALL', 'ACTIVE', 'PROBATION', 'ON_LEAVE'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === status
                  ? 'bg-[#0052FF] text-white shadow-md shadow-blue-500/20'
                  : 'bg-white/50 text-gray-600 hover:bg-white'
              }`}
            >
              {status === 'ALL' ? 'Semua' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel Karyawan */}
      <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/40 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-6 font-bold">Karyawan</th>
                <th className="p-6 font-bold">Posisi & Departemen</th>
                <th className="p-6 font-bold">Status</th>
                <th className="p-6 font-bold">Tanggal Masuk</th>
                <th className="p-6 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500 font-bold">
                    Memuat direktori karyawan...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500 font-bold">
                    Tidak ada data karyawan yang cocok.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-white/40 transition-colors duration-200">
                    <td className="p-6">
                      <p className="font-extrabold text-[#1A1A1A]">{emp.fullName}</p>
                      <p className="text-sm font-medium text-gray-500">{emp.user?.email || '-'}</p>
                    </td>

                    <td className="p-6">
                      <p className="font-bold text-gray-800">{emp.position}</p>
                      <p className="text-xs font-semibold text-[#0052FF] mt-0.5">{emp.department?.name || 'General'}</p>
                    </td>

                    <td className="p-6">
                      <span className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                        emp.employmentStatus === 'ACTIVE'
                          ? 'bg-green-500/20 text-green-700 border border-green-500/30'
                          : emp.employmentStatus === 'PROBATION'
                          ? 'bg-yellow-500/20 text-yellow-700 border border-yellow-500/30'
                          : 'bg-gray-500/20 text-gray-700 border border-gray-500/30'
                      }`}>
                        {emp.employmentStatus}
                      </span>
                    </td>

                    <td className="p-6 font-medium text-gray-700 text-sm">
                      {new Date(emp.joinDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>

                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Tombol Salin Kredensial / Link Undangan (AUTH-05) */}
                        <button
                          onClick={() => handleCopyInvite(emp)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0052FF] rounded-xl font-bold text-xs border border-blue-200 transition-all flex items-center gap-1.5"
                          title="Salin Link Undangan & Kredensial"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                          Undang / Kredensial
                        </button>

                        {/* Tombol Hapus */}
                        <button
                          onClick={() => handleDelete(emp.id, emp.fullName)}
                          className="p-2 text-red-600 hover:bg-red-500/10 rounded-xl font-bold transition-all text-sm inline-flex items-center"
                          title="Hapus Karyawan"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL IMPORT KARYAWAN MASSAL (EMP-06) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] max-w-lg w-full p-8 shadow-2xl space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-black text-[#1A1A1A]">Import Karyawan Massal (CSV)</h2>
              <p className="text-sm text-gray-600 mt-1">Unggah berkas CSV untuk mendaftarkan banyak karyawan sekaligus.</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-blue-900">Belum punya template?</p>
                  <p className="text-xs text-blue-700">Gunakan format kolom yang sudah ditentukan.</p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 bg-white text-[#0052FF] font-bold text-xs rounded-xl shadow-sm border border-blue-200 hover:bg-blue-50 transition-all"
                >
                  Unduh Template
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center space-y-3">
                <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <div>
                  <p className="text-sm font-bold text-gray-700">Pilih berkas CSV dari komputer</p>
                  <p className="text-xs text-gray-400 mt-0.5">Format: .csv (Maksimal 100 baris)</p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={isImporting}
                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0052FF] file:text-white hover:file:bg-blue-600 cursor-pointer"
                />
              </div>

              {isImporting && (
                <div className="flex items-center justify-center gap-3 py-2 text-[#0052FF] font-bold text-sm">
                  <div className="w-5 h-5 border-2 border-[#0052FF] border-t-transparent rounded-full animate-spin"></div>
                  Memproses import ke sistem...
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                disabled={isImporting}
                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
