'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

interface TodayAttendance {
  id: string;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status: string;
  location?: string | null;
}

// Koordinat Kantor Default (Kantor Pusat / Head Office)
const OFFICE_LAT = -6.1754;
const OFFICE_LNG = 106.8272;
const MAX_OFFICE_RADIUS_METERS = 500; // Radius kantor 500 meter

function calculateDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export default function EmployeeDashboard() {
  const { session, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
  const [totalPresentCount, setTotalPresentCount] = useState<number>(0);
  const [remainingLeave, setRemainingLeave] = useState<number>(12);
  const [leaveForm, setLeaveForm] = useState({ leaveType: 'Cuti Tahunan', startDate: '', endDate: '', reason: '' });
  
  // State Geolocation Validation (ATT-06)
  const [currentGps, setCurrentGps] = useState<{
    lat: number;
    lng: number;
    distanceMeters: number;
    isWithinOffice: boolean;
  } | null>(null);

  const currentTenantId = session?.tenant?.id;
  const currentEmployeeId = session?.employee?.id;
  const employeeName = session?.employee?.fullName || 'Karyawan StackPlus';
  const roleName = session?.role || 'Team Member';
  const todayFormatted = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Deteksi GPS di background saat halaman dimuat
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const distance = calculateDistanceInMeters(
            pos.coords.latitude,
            pos.coords.longitude,
            OFFICE_LAT,
            OFFICE_LNG
          );
          setCurrentGps({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            distanceMeters: distance,
            isWithinOffice: distance <= MAX_OFFICE_RADIUS_METERS,
          });
        },
        () => {},
        { timeout: 8000 }
      );
    }
  }, []);

  // Ambil riwayat presensi & saldo cuti karyawan
  const fetchDashboardData = async () => {
    if (!currentEmployeeId || !currentTenantId) return;

    try {
      const [resAtt, resBal] = await Promise.all([
        api.get(`/attendances?employeeId=${currentEmployeeId}`),
        api.get(`/leaves/balance?employeeId=${currentEmployeeId}&tenantId=${currentTenantId}`),
      ]);

      const list: TodayAttendance[] = resAtt.data;
      const presentCount = list.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
      setTotalPresentCount(presentCount);

      const todayDateStr = new Date().toISOString().split('T')[0];
      const foundToday = list.find((a) => {
        const itemDateStr = new Date(a.date).toISOString().split('T')[0];
        return itemDateStr === todayDateStr;
      });

      setTodayAttendance(foundToday || null);

      if (resBal.data?.balance !== undefined) {
        setRemainingLeave(resBal.data.balance);
      }
    } catch (error) {
      console.error('Gagal mengambil status dashboard');
    }
  };

  useEffect(() => {
    if (!loading && currentEmployeeId) {
      fetchDashboardData();
    }
  }, [loading, currentEmployeeId]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#0052FF] border-t-transparent rounded-full animate-spin mb-4 shadow-lg shadow-blue-500/50"></div>
        <p className="text-gray-700 font-bold tracking-wide">Sinkronisasi Ruang Kerja...</p>
      </div>
    );
  }

  // Check-In dengan Deteksi & Validasi Geolocation GPS (ATT-06)
  const handleCheckIn = async () => {
    if (!currentTenantId || !currentEmployeeId) return toast.error('Sesi tidak valid');

    setIsSubmitting(true);

    const performCheckIn = async (locationStr: string) => {
      try {
        await api.post('/attendances', {
          tenantId: currentTenantId,
          employeeId: currentEmployeeId,
          date: new Date().toISOString().split('T')[0],
          checkIn: new Date().toISOString(),
          status: 'PRESENT', // Backend otomatis set LATE jika lewat 09:15 WIB
          location: locationStr,
        });
        toast.success(`Check-In berhasil! ${locationStr}`);
        fetchDashboardData();
      } catch (error) {
        toast.error('Gagal mencatat kehadiran.');
      } finally {
        setIsSubmitting(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const distance = calculateDistanceInMeters(lat, lng, OFFICE_LAT, OFFICE_LNG);
          const inRadius = distance <= MAX_OFFICE_RADIUS_METERS;
          
          setCurrentGps({
            lat,
            lng,
            distanceMeters: distance,
            isWithinOffice: inRadius,
          });

          const distanceLabel = distance < 1000 ? `${distance} m` : `${(distance / 1000).toFixed(1)} km`;
          const locString = `GPS (${distanceLabel} dari kantor - ${inRadius ? 'Valid Radius Kantor' : 'Presensi WFH/Remote'})`;

          performCheckIn(locString);
        },
        () => {
          performCheckIn('Web Portal (GPS Dinonaktifkan)');
        },
        { timeout: 7000 }
      );
    } else {
      performCheckIn('Web Portal (Browser tanpa GPS)');
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance?.id) return toast.error('Data check-in tidak ditemukan');

    setIsSubmitting(true);
    try {
      await api.patch(`/attendances/${todayAttendance.id}`, {
        checkOut: new Date().toISOString(),
      });
      toast.success('Presensi kepulangan (Check-Out) berhasil dicatat. Selamat beristirahat!');
      fetchDashboardData();
    } catch (error) {
      toast.error('Gagal mencatat check-out.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantId || !currentEmployeeId) return toast.error('Sesi tidak valid');

    setIsSubmitting(true);
    try {
      await api.post('/leaves', {
        tenantId: currentTenantId,
        employeeId: currentEmployeeId,
        ...leaveForm,
      });
      toast.success('Pengajuan cuti meluncur ke HR!');
      setLeaveForm({ leaveType: 'Cuti Tahunan', startDate: '', endDate: '', reason: '' });
      fetchDashboardData();
    } catch (error) {
      toast.error('Gagal memproses pengajuan cuti.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasCheckedIn = !!todayAttendance?.checkIn;
  const hasCheckedOut = !!todayAttendance?.checkOut;

  const checkInTimeStr = todayAttendance?.checkIn
    ? new Date(todayAttendance.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    : '';

  const checkOutTimeStr = todayAttendance?.checkOut
    ? new Date(todayAttendance.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      
      {/* HEADER SECTION (GLASS EFFECT) */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] flex justify-between items-center">
        <div>
          <p className="text-sm font-bold text-[#0052FF] tracking-widest uppercase mb-1">{roleName}</p>
          <h1 className="text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
            Selamat datang, {employeeName.split(' ')[0]}! ✨
          </h1>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-gray-600 font-medium">Hari ini</p>
          <p className="text-xl font-bold text-[#1A1A1A]">{todayFormatted}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* WIDGET KIRI: PRESENSI TERMINAL */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white/30 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] relative overflow-hidden group">
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-white/40 to-transparent rotate-45 transform pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-4 relative z-10">
              <h2 className="text-2xl font-extrabold text-[#1A1A1A]">Terminal Kehadiran</h2>
              
              {/* Badge Validasi Radius Geolocation (ATT-06) */}
              {currentGps ? (
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  currentGps.isWithinOffice
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  📍 {currentGps.isWithinOffice ? 'Dalam Radius Kantor' : `${(currentGps.distanceMeters / 1000).toFixed(1)} km (WFH)`}
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs font-bold border border-gray-200">
                  📍 Mencari Lokasi...
                </span>
              )}
            </div>
            
            {/* Status Hari Ini Banner */}
            <div className="mb-6 p-4 rounded-2xl bg-white/40 border border-white/60 text-sm relative z-10">
              {!hasCheckedIn ? (
                <p className="font-bold text-gray-700">⏳ Anda belum melakukan check-in hari ini.</p>
              ) : !hasCheckedOut ? (
                <div>
                  <p className="font-bold text-green-700">🟢 Masuk: <span className="underline">{checkInTimeStr}</span> (Aktif Bertugas)</p>
                  {todayAttendance?.location && (
                    <p className="text-xs text-gray-500 font-medium mt-1">📍 {todayAttendance.location}</p>
                  )}
                </div>
              ) : (
                <p className="font-bold text-[#0052FF]">✅ Selesai: Masuk {checkInTimeStr} — Pulang {checkOutTimeStr}</p>
              )}
            </div>

            <div className="flex flex-col gap-4 relative z-10">
              
              {/* Tombol Check-In */}
              <button 
                onClick={handleCheckIn}
                disabled={isSubmitting || hasCheckedIn}
                className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                  hasCheckedIn
                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#0052FF] to-blue-500 text-white hover:shadow-[0_8px_30px_rgb(0,82,255,0.4)] transform hover:-translate-y-1'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                {hasCheckedIn ? `Sudah Masuk (${checkInTimeStr})` : 'Check-In Masuk (GPS Validated)'}
              </button>
              
              {/* Tombol Check-Out */}
              <button 
                onClick={handleCheckOut}
                disabled={isSubmitting || !hasCheckedIn || hasCheckedOut}
                className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                  !hasCheckedIn || hasCheckedOut
                    ? 'bg-white/40 text-gray-400 border border-white/60 cursor-not-allowed backdrop-blur-md'
                    : 'bg-[#1A1A1A] hover:bg-black text-white hover:shadow-lg transform hover:-translate-y-1'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                {hasCheckedOut ? `Sudah Pulang (${checkOutTimeStr})` : 'Check-Out Pulang'}
              </button>
            </div>
          </div>

          {/* MINI STATS WIDGET DINAMIS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/30 backdrop-blur-xl border border-white/60 p-6 rounded-[2rem] shadow-sm">
              <p className="text-sm text-gray-600 font-bold mb-1">Sisa Cuti Aktif</p>
              <p className="text-3xl font-extrabold text-[#1A1A1A]">{remainingLeave} <span className="text-base text-gray-500 font-medium">Hari</span></p>
            </div>
            <div className="bg-white/30 backdrop-blur-xl border border-white/60 p-6 rounded-[2rem] shadow-sm">
              <p className="text-sm text-gray-600 font-bold mb-1">Total Kehadiran</p>
              <p className="text-3xl font-extrabold text-green-600">{totalPresentCount} <span className="text-base text-green-600/70 font-medium">Hari</span></p>
            </div>
          </div>
        </div>

        {/* WIDGET KANAN: FORM CUTI CEPAT */}
        <div className="lg:col-span-7">
          <div className="bg-white/30 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)]">
            <h2 className="text-2xl font-extrabold text-[#1A1A1A] mb-2">Pengajuan Cuti Cepat</h2>
            <p className="text-gray-600 font-medium text-sm mb-6">Ajukan permohonan izin atau libur tahunan langsung ke manajemen.</p>

            <form onSubmit={handleLeaveSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tipe Cuti</label>
                <select 
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="w-full px-5 py-4 bg-white/50 border border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-[#1A1A1A] font-medium transition-all"
                >
                  <option value="Cuti Tahunan">Cuti Tahunan</option>
                  <option value="Sakit">Sakit / Istirahat Medis</option>
                  <option value="Izin Mendesak">Izin Keperluan Mendesak</option>
                  <option value="Cuti Menikah/Melahirkan">Cuti Spesial</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Mulai</label>
                  <input 
                    type="date" 
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-5 py-4 bg-white/50 border border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-[#1A1A1A] font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Berakhir</label>
                  <input 
                    type="date" 
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-5 py-4 bg-white/50 border border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-[#1A1A1A] font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Alasan Pengajuan</label>
                <textarea 
                  rows={3} 
                  required
                  placeholder="Jelaskan kebutuhan cuti Anda..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-5 py-4 bg-white/50 border border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-[#1A1A1A] font-medium placeholder-gray-400 transition-all resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-2xl text-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-70"
              >
                {isSubmitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Cuti ✈️'}
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
