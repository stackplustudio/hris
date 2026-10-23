'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';

interface PerformanceGoalItem {
  id: string;
  period: string;
  objective: string;
  score: number;
  status: string;
  employee?: {
    id: string;
    fullName: string;
    position: string;
  };
}

export default function AdminPerformancePage() {
  const { session, loading: authLoading } = useAuth();
  const [goals, setGoals] = useState<PerformanceGoalItem[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form tambah KPI baru
  const [newGoal, setNewGoal] = useState({
    employeeId: '',
    period: 'Q3 2026',
    objective: '',
  });

  const tenantId = session?.tenant?.id;

  const fetchData = async () => {
    if (!tenantId) return;

    try {
      const [resGoals, resEmps] = await Promise.all([
        api.get(`/performance?tenantId=${tenantId}`),
        api.get(`/employees?tenantId=${tenantId}`),
      ]);
      setGoals(resGoals.data);
      setEmployees(resEmps.data);
      if (resEmps.data.length > 0 && !newGoal.employeeId) {
        setNewGoal((prev) => ({ ...prev, employeeId: resEmps.data[0].id }));
      }
    } catch (error) {
      toast.error('Gagal memuat data KPI');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [session, authLoading]);

  // Tambah Goal baru
  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !newGoal.employeeId || !newGoal.objective) {
      return toast.error('Lengkapi semua data objektif');
    }

    try {
      await api.post('/performance', {
        tenantId,
        ...newGoal,
      });
      toast.success('Target KPI baru berhasil ditetapkan!');
      setNewGoal({ employeeId: employees[0]?.id || '', period: 'Q3 2026', objective: '' });
      setIsAdding(false);
      fetchData();
    } catch (error) {
      toast.error('Gagal menetapkan target KPI');
    }
  };

  // Update Skor KPI
  const handleUpdateScore = async (id: string, currentScore: number) => {
    const input = prompt('Masukkan skor baru (0 - 100):', String(currentScore));
    if (input === null) return;

    const numScore = Number(input);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      return toast.error('Skor harus bernilai angka antara 0 hingga 100');
    }

    try {
      await api.patch(`/performance/${id}/score`, { score: numScore });
      toast.success('Skor dan predikat evaluasi berhasil diperbarui!');
      fetchData();
    } catch (error) {
      toast.error('Gagal memperbarui skor KPI');
    }
  };

  if (authLoading) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      
      {/* Header Glassmorphism */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">Manajemen Kinerja (KPI)</h1>
          <p className="text-gray-600 font-medium mt-1">Tetapkan target objektif dan evaluasi skor performa karyawan secara berkala.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-gradient-to-r from-[#0052FF] to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:shadow-[0_8px_30px_rgb(0,82,255,0.4)] transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          {isAdding ? 'Tutup Formulir' : '+ Tetapkan KPI Baru'}
        </button>
      </div>

      {/* Form Tambah KPI (Toggle) */}
      {isAdding && (
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-lg animate-fadeIn">
          <h2 className="text-xl font-extrabold text-[#1A1A1A] mb-4">Tetapkan Target Baru untuk Karyawan</h2>
          <form onSubmit={handleCreateGoal} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Karyawan</label>
              <select
                value={newGoal.employeeId}
                onChange={(e) => setNewGoal({ ...newGoal, employeeId: e.target.value })}
                className="w-full px-4 py-3 bg-white/70 border border-white/80 rounded-xl font-medium"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.position})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Periode Evaluasi</label>
              <input
                type="text"
                required
                value={newGoal.period}
                onChange={(e) => setNewGoal({ ...newGoal, period: e.target.value })}
                placeholder="Contoh: Q3 2026 atau Semester 2"
                className="w-full px-4 py-3 bg-white/70 border border-white/80 rounded-xl font-medium"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Objektif / Target Kinerja</label>
              <input
                type="text"
                required
                value={newGoal.objective}
                onChange={(e) => setNewGoal({ ...newGoal, objective: e.target.value })}
                placeholder="Contoh: Menyelesaikan arsitektur sistem HRIS dan mencapai 99% uptime"
                className="w-full px-4 py-3 bg-white/70 border border-white/80 rounded-xl font-medium"
              />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-8 py-3 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-xl transition-all"
              >
                Simpan Target KPI
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabel Evaluasi Kinerja */}
      <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/40 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-6 font-bold">Karyawan</th>
                <th className="p-6 font-bold">Target Utama (Objectives)</th>
                <th className="p-6 font-bold">Periode</th>
                <th className="p-6 font-bold">Skor (0-100)</th>
                <th className="p-6 font-bold">Predikat</th>
                <th className="p-6 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500 font-bold">Memuat data target KPI...</td>
                </tr>
              ) : goals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500 font-bold">Belum ada target KPI yang ditetapkan. Klik tombol di atas untuk menambah.</td>
                </tr>
              ) : (
                goals.map((kpi) => (
                  <tr key={kpi.id} className="hover:bg-white/40 transition-colors duration-200">
                    <td className="p-6">
                      <p className="font-extrabold text-[#1A1A1A]">{kpi.employee?.fullName || 'Karyawan'}</p>
                      <p className="text-sm font-medium text-gray-500">{kpi.employee?.position || '-'}</p>
                    </td>
                    <td className="p-6 font-medium text-gray-800 max-w-md">
                      {kpi.objective}
                    </td>
                    <td className="p-6 font-bold text-gray-700">
                      {kpi.period}
                    </td>
                    <td className="p-6">
                      <span className="text-xl font-black text-[#0052FF]">{kpi.score}</span>
                    </td>
                    <td className="p-6">
                      <span className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase ${
                        kpi.status === 'EXCELLENT' ? 'bg-green-500/20 text-green-700 border border-green-500/30' :
                        kpi.status === 'GOOD' ? 'bg-blue-500/20 text-[#0052FF] border border-blue-500/30' :
                        kpi.status === 'AVERAGE' ? 'bg-yellow-500/20 text-yellow-700 border border-yellow-500/30' :
                        'bg-red-500/20 text-red-700 border border-red-500/30'
                      }`}>
                        {kpi.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => handleUpdateScore(kpi.id, kpi.score)}
                        className="px-4 py-2 bg-white/70 hover:bg-[#0052FF] text-[#1A1A1A] hover:text-white rounded-xl font-bold border border-white/80 transition-all text-xs"
                      >
                        Beri Nilai
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
