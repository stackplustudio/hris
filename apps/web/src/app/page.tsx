import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#1A1A1A] font-sans antialiased selection:bg-[#0052FF] selection:text-white">
      
      {/* NAVBAR PILL MENGAMBANG */}
      <header className="sticky top-6 z-50 max-w-6xl mx-auto px-4">
        <nav className="bg-white/80 backdrop-blur-xl border border-[#E5E0D5] px-6 py-4 rounded-full shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0052FF] text-white rounded-full flex items-center justify-center font-black text-lg">
              S+
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#1A1A1A]">
              StackPlus <span className="text-[#0052FF]">HRIS</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 font-bold text-sm text-gray-700">
            <a href="#features" className="hover:text-[#0052FF] transition-colors">Fitur</a>
            <a href="#pricing" className="hover:text-[#0052FF] transition-colors">Harga</a>
            <a href="#about" className="hover:text-[#0052FF] transition-colors">Tentang Kami</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-block px-5 py-2.5 text-gray-700 hover:text-[#0052FF] font-bold text-sm transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-6 py-2.5 bg-[#0052FF] hover:bg-blue-600 text-white font-bold rounded-full text-sm transition-all shadow-md shadow-blue-500/20"
            >
              Coba Gratis →
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="pt-24 pb-20 px-6 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E0D5] rounded-full text-xs font-bold text-[#0052FF] shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#0052FF] animate-pulse"></span>
          StackPlus HRIS SaaS Platform v1.0
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#1A1A1A] leading-[1.1]">
          Sistem HR Modern untuk Tim yang <span className="text-[#0052FF]">Tumbuh Cepat</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 font-medium leading-relaxed">
          Dirancang khusus untuk studio kreatif, agensi, dan startup. Kelola absensi GPS, permohonan cuti, kalkulasi penggajian, hingga kepatuhan pajak dalam satu platform minimalis.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 bg-[#0052FF] hover:bg-blue-600 text-white font-bold rounded-full text-base transition-all shadow-lg shadow-blue-500/30 transform hover:-translate-y-1"
          >
            🚀 Mulai Uji Coba Gratis 14 Hari
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-[#1A1A1A] font-bold rounded-full text-base border border-[#E5E0D5] transition-all"
          >
            Masuk ke Portal
          </Link>
        </div>
      </section>

      {/* FEATURE GRID SECTION */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Semua Kebutuhan HR dalam Satu Layar</h2>
          <p className="text-gray-600 font-medium">Tinggalkan spreadsheet manual yang rawan kekeliruan dengan otomasi terstruktur.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Card 1: Absensi GPS */}
          <div className="bg-white p-8 rounded-3xl border border-[#E5E0D5] shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-[#0052FF] rounded-2xl flex items-center justify-center font-bold text-xl">
              📍
            </div>
            <h3 className="text-xl font-bold">Presensi Real-time & GPS</h3>
            <p className="text-gray-600 text-sm font-medium leading-relaxed">
              Check-in dan check-out mandiri dari ponsel dengan validasi titik koordinat GPS dan deteksi otomatis keterlambatan jam kerja.
            </p>
          </div>

          {/* Card 2: Cuti Mandiri */}
          <div className="bg-white p-8 rounded-3xl border border-[#E5E0D5] shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center font-bold text-xl">
              🏖️
            </div>
            <h3 className="text-xl font-bold">Manajemen Cuti & Izin</h3>
            <p className="text-gray-600 text-sm font-medium leading-relaxed">
              Karyawan dapat mengajukan izin dan memantau sisa kuota cuti tahunan, dengan alur persetujuan instan satu klik bagi tim HRD.
            </p>
          </div>

          {/* Card 3: Payroll Otomatis */}
          <div className="bg-white p-8 rounded-3xl border border-[#E5E0D5] shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center font-bold text-xl">
              💰
            </div>
            <h3 className="text-xl font-bold">Penggajian & Slip Gaji Otomatis</h3>
            <p className="text-gray-600 text-sm font-medium leading-relaxed">
              Kalkulasi gaji pokok, tunjangan, dan potongan dengan satu sentuhan. Cetak slip gaji digital instan kapan saja.
            </p>
          </div>

          {/* Card 4: Direktori & Struktur */}
          <div className="bg-white p-8 rounded-3xl border border-[#E5E0D5] shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-bold text-xl">
              👥
            </div>
            <h3 className="text-xl font-bold">Direktori & Manajemen Tim</h3>
            <p className="text-gray-600 text-sm font-medium leading-relaxed">
              Kelola data karyawan terpusat dengan filter jabatan, status kontrak, departemen, dan import massal via CSV/Excel.
            </p>
          </div>

          {/* Card 5: KPI & Evaluasi Kinerja */}
          <div className="bg-white p-8 rounded-3xl border border-[#E5E0D5] shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center font-bold text-xl">
              🎯
            </div>
            <h3 className="text-xl font-bold">Goal & KPI Tracking</h3>
            <p className="text-gray-600 text-sm font-medium leading-relaxed">
              Pantau target objektif karyawan per kuartal. Berikan evaluasi terukur untuk apresiasi performa tim secara objektif.
            </p>
          </div>

          {/* Card 6: Kepatuhan Pajak & Log Audit */}
          <div className="bg-white p-8 rounded-3xl border border-[#E5E0D5] shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl">
              ⚖️
            </div>
            <h3 className="text-xl font-bold">Kepatuhan Pajak & Log Audit</h3>
            <p className="text-gray-600 text-sm font-medium leading-relaxed">
              Kalkulasi estimasi PPh 21, BPJS Ketenagakerjaan & Kesehatan, serta jejak audit komprehensif untuk transparansi operasional.
            </p>
          </div>

        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Investasi Terbaik untuk Efisiensi Bisnis</h2>
          <p className="text-gray-600 font-medium">Pilih paket langganan yang fleksibel mengikuti skala pertumbuhan tim Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Starter */}
          <div className="bg-white p-8 rounded-3xl border border-[#E5E0D5] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-gray-500">Starter</span>
              <p className="text-4xl font-black">Rp 199.000<span className="text-sm font-medium text-gray-500">/bln</span></p>
              <p className="text-sm text-gray-600 font-medium">Ideal untuk studio atau tim perintis dengan 1–10 anggota tim.</p>
              
              <ul className="space-y-2 text-sm font-bold text-gray-700 pt-4 border-t border-gray-100">
                <li className="flex items-center gap-2">✓ Direktori Karyawan</li>
                <li className="flex items-center gap-2">✓ Presensi Online & GPS</li>
                <li className="flex items-center gap-2">✓ Pengajuan Cuti & Saldo</li>
              </ul>
            </div>

            <Link
              href="/register"
              className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-[#1A1A1A] font-bold rounded-2xl text-center text-sm transition-all"
            >
              Pilih Paket Starter
            </Link>
          </div>

          {/* Growth */}
          <div className="bg-white p-8 rounded-3xl border-2 border-[#0052FF] relative shadow-xl shadow-blue-500/10 flex flex-col justify-between space-y-6">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0052FF] text-white text-xs font-extrabold px-4 py-1 rounded-full uppercase tracking-wider">
              Paling Populer
            </span>

            <div className="space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#0052FF]">Growth</span>
              <p className="text-4xl font-black">Rp 25.000<span className="text-sm font-medium text-gray-500">/karyawan/bln</span></p>
              <p className="text-sm text-gray-600 font-medium">Untuk tim yang berkembang pesat (11–50 karyawan).</p>
              
              <ul className="space-y-2 text-sm font-bold text-gray-700 pt-4 border-t border-gray-100">
                <li className="flex items-center gap-2">✓ Semua Fitur Starter</li>
                <li className="flex items-center gap-2">✓ Penggajian Otomatis (Payroll)</li>
                <li className="flex items-center gap-2">✓ Slip Gaji Elektronik & Cetak PDF</li>
                <li className="flex items-center gap-2">✓ Ekspor Rekap Data CSV</li>
              </ul>
            </div>

            <Link
              href="/register"
              className="w-full py-3.5 bg-[#0052FF] hover:bg-blue-600 text-white font-bold rounded-2xl text-center text-sm transition-all shadow-md shadow-blue-500/30"
            >
              Mulai Free Trial 14 Hari
            </Link>
          </div>

          {/* Business */}
          <div className="bg-white p-8 rounded-3xl border border-[#E5E0D5] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-gray-500">Business</span>
              <p className="text-4xl font-black">Rp 35.000<span className="text-sm font-medium text-gray-500">/karyawan/bln</span></p>
              <p className="text-sm text-gray-600 font-medium">Solusi komprehensif untuk perusahaan 51–100+ karyawan.</p>
              
              <ul className="space-y-2 text-sm font-bold text-gray-700 pt-4 border-t border-gray-100">
                <li className="flex items-center gap-2">✓ Semua Fitur Growth</li>
                <li className="flex items-center gap-2">✓ Kepatuhan Pajak PPh 21 & BPJS</li>
                <li className="flex items-center gap-2">✓ Manajemen KPI & Evaluasi Kinerja</li>
                <li className="flex items-center gap-2">✓ Pipeline Rekrutmen (ATS)</li>
                <li className="flex items-center gap-2">✓ Log Audit Aktivitas Kepatuhan</li>
              </ul>
            </div>

            <Link
              href="/register"
              className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-[#1A1A1A] font-bold rounded-2xl text-center text-sm transition-all"
            >
              Mulai Paket Business
            </Link>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer id="about" className="py-12 border-t border-[#E5E0D5] text-center text-sm text-gray-500 font-medium">
        <p>© 2026 StackPlus Studio. Hak cipta dilindungi undang-undang.</p>
        <p className="mt-1 text-xs text-gray-400">Core Engine SaaS HRIS Architecture — Next.js 16 & NestJS Monorepo</p>
      </footer>

    </div>
  );
}
