import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, BookOpen, Upload, TrendingUp, Plus, LogOut,
  X, ChevronRight, Trash2, Award, Clock, BarChart2,
  GraduationCap, FileText, Check, AlertCircle
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, BarChart, Bar, Legend
} from 'recharts';

const API = async (url: string, opts: RequestInit = {}) => {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(url, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
  return res.json();
};

type Tab = 'overview' | 'children' | 'lessons' | 'progress';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [tab, setTab] = useState<Tab>('overview');
  const [children, setChildren] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [childProgress, setChildProgress] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showAddChild, setShowAddChild] = useState(false);
  const [showUploadLesson, setShowUploadLesson] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Forms
  const [childForm, setChildForm] = useState({ name: '', username: '', password: '', age: '', grade: '' });
  const [lessonForm, setLessonForm] = useState({ title: '', subject: 'math', level: 'beginner', description: '' });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [usernameError, setUsernameError] = useState('');

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => { fetchChildren(); fetchLessons(); }, []);

  const fetchChildren = async () => {
    const data = await API('/api/progress');
    if (data.success) {
      const uniqueChildren = [...new Map(
        data.data.progress.map((p: any) => [p.user._id, p.user])
      ).values()];
      setChildren(uniqueChildren);
    }
    // Also get children from user profile
    const userData = await API('/api/users/me');
    if (userData.success?.children) setChildren(userData.success.children);
  };

  const fetchLessons = async () => {
    const data = await API('/api/lessons');
    if (data.success) setLessons(data.data.lessons);
  };

  const fetchChildProgress = async (childId: string) => {
    setLoading(true);
    const data = await API(`/api/progress/student/${childId}`);
    if (data.success) setChildProgress(data.data);
    setLoading(false);
  };

  const handleAddChild = async () => {
    if (!childForm.name || !childForm.username || !childForm.password) {
      notify('Name, username and password are required', 'error'); return;
    }
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    const res = await fetch('/api/auth/create-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(childForm),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      notify('Student account created!');
      setShowAddChild(false);
      setChildForm({ name: '', username: '', password: '', age: '', grade: '' });
      fetchChildren();
    } else {
      if (data.message?.includes('username')) setUsernameError(data.message);
      else notify(data.message || 'Failed', 'error');
    }
  };

  const handleUploadLesson = async () => {
    if (!pdfFile || !lessonForm.title) { notify('Title and PDF are required', 'error'); return; }
    setLoading(true);
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    Object.entries(lessonForm).forEach(([k, v]) => formData.append(k, v));

    const token = localStorage.getItem('accessToken');
    const res = await fetch('/api/lessons', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      notify('Lesson uploaded!');
      setShowUploadLesson(false);
      setPdfFile(null);
      setLessonForm({ title: '', subject: 'math', level: 'beginner', description: '' });
      fetchLessons();
    } else notify(data.message || 'Upload failed', 'error');
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Delete this lesson?')) return;
    await API(`/api/lessons/${id}`, { method: 'DELETE' });
    notify('Lesson deleted');
    fetchLessons();
  };

  const logout = () => {
    localStorage.clear();
    navigate('/auth');
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder:text-[#8892B0] focus:outline-none focus:border-[#F5A623] transition-colors text-sm";
  const labelClass = "text-xs text-[#8892B0] font-semibold uppercase tracking-wider mb-1.5 block";

  // Radar chart data
  const radarData = childProgress ? [
    { subject: 'Math', score: childProgress.skillScores.math, world: childProgress.worldStandard.math },
    { subject: 'Literacy', score: childProgress.skillScores.literacy, world: childProgress.worldStandard.literacy },
    { subject: 'Science', score: childProgress.skillScores.science, world: childProgress.worldStandard.science },
    { subject: 'Language', score: childProgress.skillScores.language, world: childProgress.worldStandard.language },
    { subject: 'Life Skills', score: childProgress.skillScores['life-skills'], world: childProgress.worldStandard['life-skills'] },
  ] : [];

  // Quiz history chart
  const quizChartData = childProgress?.quizHistory?.slice(0, 10).reverse().map((q: any, i: number) => ({
    name: `Q${i + 1}`,
    score: q.score,
    date: new Date(q.takenAt).toLocaleDateString(),
  })) || [];

  return (
    <div className="min-h-screen bg-[#0A1628] text-white font-sans">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap'); * { font-family: 'DM Sans', sans-serif; }`}</style>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border ${
              notification.type === 'success'
                ? 'bg-green-500/20 border-green-500/40 text-green-300'
                : 'bg-red-500/20 border-red-500/40 text-red-300'
            }`}>
            {notification.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className="flex h-screen overflow-hidden">
        <aside className="w-64 bg-[#112240] border-r border-white/5 flex flex-col shrink-0">
          {/* Logo */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-2">
              <BookOpen className="text-[#F5A623]" size={22} />
              <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg font-bold">Crisis Classroom</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#F5A623]/20 flex items-center justify-center text-[#F5A623] font-bold text-sm">
                {user.name?.[0]?.toUpperCase() || 'P'}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-[#8892B0]">Parent Account</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            {[
              { id: 'overview', icon: BarChart2, label: 'Overview' },
              { id: 'children', icon: Users, label: 'My Children' },
              { id: 'lessons', icon: BookOpen, label: 'Lessons' },
              { id: 'progress', icon: TrendingUp, label: 'Progress' },
            ].map((item) => (
              <button key={item.id} onClick={() => setTab(item.id as Tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  tab === item.id
                    ? 'bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20'
                    : 'text-[#8892B0] hover:text-white hover:bg-white/5'
                }`}>
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/5">
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#8892B0] hover:text-[#FF5733] hover:bg-[#FF5733]/10 transition-all">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-8">

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl font-bold mb-2">
                Welcome back, {user.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-[#8892B0] mb-8">Here's what's happening with your children's learning today.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { icon: Users, label: 'Children', value: children.length, color: '#F5A623' },
                  { icon: BookOpen, label: 'Lessons Uploaded', value: lessons.length, color: '#FF5733' },
                  { icon: Award, label: 'Active Learners', value: children.length, color: '#10B981' },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#112240] rounded-2xl p-6 border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}20` }}>
                        <stat.icon size={20} style={{ color: stat.color }} />
                      </div>
                      <span className="text-[#8892B0] text-sm font-medium">{stat.label}</span>
                    </div>
                    <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={() => { setTab('children'); setShowAddChild(true); }}
                  className="bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-2xl p-6 text-left hover:bg-[#F5A623]/20 transition-all group">
                  <Plus size={24} className="text-[#F5A623] mb-3" />
                  <h3 className="font-bold text-white mb-1">Add Child Account</h3>
                  <p className="text-[#8892B0] text-sm">Create a student login for your child</p>
                  <ChevronRight size={16} className="text-[#F5A623] mt-3 group-hover:translate-x-1 transition-transform" />
                </button>

                <button onClick={() => { setTab('lessons'); setShowUploadLesson(true); }}
                  className="bg-[#FF5733]/10 border border-[#FF5733]/30 rounded-2xl p-6 text-left hover:bg-[#FF5733]/20 transition-all group">
                  <Upload size={24} className="text-[#FF5733] mb-3" />
                  <h3 className="font-bold text-white mb-1">Upload Lesson</h3>
                  <p className="text-[#8892B0] text-sm">Add a PDF lesson for your children</p>
                  <ChevronRight size={16} className="text-[#FF5733] mt-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── CHILDREN ── */}
          {tab === 'children' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl font-bold">My Children</h1>
                  <p className="text-[#8892B0] mt-1">Manage student accounts for your children</p>
                </div>
                <button onClick={() => setShowAddChild(true)}
                  className="flex items-center gap-2 bg-[#F5A623] hover:bg-[#FF5733] text-[#0A1628] font-bold px-5 py-2.5 rounded-xl transition-colors">
                  <Plus size={18} /> Add Child
                </button>
              </div>

              {children.length === 0 ? (
                <div className="bg-[#112240] rounded-2xl p-12 text-center border border-white/5">
                  <GraduationCap size={48} className="text-[#8892B0] mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No children yet</h3>
                  <p className="text-[#8892B0] mb-6">Create student accounts for your children to get started</p>
                  <button onClick={() => setShowAddChild(true)}
                    className="bg-[#F5A623] text-[#0A1628] font-bold px-6 py-3 rounded-xl">
                    Add First Child
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {children.map((child: any) => (
                    <div key={child._id} className="bg-[#112240] rounded-2xl p-6 border border-white/5 hover:border-[#F5A623]/30 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F5A623] to-[#FF5733] flex items-center justify-center text-[#0A1628] font-bold text-lg">
                          {child.name?.[0]?.toUpperCase() || child.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{child.name}</h3>
                          <p className="text-[#8892B0] text-sm">@{child.username}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 text-xs mb-4">
                        <span className="bg-[#F5A623]/10 text-[#F5A623] px-2 py-1 rounded-lg">Grade {child.grade || 'N/A'}</span>
                        <span className="bg-white/5 text-[#8892B0] px-2 py-1 rounded-lg">Age {child.age || 'N/A'}</span>
                        <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded-lg capitalize">{child.currentLevel || 'beginner'}</span>
                      </div>
                      <button onClick={() => { setSelectedChild(child); fetchChildProgress(child._id); setTab('progress'); }}
                        className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-[#F5A623]/10 hover:text-[#F5A623] border border-white/10 hover:border-[#F5A623]/30 text-sm font-medium py-2.5 rounded-xl transition-all">
                        View Progress <ChevronRight size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── LESSONS ── */}
          {tab === 'lessons' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl font-bold">Lessons</h1>
                  <p className="text-[#8892B0] mt-1">Upload and manage PDF lessons</p>
                </div>
                <button onClick={() => setShowUploadLesson(true)}
                  className="flex items-center gap-2 bg-[#F5A623] hover:bg-[#FF5733] text-[#0A1628] font-bold px-5 py-2.5 rounded-xl transition-colors">
                  <Upload size={18} /> Upload PDF
                </button>
              </div>

              {lessons.length === 0 ? (
                <div className="bg-[#112240] rounded-2xl p-12 text-center border border-white/5">
                  <FileText size={48} className="text-[#8892B0] mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No lessons yet</h3>
                  <p className="text-[#8892B0] mb-6">Upload PDF lessons for your children to learn from</p>
                  <button onClick={() => setShowUploadLesson(true)}
                    className="bg-[#F5A623] text-[#0A1628] font-bold px-6 py-3 rounded-xl">
                    Upload First Lesson
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {lessons.map((lesson: any) => (
                    <div key={lesson._id} className="bg-[#112240] rounded-2xl p-6 border border-white/5 hover:border-[#F5A623]/30 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-lg mb-1">{lesson.title}</h3>
                          <p className="text-[#8892B0] text-sm">{lesson.description}</p>
                        </div>
                        <button onClick={() => handleDeleteLesson(lesson._id)}
                          className="ml-3 text-[#8892B0] hover:text-[#FF5733] transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className="bg-[#F5A623]/10 text-[#F5A623] px-2.5 py-1 rounded-lg text-xs font-medium capitalize">{lesson.subject}</span>
                        <span className="bg-white/5 text-[#8892B0] px-2.5 py-1 rounded-lg text-xs capitalize">{lesson.level}</span>
                        <span className="bg-white/5 text-[#8892B0] px-2.5 py-1 rounded-lg text-xs">{lesson.pdfSizeKB} KB</span>
                      </div>
                      {lesson.assignedTo?.length > 0 && (
                        <p className="text-xs text-green-400 mt-3">✓ Assigned to {lesson.assignedTo.length} student(s)</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── PROGRESS ── */}
          {tab === 'progress' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl font-bold mb-2">Progress Analytics</h1>
              <p className="text-[#8892B0] mb-6">Detailed performance tracking compared to world standards</p>

              {/* Child selector */}
              <div className="flex gap-3 mb-8 flex-wrap">
                {children.map((child: any) => (
                  <button key={child._id}
                    onClick={() => { setSelectedChild(child); fetchChildProgress(child._id); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      selectedChild?._id === child._id
                        ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]'
                        : 'border-white/10 text-[#8892B0] hover:border-white/30'
                    }`}>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#F5A623] to-[#FF5733] flex items-center justify-center text-[#0A1628] text-xs font-bold">
                      {child.name?.[0] || child.username?.[0]}
                    </div>
                    {child.name || child.username}
                  </button>
                ))}
              </div>

              {loading && (
                <div className="flex items-center justify-center py-20">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-10 h-10 border-2 border-[#F5A623] border-t-transparent rounded-full" />
                </div>
              )}

              {childProgress && !loading && (
                <div className="space-y-6">
                  {/* Stats row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Avg Score', value: `${childProgress.avgScore}%`, icon: Award, color: '#F5A623' },
                      { label: 'Quizzes Taken', value: childProgress.totalLessons, icon: FileText, color: '#FF5733' },
                      { label: 'Lessons', value: childProgress.totalLessons, icon: BookOpen, color: '#10B981' },
                      { label: 'Level', value: childProgress.student?.currentLevel || 'Beginner', icon: TrendingUp, color: '#8B5CF6' },
                    ].map((s, i) => (
                      <div key={i} className="bg-[#112240] rounded-2xl p-5 border border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                          <s.icon size={16} style={{ color: s.color }} />
                          <span className="text-[#8892B0] text-xs">{s.label}</span>
                        </div>
                        <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold capitalize">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Radar chart — skills vs world standard */}
                    <div className="bg-[#112240] rounded-2xl p-6 border border-white/5">
                      <h3 className="font-bold text-white mb-1">Skills vs World Standard</h3>
                      <p className="text-[#8892B0] text-xs mb-4">Compared to UNESCO/PISA benchmarks</p>
                      <ResponsiveContainer width="100%" height={260}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#8892B0', fontSize: 12 }} />
                          <Radar name="Student" dataKey="score" stroke="#F5A623" fill="#F5A623" fillOpacity={0.3} />
                          <Radar name="World Avg" dataKey="world" stroke="#FF5733" fill="#FF5733" fillOpacity={0.1} strokeDasharray="4 4" />
                          <Legend formatter={(v) => <span style={{ color: v === 'Student' ? '#F5A623' : '#FF5733', fontSize: 12 }}>{v}</span>} />
                          <Tooltip contentStyle={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Line chart — quiz history */}
                    <div className="bg-[#112240] rounded-2xl p-6 border border-white/5">
                      <h3 className="font-bold text-white mb-1">Quiz Score History</h3>
                      <p className="text-[#8892B0] text-xs mb-4">Last 10 quiz results</p>
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={quizChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" tick={{ fill: '#8892B0', fontSize: 12 }} />
                          <YAxis domain={[0, 100]} tick={{ fill: '#8892B0', fontSize: 12 }} />
                          <Tooltip contentStyle={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                            formatter={(v: any) => [`${v}%`, 'Score']} />
                          <Line type="monotone" dataKey="score" stroke="#F5A623" strokeWidth={2} dot={{ fill: '#F5A623', r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Bar chart — skills breakdown */}
                    <div className="bg-[#112240] rounded-2xl p-6 border border-white/5 lg:col-span-2">
                      <h3 className="font-bold text-white mb-1">Subject Performance</h3>
                      <p className="text-[#8892B0] text-xs mb-4">Student score vs World average by subject</p>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={radarData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="subject" tick={{ fill: '#8892B0', fontSize: 12 }} />
                          <YAxis domain={[0, 100]} tick={{ fill: '#8892B0', fontSize: 12 }} />
                          <Tooltip contentStyle={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                          <Legend formatter={(v) => <span style={{ fontSize: 12 }}>{v}</span>} />
                          <Bar dataKey="score" name="Student" fill="#F5A623" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="world" name="World Avg" fill="#FF5733" opacity={0.6} radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {!selectedChild && !loading && (
                <div className="bg-[#112240] rounded-2xl p-12 text-center border border-white/5">
                  <TrendingUp size={48} className="text-[#8892B0] mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Select a child</h3>
                  <p className="text-[#8892B0]">Choose a child above to view their detailed progress</p>
                </div>
              )}
            </motion.div>
          )}
        </main>
      </div>

      {/* ── MODAL: Add Child ── */}
      <AnimatePresence>
        {showAddChild && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="bg-[#112240] rounded-2xl p-8 w-full max-w-md border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold">Add Child Account</h2>
                <button onClick={() => { setShowAddChild(false); setUsernameError(''); }} className="text-[#8892B0] hover:text-white"><X size={22} /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input placeholder="Child's full name" value={childForm.name}
                    onChange={e => setChildForm({ ...childForm, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Username <span className="text-[#8892B0] normal-case font-normal">(for login)</span></label>
                  <input placeholder="e.g. amina_2015" value={childForm.username}
                    onChange={e => { setChildForm({ ...childForm, username: e.target.value }); setUsernameError(''); }}
                    className={`${inputClass} ${usernameError ? 'border-red-500' : ''}`} />
                  {usernameError && <p className="text-red-400 text-xs mt-1">{usernameError}</p>}
                  <p className="text-[#8892B0] text-xs mt-1">Only letters, numbers, underscore. 3-20 characters.</p>
                </div>
                <div>
                  <label className={labelClass}>Password</label>
                  <input type="password" placeholder="Min. 6 characters" value={childForm.password}
                    onChange={e => setChildForm({ ...childForm, password: e.target.value })} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Age</label>
                    <input type="number" placeholder="10" value={childForm.age}
                      onChange={e => setChildForm({ ...childForm, age: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Grade</label>
                    <input placeholder="5" value={childForm.grade}
                      onChange={e => setChildForm({ ...childForm, grade: e.target.value })} className={inputClass} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => { setShowAddChild(false); setUsernameError(''); }}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-[#8892B0] hover:text-white text-sm font-medium">Cancel</button>
                <button onClick={handleAddChild} disabled={loading}
                  className="flex-1 bg-[#F5A623] hover:bg-[#FF5733] text-[#0A1628] font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL: Upload Lesson ── */}
      <AnimatePresence>
        {showUploadLesson && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="bg-[#112240] rounded-2xl p-8 w-full max-w-md border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold">Upload Lesson</h2>
                <button onClick={() => setShowUploadLesson(false)} className="text-[#8892B0] hover:text-white"><X size={22} /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Lesson Title</label>
                  <input placeholder="e.g. Basic Mathematics" value={lessonForm.title}
                    onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Subject</label>
                    <select value={lessonForm.subject} onChange={e => setLessonForm({ ...lessonForm, subject: e.target.value })}
                      className={inputClass + ' appearance-none'}>
                      {['math', 'literacy', 'science', 'language', 'life-skills', 'other'].map(s => (
                        <option key={s} value={s} className="bg-[#112240] capitalize">{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Level</label>
                    <select value={lessonForm.level} onChange={e => setLessonForm({ ...lessonForm, level: e.target.value })}
                      className={inputClass + ' appearance-none'}>
                      {['beginner', 'intermediate', 'advanced'].map(l => (
                        <option key={l} value={l} className="bg-[#112240] capitalize">{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Description <span className="text-white/20 normal-case font-normal">(optional)</span></label>
                  <input placeholder="Brief description..." value={lessonForm.description}
                    onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })} className={inputClass} />
                </div>

                {/* PDF upload */}
                <div>
                  <label className={labelClass}>PDF File</label>
                  <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${
                    pdfFile ? 'border-[#F5A623]/50 bg-[#F5A623]/5' : 'border-white/10 hover:border-[#F5A623]/30'
                  }`}>
                    <FileText size={24} className={pdfFile ? 'text-[#F5A623]' : 'text-[#8892B0]'} />
                    <span className="text-sm text-[#8892B0]">
                      {pdfFile ? pdfFile.name : 'Click to select PDF (max 20MB)'}
                    </span>
                    <input type="file" accept=".pdf" className="hidden"
                      onChange={e => setPdfFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowUploadLesson(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-[#8892B0] hover:text-white text-sm font-medium">Cancel</button>
                <button onClick={handleUploadLesson} disabled={loading}
                  className="flex-1 bg-[#F5A623] hover:bg-[#FF5733] text-[#0A1628] font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
                  {loading ? 'Uploading...' : 'Upload Lesson'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}