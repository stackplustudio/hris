'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

interface Attendance {
  id: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: string;
  employee?: { fullName: string };
}

export default function AdminAttendancesPage() {
  const { session, loading: authLoading } = useAuth();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAttendances = async () => {
    const currentTenantId = session?.tenant?.id;
    if (!currentTenantId) return;

    try {
      const response = await api.get(`/attendances?tenantId=${currentTenantId}`);
      setAttendances(response.data);
    } catch (error) {
      toast.error('Gagal memuat log kehadiran');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchAttendances();
  }, [session, authLoading]);

  // Koreksi manual status kehadiran oleh HR
  const handleCorrection = async (id: string, currentStatus: string) => {
    const newStatus = prompt('Koreksi status (Ketik: PRESENT, LATE, atau ABSENT):', currentStatus);
    if (!newStatus) return;

    const upperStatus = newStatus.toUpperCase().trim();
    if (!['PRESENT', 'LATE', 'ABSENT'].includes(upperStatus)) {
      return toast.error('Pilihan status tidak valid. Gunakan PRESENT, LATE, atau ABSENT.');
    }

    try {
      await api.patch(`/attendances/${id}`, { status: upperStatus });
      toast.success(`Status absensi berhasil dikoreksi menjadi ${upperStatus}`);
      fetchAttendances();
    } catch (error) {
      toast.error('Gagal mengoreksi data absensi');
    }
  };

  if (authLoading) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      
      <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">Log Kehadiran</h1>
          <p className="text-gray-600 font-medium mt-1">Pantau dan koreksi rekam jejak presensi harian seluruh karyawan Anda.</p>
        </div>
        <div className="bg-white/60 px-6 py-3 rounded-xl border border-white/80 font-bold text-[#0052FF]">
          Hari ini: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/40 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-6 font-bold">Karyawan</th>
                <th className="p-6 font-bold">Tanggal</th>
                <th className="p-6 font-bold">Check-In</th>
                <th className="p-6 font-bold">Check-Out</th>
                <th className="p-6 font-bold">Status</th>
                <th className="p-6 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500 font-bold">Menyinkronkan data presensi...</td>
                </tr>
              ) : attendances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500 font-bold">Belum ada rekam kehadiran yang tercatat.</td>
                </tr>
              ) : (
                attendances.map((record) => (
                  <tr key={record.id} className="hover:bg-white/40 transition-colors duration-200">
                    <td className="p-6 font-extrabold text-[#1A1A1A]">{record.employee?.fullName || 'Karyawan'}</td>
                    <td className="p-6 font-medium text-gray-700">
                      {new Date(record.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-6">
                      <span className="font-bold text-[#0052FF] bg-[#0052FF]/10 px-3 py-1 rounded-lg">
                        {record.checkIn ? new Date(record.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </span>
                    </td>
                    <td className="p-6">
                      {record.checkOut ? (
                        <span className="font-bold text-gray-700 bg-gray-500/10 px-3 py-1 rounded-lg">
                          {new Date(record.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span className="text-gray-400 font-medium italic">Belum Pulang</span>
                      )}
                    </td>
                    <td className="p-6">
                      <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${
                        record.status === 'PRESENT' ? 'bg-green-500/20 text-green-700 border border-green-500/30' : 
                        record.status === 'LATE' ? 'bg-yellow-500/20 text-yellow-700 border border-yellow-500/30' : 
                        'bg-red-500/20 text-red-700 border border-red-500/30'
                      }`}>
                        {record.status === 'PRESENT' ? 'HADIR' : record.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button
                        onClick={() => handleCorrection(record.id, record.status)}
                        className="px-3 py-1.5 bg-white/70 hover:bg-[#0052FF] text-[#1A1A1A] hover:text-white rounded-xl font-bold border border-white/80 transition-all text-xs"
                      >
                        Koreksi
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
