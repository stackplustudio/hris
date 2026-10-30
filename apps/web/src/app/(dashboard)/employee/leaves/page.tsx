'use client';

import { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { api } from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';

interface Leave {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  reason: string;
}

export default function EmployeeLeavesPage() {
  const { session, loading: authLoading } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyLeaves = async () => {
      if (!session?.tenant?.id || !session?.employee?.id) return;
      
      try {
        // Ambil data cuti khusus untuk karyawan yang sedang login
        const res = await api.get(`/leaves?tenantId=${session.tenant.id}`);
        // Filter di frontend untuk sementara (Ide: Buat endpoint khusus by employeeId nanti)
        const myLeaves = res.data.filter((l: any) => l.employeeId === session.employee.id);
        setLeaves(myLeaves);
      } catch (error) {
        console.error('Gagal memuat riwayat cuti');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) fetchMyLeaves();
  }, [session, authLoading]);

  if (authLoading) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)]">
        <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight mb-2">Riwayat Pengajuan Cuti</h1>
        <p className="text-gray-600 font-medium">Pantau status persetujuan dari HRD secara real-time.</p>
      </div>

      <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] overflow-hidden">
        <div className="overflow-x-auto p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/40 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-6 font-bold">Jenis Cuti</th>
                <th className="p-6 font-bold">Tanggal Pelaksanaan</th>
                <th className="p-6 font-bold">Keterangan</th>
                <th className="p-6 font-bold">Status Validasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500 font-bold">Menyinkronkan data...</td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-500 font-bold">
                    <CalendarDays aria-hidden="true" className="mx-auto mb-4 text-brand-ink-muted" size={40} strokeWidth={1.6} />
                    Anda belum pernah mengajukan cuti.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-white/40 transition-colors duration-200">
                    <td className="p-6 font-extrabold text-[#1A1A1A]">{leave.leaveType}</td>
                    <td className="p-6 font-medium text-gray-700">
                      {new Date(leave.startDate).toLocaleDateString('id-ID')} - {new Date(leave.endDate).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-6 text-gray-600 font-medium max-w-xs truncate">{leave.reason}</td>
                    <td className="p-6">
                      <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${
                        leave.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-700 border border-yellow-500/30' :
                        leave.status === 'APPROVED' ? 'bg-green-500/20 text-green-700 border border-green-500/30' : 
                        'bg-red-500/20 text-red-700 border border-red-500/30'
                      }`}>
                        {leave.status}
                      </span>
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