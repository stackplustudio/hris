'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

interface AuditLogItem {
  id: string;
  actorId: string;
  action: string;
  entity: string;
  timestamp: string;
}

interface DashboardStats {
  totalEmployees: number;
  pendingLeaves: number;
  present: number;
  late: number;
  absent: number;
  recentAuditLogs?: AuditLogItem[];
}

export default function AdminDashboardPage() {
  const { session, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    pendingLeaves: 0,
    present: 0,
    late: 0,
    absent: 0,
    recentAuditLogs: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const tenantId = session?.tenant?.id;
      if (!tenantId) return;

      try {
        const res = await api.get(`/dashboard/summary?tenantId=${tenantId}`);
        setStats(res.data);
      } catch (error) {
        toast.error('Gagal memuat ringkasan dasbor');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) fetchStats();
  }, [session, authLoading]);

  if (authLoading) return null;

  const tenantName = session?.tenant?.name || 'StackPlus Studio';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      
      {/* HEADER SECTION (GLASS EFFECT) */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-sm font-bold text-[#0052FF] tracking-widest uppercase mb-1">Pusat Kendali HR — {tenantName}</p>
          <h1 className="text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
            Selamat datang, Tim HRD! 🚀
          </h1>
          <p className="text-gray-600 font-medium mt-1">Berikut adalah ringkasan aktivitas, audit log, dan kehadiran karyawan perusahaan hari ini.</p>
        </div>
        <div className="bg-white/60 px-6 py-3 rounded-2xl border border-white/80 font-bold text-[#0052FF] text-sm shrink-0">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* STATISTIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Karyawan */}
        <div className="bg-white/30 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] hover:-translate-y-2 transition-transform duration-300">
          <div className="w-12 h-12 bg-blue-500/20 text-[#0052FF] rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Karyawan</p>
          <p className="text-4xl font-extrabold text-[#1A1A1A] mt-2">
            {isLoading ? '...' : stats.totalEmployees}
          </p>
        </div>

        {/* Hadir Hari Ini */}
        <div className="bg-white/30 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] hover:-translate-y-2 transition-transform duration-300">
          <div className="w-12 h-12 bg-green-500/20 text-green-600 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Hadir Hari Ini</p>
          <p className="text-4xl font-extrabold text-green-600 mt-2">
            {isLoading ? '...' : stats.present}
          </p>
        </div>

        {/* Cuti Pending */}
        <div className="bg-white/30 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] hover:-translate-y-2 transition-transform duration-300">
          <div className="w-12 h-12 bg-yellow-500/20 text-yellow-600 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Cuti Pending</p>
          <p className="text-4xl font-extrabold text-yellow-600 mt-2">
            {isLoading ? '...' : stats.pendingLeaves}
          </p>
        </div>

      </div>

      {/* QUICK ACTIONS & RINGKASAN PRESENSI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Ringkasan Presensi Hari Ini */}
        <div className="bg-white/30 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)]">
          <h2 className="text-2xl font-extrabold text-[#1A1A1A] mb-6">Rincian Presensi Hari Ini</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/40 rounded-2xl border border-white/60">
              <span className="font-bold text-gray-700">Tepat Waktu (Present)</span>
              <span className="font-extrabold text-green-600 text-lg">{stats.present}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/40 rounded-2xl border border-white/60">
              <span className="font-bold text-gray-700">Terlambat (Late)</span>
              <span className="font-extrabold text-yellow-600 text-lg">{stats.late}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/40 rounded-2xl border border-white/60">
              <span className="font-bold text-gray-700">Tidak Hadir (Absent)</span>
              <span className="font-extrabold text-red-600 text-lg">{stats.absent}</span>
            </div>
          </div>
        </div>

        {/* Pintasan Aksi Cepat */}
        <div className="bg-white/30 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1A1A1A] mb-6">Aksi Cepat</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href="/admin/employees/new" 
                className="p-5 bg-white/50 hover:bg-[#0052FF] text-[#1A1A1A] hover:text-white rounded-2xl border border-white/80 font-bold transition-all text-center flex flex-col items-center justify-center gap-2 group shadow-sm"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">👤+</span>
                <span>Tambah Karyawan</span>
              </Link>

              <Link 
                href="/admin/leaves" 
                className="p-5 bg-white/50 hover:bg-[#0052FF] text-[#1A1A1A] hover:text-white rounded-2xl border border-white/80 font-bold transition-all text-center flex flex-col items-center justify-center gap-2 group shadow-sm"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">📋</span>
                <span>Tinjau Cuti</span>
              </Link>

              <Link 
                href="/admin/payroll" 
                className="p-5 bg-white/50 hover:bg-[#0052FF] text-[#1A1A1A] hover:text-white rounded-2xl border border-white/80 font-bold transition-all text-center flex flex-col items-center justify-center gap-2 group shadow-sm"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">💰</span>
                <span>Hitung Gaji</span>
              </Link>

              <Link 
                href="/admin/reports" 
                className="p-5 bg-white/50 hover:bg-[#0052FF] text-[#1A1A1A] hover:text-white rounded-2xl border border-white/80 font-bold transition-all text-center flex flex-col items-center justify-center gap-2 group shadow-sm"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">📊</span>
                <span>Unduh Laporan</span>
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* AUDIT LOG AKTIVITAS (AUTH-07) */}
      <div className="bg-white/30 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1A1A1A]">Riwayat Aktivitas & Audit Log</h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Audit Trail Kepatuhan Sistem (AUTH-07)</p>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-[#0052FF] border border-blue-200 text-xs font-bold rounded-xl">
            Live Stream
          </span>
        </div>

        {(!stats.recentAuditLogs || stats.recentAuditLogs.length === 0) ? (
          <div className="p-8 text-center bg-white/40 border border-white/60 rounded-2xl text-gray-500 font-bold text-sm">
            Belum ada jejak audit yang terekam. Aktivitas manajemen cuti, absensi, dan data karyawan akan tercatat di sini secara otomatis.
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentAuditLogs.map((log) => (
              <div key={log.id} className="p-4 bg-white/40 border border-white/60 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-xl text-xs font-extrabold tracking-wider ${
                    log.action.includes('SETUJUI') ? 'bg-green-100 text-green-700' :
                    log.action.includes('TOLAK') ? 'bg-red-100 text-red-700' :
                    log.action.includes('KOREKSI') ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-[#0052FF]'
                  }`}>
                    {log.action}
                  </span>
                  <span className="font-bold text-[#1A1A1A] text-sm">{log.entity}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                  <span>Pelaku: <b className="text-gray-700">{log.actorId}</b></span>
                  <span>{new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
