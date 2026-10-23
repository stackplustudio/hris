'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

interface Leave {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  reason: string;
  employee?: { fullName: string; department?: { name: string } };
}

export default function AdminLeavesPage() {
  const { session, loading: authLoading } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaves = async () => {
    const currentTenantId = session?.tenant?.id;
    if (!currentTenantId) return;

    try {
      const response = await api.get(`/leaves?tenantId=${currentTenantId}`);
      setLeaves(response.data);
    } catch (error) {
      toast.error('Gagal memuat data cuti');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchLeaves();
  }, [session, authLoading]);

  const handleUpdateStatus = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      // Menggunakan endpoint status yang otomatis memotong saldo cuti jika disetujui
      await api.patch(`/leaves/${id}/status`, { 
        status: newStatus,
        approvedBy: session?.employee?.fullName || 'HR Administrator'
      });
      toast.success(`Cuti berhasil ${newStatus === 'APPROVED' ? 'disetujui & saldo cuti karyawan disesuaikan' : 'ditolak'}`);
      fetchLeaves();
    } catch (error) {
      toast.error('Gagal memperbarui status cuti');
    }
  };

  if (authLoading) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      
      <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)]">
        <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">Persetujuan Cuti</h1>
        <p className="text-gray-600 font-medium mt-1">Validasi pengajuan ketidakhadiran karyawan dan pantau kuota cuti.</p>
      </div>

      <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/40 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-6 font-bold">Karyawan</th>
                <th className="p-6 font-bold">Jenis Cuti</th>
                <th className="p-6 font-bold">Rentang Waktu</th>
                <th className="p-6 font-bold">Alasan</th>
                <th className="p-6 font-bold">Status</th>
                <th className="p-6 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500 font-bold">Menyinkronkan data permohonan cuti...</td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500 font-bold">Belum ada permohonan cuti yang diajukan.</td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-white/40 transition-colors duration-200">
                    <td className="p-6">
                      <p className="font-extrabold text-[#1A1A1A]">{leave.employee?.fullName || 'Karyawan'}</p>
                      <p className="text-xs font-semibold text-[#0052FF]">{leave.employee?.department?.name || 'Staff'}</p>
                    </td>

                    <td className="p-6 font-bold text-gray-800">{leave.leaveType}</td>

                    <td className="p-6 text-sm text-gray-700 font-medium">
                      {new Date(leave.startDate).toLocaleDateString('id-ID')} — {new Date(leave.endDate).toLocaleDateString('id-ID')}
                    </td>

                    <td className="p-6 text-sm text-gray-600 max-w-xs truncate" title={leave.reason}>
                      {leave.reason || '-'}
                    </td>

                    <td className="p-6">
                      <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${
                        leave.status === 'APPROVED' ? 'bg-green-500/20 text-green-700 border border-green-500/30' : 
                        leave.status === 'REJECTED' ? 'bg-red-500/20 text-red-700 border border-red-500/30' : 
                        'bg-yellow-500/20 text-yellow-700 border border-yellow-500/30'
                      }`}>
                        {leave.status}
                      </span>
                    </td>

                    <td className="p-6 text-right space-x-2">
                      {leave.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(leave.id, 'APPROVED')}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all text-xs shadow-sm"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(leave.id, 'REJECTED')}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all text-xs shadow-sm"
                          >
                            Tolak
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 font-semibold italic">Selesai Ditinjau</span>
                      )}
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
