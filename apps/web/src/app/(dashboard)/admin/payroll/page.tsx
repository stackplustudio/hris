'use client';

import { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

export default function AdminPayrollPage() {
  const { session, loading } = useAuth();
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<any | null>(null);

  const fetchPayrolls = async () => {
    if (!session?.tenant?.id) return;
    try {
      const res = await api.get(`/payroll?tenantId=${session.tenant.id}`);
      setPayrolls(res.data);
    } catch (error) {
      toast.error('Gagal memuat data payroll');
    }
  };

  useEffect(() => {
    if (!loading) fetchPayrolls();
  }, [session, loading]);

  const handleGeneratePayroll = async () => {
    if (!session?.tenant?.id) return;
    setIsProcessing(true);
    
    const period = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    try {
      const res = await api.post('/payroll/generate', { tenantId: session.tenant.id, period });
      toast.success(res.data.message);
      fetchPayrolls();
    } catch (error) {
      toast.error('Gagal men-generate payroll');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  if (loading) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      
      {/* Header Glass */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">Manajemen Penggajian (Payroll)</h1>
          <p className="text-gray-600 font-medium mt-1">
            Kelola kalkulasi gaji periode {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button 
          onClick={handleGeneratePayroll}
          disabled={isProcessing}
          className="bg-gradient-to-r from-[#0052FF] to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:shadow-[0_8px_30px_rgb(0,82,255,0.4)] transition-all duration-300 disabled:opacity-70 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          {isProcessing ? 'Menghitung...' : 'Generate Payroll Bulan Ini'}
        </button>
      </div>

      {/* Tabel Data Payroll */}
      <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/40 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-6 font-bold">Karyawan</th>
                <th className="p-6 font-bold">Periode</th>
                <th className="p-6 font-bold">Gaji Pokok</th>
                <th className="p-6 font-bold">Tunjangan</th>
                <th className="p-6 font-bold">Gaji Bersih (Net)</th>
                <th className="p-6 font-bold">Status</th>
                <th className="p-6 font-bold text-center">Aksi (PAY-03)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {payrolls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500 font-bold">
                    Belum ada data gaji yang di-generate. Silakan klik tombol di atas.
                  </td>
                </tr>
              ) : payrolls.map((pay) => (
                <tr key={pay.id} className="hover:bg-white/40 transition-colors duration-200">
                  <td className="p-6">
                    <p className="font-extrabold text-[#1A1A1A]">{pay.employee?.fullName}</p>
                    <p className="text-sm font-medium text-gray-500">{pay.employee?.position}</p>
                  </td>
                  <td className="p-6 font-bold text-gray-700">{pay.period}</td>
                  <td className="p-6 font-medium text-gray-700">{formatRupiah(pay.basicSalary)}</td>
                  <td className="p-6 font-medium text-green-600">+{formatRupiah(pay.allowance)}</td>
                  <td className="p-6 font-extrabold text-[#0052FF]">{formatRupiah(pay.netSalary)}</td>
                  <td className="p-6">
                    <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${
                      pay.status === 'PAID' ? 'bg-green-500/20 text-green-700 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-700 border border-yellow-500/30'
                    }`}>
                      {pay.status === 'PAID' ? 'LUNAS' : 'DRAFT'}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <button
                      onClick={() => setSelectedSlip(pay)}
                      className="px-4 py-2.5 bg-white/70 hover:bg-white text-[#0052FF] font-bold rounded-xl border border-white/80 transition-all text-xs flex items-center gap-2 mx-auto shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                      Slip Gaji (PDF)
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pratinjau & Cetak Slip Gaji (PAY-03) */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:p-0 print:bg-white">
          <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full border border-gray-100 shadow-2xl space-y-6 print:shadow-none print:border-none print:w-full print:max-w-none">
            
            {/* Kop Slip */}
            <div className="border-b border-gray-200 pb-6 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#0052FF] text-white rounded-lg flex items-center justify-center font-black text-sm">
                    S+
                  </div>
                  <span className="font-extrabold text-xl text-[#1A1A1A]">
                    {session?.tenant?.name || 'StackPlus HRIS'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 font-medium">SLIP GAJI RESMI KARYAWAN (CONFIDENTIAL)</p>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 bg-green-50 text-green-700 font-extrabold text-xs rounded-full border border-green-200">
                  {selectedSlip.status === 'PAID' ? 'PAID / LUNAS' : 'DRAFT'}
                </span>
                <p className="text-xs text-gray-500 mt-1 font-bold">Periode: {selectedSlip.period}</p>
              </div>
            </div>

            {/* Informasi Penerima */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl text-sm">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Nama Karyawan</p>
                <p className="font-extrabold text-[#1A1A1A] text-base">{selectedSlip.employee?.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Posisi / Jabatan</p>
                <p className="font-bold text-gray-800">{selectedSlip.employee?.position}</p>
              </div>
            </div>

            {/* Rincian Komponen Gaji */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rincian Komponen Gaji</p>
              
              <div className="space-y-2 text-sm border-t border-b border-gray-100 py-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Gaji Pokok (Basic Salary)</span>
                  <span className="font-bold text-gray-900">{formatRupiah(selectedSlip.basicSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Tunjangan Operasional (Allowance)</span>
                  <span className="font-bold text-green-600">+{formatRupiah(selectedSlip.allowance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Potongan (Deduction)</span>
                  <span className="font-bold text-red-600">-{formatRupiah(selectedSlip.deduction)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-extrabold text-[#1A1A1A]">Total Gaji Bersih (Take Home Pay)</span>
                <span className="text-2xl font-black text-[#0052FF]">{formatRupiah(selectedSlip.netSalary)}</span>
              </div>
            </div>

            {/* Tanda Tangan Digital */}
            <div className="pt-6 border-t border-gray-100 flex justify-between items-end text-xs text-gray-400 font-medium">
              <div>
                <p>Dokumen ini dibuat otomatis oleh StackPlus HRIS Engine.</p>
                <p>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-600">Disetujui Oleh,</p>
                <div className="h-10"></div>
                <p className="font-extrabold text-gray-800">Finance & People Operations</p>
              </div>
            </div>

            {/* Tombol Aksi (Sembunyi saat cetak) */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 print:hidden">
              <button
                onClick={() => setSelectedSlip(null)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl text-sm transition-all"
              >
                Tutup
              </button>
              <button
                onClick={handlePrintSlip}
                className="px-8 py-3 bg-[#0052FF] hover:bg-blue-600 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                <Printer aria-hidden="true" size={16} />
                Cetak / Simpan PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
