'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';

export default function EmployeePayslipsPage() {
  const { session, loading } = useAuth();
  const [payslips, setPayslips] = useState<any[]>([]);
  const [selectedSlip, setSelectedSlip] = useState<any | null>(null);

  useEffect(() => {
    const fetchMyPayslips = async () => {
      try {
        const res = await api.get('/payroll/my-payslips');
        setPayslips(res.data);
      } catch (error) {
        console.error('Gagal memuat slip gaji');
      }
    };
    if (!loading) fetchMyPayslips();
  }, [loading]);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  if (loading) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)]">
        <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight mb-2">Slip Gaji Elektronik</h1>
        <p className="text-gray-600 font-medium">Lihat dan cetak dokumen distribusi kompensasi bulanan Anda dengan aman.</p>
      </div>

      {/* Grid Slip Gaji */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {payslips.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-gray-500 font-bold bg-white/30 backdrop-blur-xl border border-white/60 rounded-[2rem]">
            Belum ada slip gaji yang diterbitkan untuk akun Anda.
          </div>
        ) : (
          payslips.map((slip) => (
            <div key={slip.id} className="bg-white/30 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] hover:-translate-y-2 transition-transform duration-300 group flex flex-col justify-between">
              
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-[#0052FF]/10 text-[#0052FF] rounded-2xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-700 border border-green-500/30 rounded-lg text-xs font-bold tracking-wider">
                    {slip.status === 'PAID' ? 'LUNAS' : slip.status}
                  </span>
                </div>

                <div className="space-y-1 mb-8">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Periode</p>
                  <p className="text-2xl font-extrabold text-[#1A1A1A]">{slip.period}</p>
                  <p className="text-xl font-extrabold text-[#0052FF] pt-2">{formatRupiah(slip.netSalary)}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSlip(slip)}
                className="w-full bg-white/60 text-[#1A1A1A] py-4 rounded-2xl font-bold border border-white/80 hover:bg-[#1A1A1A] hover:text-white transition-colors duration-300 flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                Lihat & Cetak Slip Gaji
              </button>
              
            </div>
          ))
        )}
      </div>

      {/* MODAL / VIEW SLIP GAJI FORMAL CETAK */}
      {selectedSlip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] max-w-xl w-full p-8 shadow-2xl space-y-6 relative print:p-0 print:shadow-none">
            
            {/* Header Slip */}
            <div className="border-b border-gray-200 pb-4 text-center">
              <p className="text-xs uppercase font-extrabold tracking-widest text-[#0052FF]">
                {session?.tenant?.name || 'StackPlus Studio'}
              </p>
              <h2 className="text-2xl font-black text-[#1A1A1A] mt-1">SLIP GAJI KARYAWAN</h2>
              <p className="text-sm font-semibold text-gray-500 mt-1">Periode: {selectedSlip.period}</p>
            </div>

            {/* Identitas Karyawan */}
            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl">
              <div>
                <p className="text-gray-500 font-medium">Nama Karyawan</p>
                <p className="font-bold text-[#1A1A1A]">{selectedSlip.employee?.fullName || session?.employee?.fullName || 'Karyawan'}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Posisi / Jabatan</p>
                <p className="font-bold text-[#1A1A1A]">{selectedSlip.employee?.position || 'Staff'}</p>
              </div>
            </div>

            {/* Rincian Komponen Gaji */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Gaji Pokok (Basic Salary)</span>
                <span className="font-bold text-gray-800">{formatRupiah(selectedSlip.basicSalary)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Tunjangan (Allowances)</span>
                <span className="font-bold text-green-600">+ {formatRupiah(selectedSlip.allowance)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Potongan (Deductions)</span>
                <span className="font-bold text-red-500">- {formatRupiah(selectedSlip.deduction)}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-gray-900 text-base">
                <span className="font-extrabold text-[#1A1A1A]">Gaji Bersih (Take Home Pay)</span>
                <span className="font-black text-[#0052FF] text-lg">{formatRupiah(selectedSlip.netSalary)}</span>
              </div>
            </div>

            {/* Tombol Aksi Modal */}
            <div className="flex gap-4 pt-2 print:hidden">
              <button
                onClick={handlePrintSlip}
                className="flex-1 py-4 bg-[#0052FF] text-white rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                Cetak / Simpan PDF
              </button>
              <button
                onClick={() => setSelectedSlip(null)}
                className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
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
