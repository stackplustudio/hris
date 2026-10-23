'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';

interface MyGoalItem {
  id: string;
  period: string;
  objective: string;
  score: number;
  status: string;
}

export default function EmployeePerformancePage() {
  const { session, loading: authLoading } = useAuth();
  const [goals, setGoals] = useState<MyGoalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyGoals = async () => {
      try {
        const res = await api.get('/performance/my-goals');
        setGoals(res.data);
      } catch (error) {
        console.error('Gagal memuat target kinerja');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) fetchMyGoals();
  }, [session, authLoading]);

  if (authLoading) return null;

  // Hitung rata-rata skor performa
  const averageScore = goals.length > 0
    ? Math.round(goals.reduce((acc, curr) => acc + curr.score, 0) / goals.length)
    : 0;

  const getPredicate = (score: number) => {
    if (score >= 90) return 'Luar Biasa (Excellent)';
    if (score >= 75) return 'Baik (Good)';
    if (score >= 60) return 'Cukup (Average)';
    if (score > 0) return 'Perlu Ditingkatkan (Poor)';
    return 'Sedang Berjalan (On Progress)';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      
      <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)]">
        <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight mb-2">Target & Pencapaian Kinerja Anda</h1>
        <p className="text-gray-600 font-medium">Pantau Key Performance Indicators (KPI) dan ulasan capaian kerja dari manajemen.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Skor Keseluruhan */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/30 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] text-center relative overflow-hidden">
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-white/40 to-transparent rotate-45 transform pointer-events-none"></div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Rata-Rata Skor Kinerja</p>
            
            <div className={`inline-flex items-center justify-center w-36 h-36 rounded-full border-8 mb-4 ${
              averageScore >= 75 ? 'border-green-500/20 text-green-600' : 'border-blue-500/20 text-[#0052FF]'
            }`}>
              <span className="text-5xl font-extrabold">{averageScore}</span>
            </div>
            
            <p className="text-xl font-bold text-[#1A1A1A]">{getPredicate(averageScore)}</p>
            <p className="text-xs text-gray-500 font-semibold mt-2">{goals.length} Objektif Terdaftar</p>
          </div>
        </div>

        {/* Daftar Target */}
        <div className="lg:col-span-2">
          <div className="bg-white/30 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)]">
            <h2 className="text-2xl font-extrabold text-[#1A1A1A] mb-6">Daftar Target & Objektif</h2>
            
            {isLoading ? (
              <p className="text-gray-500 font-bold text-center py-8">Memuat target kinerja...</p>
            ) : goals.length === 0 ? (
              <div className="text-center py-12 text-gray-500 font-bold bg-white/40 rounded-2xl border border-white/60">
                Belum ada target KPI yang ditetapkan oleh HR untuk periode ini.
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="bg-white/40 p-6 rounded-2xl border border-white/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-[#0052FF]/10 text-[#0052FF] font-bold text-xs rounded-lg">
                          {goal.period}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                          goal.status === 'EXCELLENT' ? 'bg-green-100 text-green-700' :
                          goal.status === 'GOOD' ? 'bg-blue-100 text-[#0052FF]' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {goal.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#1A1A1A] pt-1">{goal.objective}</h3>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-500 font-bold uppercase">Skor Nilai</p>
                      <p className="text-3xl font-black text-[#0052FF]">{goal.score}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
