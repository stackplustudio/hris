'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';

interface Candidate {
  id: string;
  name: string;
  role: string;
  stage: string;
}

export default function AdminRecruitmentPage() {
  const { session, loading } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [newCandidate, setNewCandidate] = useState({ name: '', role: '' });
  const [isAdding, setIsAdding] = useState(false);

  const fetchCandidates = async () => {
    if (!session?.tenant?.id) return;
    try {
      const res = await api.get(`/recruitment?tenantId=${session.tenant.id}`);
      setCandidates(res.data);
    } catch (error) {
      toast.error('Gagal memuat data ATS');
    }
  };

  useEffect(() => {
    if (!loading) fetchCandidates();
  }, [session, loading]);

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.tenant?.id || !newCandidate.name || !newCandidate.role) return;
    
    try {
      await api.post('/recruitment', {
        tenantId: session.tenant.id,
        ...newCandidate
      });
      toast.success('Kandidat berhasil ditambahkan!');
      setNewCandidate({ name: '', role: '' });
      setIsAdding(false);
      fetchCandidates();
    } catch (error) {
      toast.error('Gagal menambahkan kandidat');
    }
  };

  const handleMoveStage = async (id: string, currentStage: string) => {
    const stages = ['APPLIED', 'INTERVIEW', 'OFFERED', 'HIRED'];
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex === stages.length - 1) return; // Sudah Hired
    
    const nextStage = stages[currentIndex + 1];
    try {
      await api.patch(`/recruitment/${id}/stage`, { stage: nextStage });
      toast.success(`Kandidat dipindahkan ke ${nextStage}`);
      fetchCandidates();
    } catch (error) {
      toast.error('Gagal memperbarui status kandidat');
    }
  };

  if (loading) return null;

  return (
    <div className="p-8 max-w-full mx-auto h-full flex flex-col space-y-6">
      
      <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-6 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight">Applicant Tracking System (ATS)</h1>
          <p className="text-gray-600 font-medium text-sm mt-1">Kelola pipa rekrutmen dan lacak kandidat terbaik Anda.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all"
        >
          {isAdding ? 'Batal' : '+ Lowongan / Kandidat Baru'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddCandidate} className="bg-white/50 backdrop-blur-md border border-white/60 p-6 rounded-[2rem] flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 mb-1">Nama Kandidat</label>
            <input required type="text" value={newCandidate.name} onChange={e => setNewCandidate({...newCandidate, name: e.target.value})} className="w-full bg-white/70 px-4 py-2 rounded-xl outline-none" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 mb-1">Posisi (Role)</label>
            <input required type="text" value={newCandidate.role} onChange={e => setNewCandidate({...newCandidate, role: e.target.value})} className="w-full bg-white/70 px-4 py-2 rounded-xl outline-none" />
          </div>
          <button type="submit" className="bg-[#0052FF] text-white px-6 py-2.5 rounded-xl font-bold">Simpan</button>
        </form>
      )}

      {/* Kanban Board Container */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 overflow-x-auto pb-4">
        
        {['APPLIED', 'INTERVIEW', 'OFFERED', 'HIRED'].map((stageName) => {
          const filtered = candidates.filter(c => c.stage === stageName);
          const colors: any = {
            APPLIED: 'text-gray-600 bg-gray-200',
            INTERVIEW: 'text-blue-600 bg-blue-100',
            OFFERED: 'text-yellow-600 bg-yellow-100',
            HIRED: 'text-green-600 bg-green-100'
          };
          
          return (
            <div key={stageName} className="bg-white/20 backdrop-blur-md border border-white/40 rounded-[2rem] p-4 flex flex-col min-w-[280px]">
              <h3 className={`font-bold uppercase tracking-widest text-xs mb-4 px-2 ${colors[stageName].split(' ')[0]}`}>
                {stageName} <span className={`${colors[stageName].split(' ')[1]} text-gray-800 px-2 py-0.5 rounded-full ml-2`}>{filtered.length}</span>
              </h3>
              <div className="space-y-4">
                {filtered.map(c => (
                  <div key={c.id} className="bg-white/80 p-4 rounded-2xl shadow-sm border border-white group relative">
                    <p className="font-extrabold text-[#1A1A1A]">{c.name}</p>
                    <p className="text-xs font-bold text-[#0052FF] bg-[#0052FF]/10 inline-block px-2 py-1 rounded-md mt-2">{c.role}</p>
                    
                    {stageName !== 'HIRED' && (
                      <button 
                        onClick={() => handleMoveStage(c.id, stageName)}
                        className="absolute bottom-4 right-4 text-xs font-bold bg-[#1A1A1A] text-white px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Lanjut
                      </button>
                    )}
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="h-20 flex items-center justify-center border-2 border-dashed border-white/50 rounded-2xl">
                    <p className="text-xs font-bold text-gray-400">Kosong</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}

      </div>
    </div>
  );
}