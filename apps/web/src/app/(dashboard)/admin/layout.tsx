'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardCheck,
  LayoutDashboard,
  ReceiptText,
  UsersRound,
} from 'lucide-react';
import DashboardShell, {
  type DashboardNavigationGroup,
} from '@/components/dashboard-shell';
import { useAuth } from '@/hooks/useAuth';

const navigationGroups: DashboardNavigationGroup[] = [
  {
    label: 'Core HR',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/employees', label: 'Karyawan', icon: UsersRound },
      { href: '/admin/attendances', label: 'Kehadiran', icon: ClipboardCheck },
      { href: '/admin/leaves', label: 'Cuti dan izin', icon: CalendarDays },
    ],
  },
  {
    label: 'Keuangan',
    items: [
      { href: '/admin/payroll', label: 'Payroll', icon: CircleDollarSign },
      { href: '/admin/taxes', label: 'Pajak dan BPJS', icon: ReceiptText },
    ],
  },
  {
    label: 'Talenta',
    items: [
      { href: '/admin/performance', label: 'Kinerja', icon: ChartNoAxesCombined },
      { href: '/admin/recruitment', label: 'Rekrutmen', icon: BriefcaseBusiness },
    ],
  },
  {
    items: [{ href: '/admin/reports', label: 'Laporan', icon: BarChart3 }],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (
      !loading &&
      session &&
      session.role !== 'COMPANY_ADMIN' &&
      session.role !== 'SUPER_ADMIN'
    ) {
      router.replace('/employee');
    }
  }, [session, loading, router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (
    loading ||
    (session && session.role !== 'COMPANY_ADMIN' && session.role !== 'SUPER_ADMIN')
  ) {
    return null;
  }

  return (
    <DashboardShell
      groups={navigationGroups}
      onLogout={handleLogout}
      userName={session?.employee?.fullName || 'Admin HR'}
    >
      {children}
    </DashboardShell>
  );
}
