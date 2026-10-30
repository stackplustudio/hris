'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CalendarDays, ChartNoAxesCombined, FileText, LayoutDashboard } from 'lucide-react';
import DashboardShell, {
  type DashboardNavigationGroup,
} from '@/components/dashboard-shell';
import { useAuth } from '@/hooks/useAuth';

const navigationGroups: DashboardNavigationGroup[] = [
  {
    label: 'Ruang kerja',
    items: [
      { href: '/employee', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/employee/leaves', label: 'Riwayat cuti', icon: CalendarDays },
      { href: '/employee/payslips', label: 'Slip gaji', icon: FileText },
      { href: '/employee/performance', label: 'Target kinerja', icon: ChartNoAxesCombined },
    ],
  },
];

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/login');
    }
  }, [session, loading, router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading || !session) return null;

  return (
    <DashboardShell
      groups={navigationGroups}
      onLogout={handleLogout}
      userName={session.employee?.fullName || 'Karyawan'}
    >
      {children}
    </DashboardShell>
  );
}
