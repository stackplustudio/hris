'use client';

import { useEffect, useState } from 'react';
import { HeartPulse, Info, ReceiptText } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';

export default function AdminTaxesPage() {
  const { session, loading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    bpjsKesehatan: 1.0,
    bpjsKetenagakerjaan: 2.0,
    ptkpDasar: 54000000,
  });

  // Tarik data konfigurasi dari backend saat halaman dimuat
  useEffect(() => {
    const fetchConfig = async () => {
      if (!session?.tenant?.id) return;
      try {
        const res = await api.get(`/taxes/config?tenantId=${session.tenant.id}`);
        if (res.data) setConfig(res.data);
      } catch (error) {
        toast.error('Gagal memuat konfigurasi pajak');
      }
    };
    if (!loading) fetchConfig();
  }, [session, loading]);

  const handleSaveConfig = async () => {
    if (!session?.tenant?.id) return;
    setIsSaving(true);
    try {
      await api.put('/taxes/config', {
        tenantId: session.tenant.id,
        ...config,
      });
      toast.success('Konfigurasi Pajak & BPJS berhasil diperbarui di database!');
    } catch (error) {
      toast.error('Gagal menyimpan konfigurasi');
    } finally {
      setIsSaving(false);
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  if (loading) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      
      <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">Kepatuhan Pajak & BPJS</h1>
          <p className="text-gray-600 font-medium mt-1">Konfigurasi persentase potongan otomatis untuk PPh 21 dan asuransi.</p>
        </div>
        <button 
          onClick={handleSaveConfig}
          disabled={isSaving}
          className="bg-[#0052FF] text-white px-8 py-4 rounded-2xl font-bold text-sm hover:shadow-[0_8px_30px_rgb(0,82,255,0.4)] transition-all transform hover:-translate-y-1 disabled:opacity-70"
        >
          {isSaving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Card BPJS */}
        <div className="bg-white/30 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-sm">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-3">
            <span className="p-2 bg-green-500/20 text-green-600 rounded-lg">
              <HeartPulse aria-hidden="true" size={20} strokeWidth={1.8} />
            </span>
            Potongan BPJS (Karyawan)
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">BPJS Kesehatan (%)</label>
              <input 
                type="number" step="0.1" 
                value={config.bpjsKesehatan}
                onChange={(e) => setConfig({...config, bpjsKesehatan: parseFloat(e.target.value)})}
                className="w-full bg-white/50 border border-white/60 text-[#1A1A1A] font-bold px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#0052FF]/50 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">BPJS Ketenagakerjaan (JHT) (%)</label>
              <input 
                type="number" step="0.1" 
                value={config.bpjsKetenagakerjaan}
                onChange={(e) => setConfig({...config, bpjsKetenagakerjaan: parseFloat(e.target.value)})}
                className="w-full bg-white/50 border border-white/60 text-[#1A1A1A] font-bold px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#0052FF]/50 outline-none" 
              />
            </div>
          </div>
        </div>

        {/* Card PPh21 */}
        <div className="bg-white/30 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-sm">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-3">
            <span className="p-2 bg-blue-500/20 text-[#0052FF] rounded-lg">
              <ReceiptText aria-hidden="true" size={20} strokeWidth={1.8} />
            </span>
            Konfigurasi PPh 21 (TER)
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">PTKP Dasar (TK/0)</label>
              <input 
                type="text" 
                value={formatRupiah(config.ptkpDasar)} 
                disabled 
                className="w-full bg-gray-50/50 border border-white/60 text-gray-500 font-bold px-4 py-3 rounded-xl outline-none cursor-not-allowed" 
              />
              <p className="text-xs text-gray-500 mt-1">Penghasilan Tidak Kena Pajak ditetapkan secara global.</p>
            </div>
            
            <div className="p-4 bg-[#0052FF]/5 border border-[#0052FF]/20 rounded-xl">
              <p className="text-sm font-bold text-[#0052FF] flex items-center gap-2">
                <Info aria-hidden="true" size={16} strokeWidth={1.8} />
                Info Sistem
              </p>
              <p className="text-xs text-gray-600 mt-1">Sistem akan secara otomatis menerapkan Tarif Efektif Rata-rata (TER) pada perhitungan Payroll bulanan berdasarkan status PTKP karyawan.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}