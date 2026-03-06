import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Brain, Trophy, Clock, LogOut,
  ChevronRight, Send, Zap, BarChart2, Star,
  WifiOff, TrendingUp, CheckCircle, XCircle, RefreshCw
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, Legend
} from 'recharts';

const API = async (url: string, opts: RequestInit = {}) => {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(url, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  return res.json();
};

type Tab = 'home' | 'books' | 'learn' | 'quiz' | 'progress';

const INTERESTS = ['⚽ Sport','🎵 Musiqa','💻 Texnologiya','🎨 San\'at','🍳 Oshpazlik','🚀 Kosmik','🦁 Hayvonlar','🎮 O\'yinlar','📸 Fotografiya','🌿 Tabiat'];
const SUBJECTS = ['math','literacy','science','language','history','geography','physics','chemistry','biology'];
const SUBJECT_EMOJI: Record<string, string> = { math:'🔢', literacy:'📖', science:'🔬', language:'🗣️', history:'🏛️', geography:'🌍', physics:'⚡', chemistry:'⚗️', biology:'🧬', other:'📚' };

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [tab, setTab] = useState<Tab>('home');
  const [profile, setProfile] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState<any>(null); // {type: 'book'|'lesson', data}
  const [progressData, setProgressData] = useState<any>(null);

  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardStep, setOnboardStep] = useState(0);
  const [onboardData, setOnboardData] = useState({
    grade: 0, language: 'uz', interests: [] as string[],
    difficultSubjects: [] as string[], favoriteSubjects: [] as string[]
  });

  // AI Chat
  const [messages, setMessages] = useState<{role:'user'|'ai'; text:string}[]>([]);
  const [sessionId, setSessionId] = useState<string|null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Quiz
  const [quiz, setQuiz] = useState<any[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(false);

  useEffect(() => { init(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const init = async () => {
    const [profileRes, booksRes, lessonsRes, progressRes] = await Promise.all([
      API('/api/student/profile'),
      API('/api/student/books'),
      API('/api/lessons'),
      API('/api/student/progress'),
    ]);
    if (profileRes.success) {
      setProfile(profileRes.data.profile);
      if (!profileRes.data.profile?.isOnboardingComplete) setShowOnboarding(true);
    } else {
      setShowOnboarding(true);
    }
    if (booksRes.success) setBooks(booksRes.data.books);
    if (lessonsRes.success) setLessons(lessonsRes.data.lessons);
    if (progressRes.success) setProgressData(progressRes.data);
  };

  const saveOnboarding = async () => {
    const res = await API('/api/student/onboarding', {
      method: 'POST',
      body: JSON.stringify(onboardData),
    });
    if (res.success) {
      setProfile(res.data.profile);
      setShowOnboarding(false);
      init();
    }
  };

  const openSource = (type: 'book'|'lesson', data: any) => {
    setSelectedSource({ type, data });
    setSessionId(null);
    setMessages([{
      role: 'ai',
      text: `Salom! 👋 Men sizning AI o'qituvchingizman. **${data.title}** bo'yicha dars boshlaymizmi? Menga savol bering yoki "Boshidan tushuntir" deb yozing!`
    }]);
    setTab('learn');
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !selectedSource) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);

    const body: any = { message: userMsg };
    if (sessionId) body.sessionId = sessionId;
    if (selectedSource.type === 'book') body.bookId = selectedSource.data._id;
    else body.lessonPackId = selectedSource.data._id;

    const res = await API('/api/student/chat', { method: 'POST', body: JSON.stringify(body) });
    setChatLoading(false);

    if (res.success) {
      setMessages(prev => [...prev, { role: 'ai', text: res.data.response }]);
      if (!sessionId) setSessionId(res.data.sessionId);
    } else {
      setMessages(prev => [...prev, { role: 'ai', text: 'Kechirasiz, xatolik yuz berdi. Qayta urinib ko\'ring.' }]);
    }
  };

  const startQuiz = async () => {
    setQuizLoading(true);
    setQuizSubmitted(false);
    setQuizResult(null);
    setQuizAnswers([]);
    setTab('quiz');

    const body: any = {};
    if (sessionId) body.sessionId = sessionId;
    if (selectedSource?.type === 'book') body.bookId = selectedSource.data._id;
    else if (selectedSource?.type === 'lesson') body.lessonPackId = selectedSource.data._id;
    body.subject = selectedSource?.data?.subject || 'general';

    const res = await API('/api/student/quiz/generate', { method: 'POST', body: JSON.stringify(body) });
    setQuizLoading(false);

    if (res.success) {
      setQuiz(res.data.questions);
      setQuizAnswers(new Array(res.data.questions.length).fill(-1));
    }
  };

  const submitQuiz = async () => {
    if (quizAnswers.includes(-1)) return;
    const body: any = {
      questions: quiz, answers: quizAnswers,
      subject: selectedSource?.data?.subject || 'general',
      topic: selectedSource?.data?.title,
    };
    if (selectedSource?.type === 'book') body.bookId = selectedSource.data._id;
    else if (selectedSource?.type === 'lesson') body.lessonPackId = selectedSource.data._id;

    const res = await API('/api/student/quiz/submit', { method: 'POST', body: JSON.stringify(body) });
    if (res.success) {
      setQuizResult(res.data);
      setQuizSubmitted(true);
      init();
    }
  };

  const logout = () => { localStorage.clear(); navigate('/auth'); };

  const lang = profile?.language || 'uz';

  // ── ONBOARDING MODAL ──
  const onboardSteps = [
    {
      title: 'Salom! 👋 Men sizning AI o\'qituvchingizman',
      subtitle: 'Sizni yaxshiroq tanish uchun bir necha savol beraman',
      content: (
        <div>
          <p className="text-[#8892B0] text-sm mb-4">Nechanchi sinfda o'qisiz?</p>
          <div className="grid grid-cols-4 gap-2">
            {[1,2,3,4,5,6,7,8,9,10,11].map(g => (
              <button key={g} onClick={() => setOnboardData(d => ({...d, grade: g}))}
                className={`py-3 rounded-xl font-bold text-sm transition-all ${onboardData.grade === g ? 'bg-[#F5A623] text-[#0A1628]' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                {g}
              </button>
            ))}
          </div>
        </div>
      ),
      canNext: onboardData.grade > 0,
    },
    {
      title: 'O\'rganish tilini tanlang 🌍',
      subtitle: 'AI siz bilan shu tilda gaplashadi',
      content: (
        <div className="grid grid-cols-3 gap-3">
          {[{code:'uz',label:"O'zbek 🇺🇿"},{code:'ru',label:"Ruscha 🇷🇺"},{code:'en',label:"English 🇬🇧"}].map(l => (
            <button key={l.code} onClick={() => setOnboardData(d => ({...d, language: l.code}))}
              className={`py-4 rounded-xl font-bold text-sm transition-all ${onboardData.language === l.code ? 'bg-[#F5A623] text-[#0A1628]' : 'bg-white/5 text-white hover:bg-white/10'}`}>
              {l.label}
            </button>
          ))}
        </div>
      ),
      canNext: true,
    },
    {
      title: 'Qiziqishlaringiz? 🎯',
      subtitle: 'AI darslarni sizning sevgan narsalaringiz orqali tushuntiradi',
      content: (
        <div className="grid grid-cols-2 gap-2">
          {INTERESTS.map(interest => {
            const selected = onboardData.interests.includes(interest);
            return (
              <button key={interest} onClick={() => setOnboardData(d => ({
                ...d,
                interests: selected ? d.interests.filter(i => i !== interest) : [...d.interests, interest]
              }))}
                className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${selected ? 'bg-[#F5A623] text-[#0A1628]' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                {interest}
              </button>
            );
          })}
        </div>
      ),
      canNext: onboardData.interests.length > 0,
    },
    {
      title: 'Qaysi fanlar qiyin? 📚',
      subtitle: 'AI bu fanlarni alohida e\'tibor bilan o\'rgatadi',
      content: (
        <div className="grid grid-cols-3 gap-2">
          {SUBJECTS.map(s => {
            const selected = onboardData.difficultSubjects.includes(s);
            return (
              <button key={s} onClick={() => setOnboardData(d => ({
                ...d,
                difficultSubjects: selected ? d.difficultSubjects.filter(x => x !== s) : [...d.difficultSubjects, s]
              }))}
                className={`py-3 rounded-xl text-sm font-medium transition-all capitalize ${selected ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                {SUBJECT_EMOJI[s]} {s}
              </button>
            );
          })}
        </div>
      ),
      canNext: true,
    },
  ];

  const radarData = progressData?.subjectScores?.map((s: any) => ({
    subject: s.subject, score: s.avgScore,
  })) || [];

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap'); * { font-family: 'DM Sans', sans-serif; }`}</style>

      {/* ── ONBOARDING MODAL ── */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-[#112240] rounded-2xl p-8 w-full max-w-lg border border-white/10 shadow-2xl">

              {/* Progress dots */}
              <div className="flex gap-2 mb-6">
                {onboardSteps.map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= onboardStep ? 'bg-[#F5A623]' : 'bg-white/10'}`} />
                ))}
              </div>

              <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold mb-1">
                {onboardSteps[onboardStep].title}
              </h2>
              <p className="text-[#8892B0] text-sm mb-6">{onboardSteps[onboardStep].subtitle}</p>

              {onboardSteps[onboardStep].content}

              <div className="flex gap-3 mt-6">
                {onboardStep > 0 && (
                  <button onClick={() => setOnboardStep(s => s - 1)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-[#8892B0] hover:text-white text-sm">
                    Orqaga
                  </button>
                )}
                {onboardStep < onboardSteps.length - 1 ? (
                  <button onClick={() => setOnboardStep(s => s + 1)}
                    disabled={!onboardSteps[onboardStep].canNext}
                    className="flex-1 bg-[#F5A623] disabled:opacity-40 text-[#0A1628] font-bold py-3 rounded-xl">
                    Davom etish →
                  </button>
                ) : (
                  <button onClick={saveOnboarding}
                    className="flex-1 bg-[#F5A623] hover:bg-[#FF5733] text-[#0A1628] font-bold py-3 rounded-xl">
                    Boshlash! 🚀
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#112240] border-r border-white/5 flex flex-col shrink-0">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="text-[#F5A623]" size={22} />
              <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg font-bold">Crisis Classroom</span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5A623] to-[#FF5733] flex items-center justify-center text-[#0A1628] font-bold">
                {(user.name || user.username || 'S')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold">{user.name || user.username}</p>
                <p className="text-xs text-[#8892B0]">{profile?.grade ? `${profile.grade}-sinf` : 'Student'}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {[
              { id: 'home', icon: Star, label: 'Bosh sahifa' },
              { id: 'books', icon: BookOpen, label: 'Kitoblar & Darslar' },
              { id: 'learn', icon: Brain, label: 'AI O\'qituvchi', disabled: !selectedSource },
              { id: 'quiz', icon: Zap, label: 'Quiz', disabled: !selectedSource },
              { id: 'progress', icon: BarChart2, label: 'Mening natijam' },
            ].map((item) => (
              <button key={item.id}
                onClick={() => !(item as any).disabled && setTab(item.id as Tab)}
                disabled={(item as any).disabled}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  (item as any).disabled ? 'opacity-30 cursor-not-allowed text-[#8892B0]' :
                  tab === item.id ? 'bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20' :
                  'text-[#8892B0] hover:text-white hover:bg-white/5'
                }`}>
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/5 space-y-2">
            <button onClick={() => setShowOnboarding(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[#8892B0] hover:text-white hover:bg-white/5 transition-all">
              <RefreshCw size={16} /> Sozlamalar
            </button>
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-[#8892B0]">
              <WifiOff size={12} /> Offline ready
            </div>
            <button onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#8892B0] hover:text-[#FF5733] hover:bg-[#FF5733]/10 transition-all">
              <LogOut size={18} /> Chiqish
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">

          {/* ── HOME ── */}
          {tab === 'home' && (
            <div className="p-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl font-bold mb-1">
                  Salom, {user.name || user.username}! 👋
                </h1>
                <p className="text-[#8892B0] mb-8">Bugun nima o'rganamiz?</p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { icon: BookOpen, label: 'Kitob & Darslar', value: books.length + lessons.length, color: '#F5A623' },
                    { icon: Trophy, label: "O'rtacha ball", value: `${progressData?.avgScore || 0}%`, color: '#FF5733' },
                    { icon: TrendingUp, label: 'Prognoz', value: `${progressData?.forecast || 0}%`, color: '#10B981' },
                  ].map((s, i) => (
                    <div key={i} className="bg-[#112240] rounded-2xl p-5 border border-white/5">
                      <s.icon size={18} style={{ color: s.color }} className="mb-2" />
                      <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold">{s.value}</p>
                      <p className="text-[#8892B0] text-xs mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Qiyin fanlar */}
                {profile?.difficultSubjects?.length > 0 && (
                  <div className="bg-[#112240] rounded-2xl p-6 border border-red-500/20 mb-6">
                    <h3 className="font-bold text-white mb-3">🎯 Qiynalayotgan fanlaringiz</h3>
                    <div className="flex gap-2 flex-wrap">
                      {profile.difficultSubjects.map((s: string) => (
                        <span key={s} className="bg-red-500/10 text-red-300 border border-red-500/20 px-3 py-1.5 rounded-xl text-sm capitalize">
                          {SUBJECT_EMOJI[s]} {s}
                        </span>
                      ))}
                    </div>
                    <p className="text-[#8892B0] text-xs mt-3">AI bu fanlarni sizning qiziqishlaringiz orqali tushuntiradi</p>
                  </div>
                )}

                {/* So'nggi quizlar */}
                {progressData?.recentQuizzes?.length > 0 && (
                  <div className="bg-[#112240] rounded-2xl p-6 border border-white/5">
                    <h3 className="font-bold text-white mb-4">📊 So'nggi quizlar</h3>
                    <div className="space-y-3">
                      {progressData.recentQuizzes.slice(0,3).map((q: any, i: number) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                          <div>
                            <p className="text-sm font-medium capitalize">{SUBJECT_EMOJI[q.subject]} {q.subject}</p>
                            <p className="text-xs text-[#8892B0]">{new Date(q.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`font-bold text-lg ${q.score >= 70 ? 'text-green-400' : q.score >= 50 ? 'text-[#F5A623]' : 'text-red-400'}`}>
                            {q.score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* ── BOOKS & LESSONS ── */}
          {tab === 'books' && (
            <div className="p-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl font-bold mb-1">Kitoblar & Darslar</h1>
                <p className="text-[#8892B0] mb-8">O'rganmoqchi bo'lgan mavzuni tanlang</p>

                {/* Admin kitoblar */}
                {books.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-[#F5A623]/20 rounded-lg flex items-center justify-center text-[#F5A623] text-xs">📚</span>
                      Darsliklar ({profile?.grade}-sinf)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {books.map((book: any) => (
                        <motion.div key={book._id} whileHover={{ y: -2 }}
                          className={`bg-[#112240] rounded-2xl p-6 border cursor-pointer transition-all ${selectedSource?.data?._id === book._id ? 'border-[#F5A623]/50' : 'border-white/5 hover:border-[#F5A623]/30'}`}
                          onClick={() => openSource('book', book)}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-12 h-12 rounded-xl bg-[#F5A623]/10 flex items-center justify-center text-2xl">
                              {book.coverEmoji || SUBJECT_EMOJI[book.subject] || '📚'}
                            </div>
                            <span className="text-xs bg-[#F5A623]/10 text-[#F5A623] px-2 py-1 rounded-lg capitalize">{book.subject}</span>
                          </div>
                          <h3 className="font-bold text-white mb-1">{book.title}</h3>
                          <p className="text-[#8892B0] text-xs mb-3">{book.description || `${book.grade}-sinf darsligi`}</p>
                          <div className="flex items-center gap-2 text-[#F5A623] text-sm font-medium">
                            O'rganish <ChevronRight size={14} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Parent yuklagan darslar */}
                {lessons.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-[#FF5733]/20 rounded-lg flex items-center justify-center text-[#FF5733] text-xs">📄</span>
                      Ota-ona yuklagan darslar
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {lessons.map((lesson: any) => (
                        <motion.div key={lesson._id} whileHover={{ y: -2 }}
                          className={`bg-[#112240] rounded-2xl p-6 border cursor-pointer transition-all ${selectedSource?.data?._id === lesson._id ? 'border-[#FF5733]/50' : 'border-white/5 hover:border-[#FF5733]/30'}`}
                          onClick={() => openSource('lesson', lesson)}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-12 h-12 rounded-xl bg-[#FF5733]/10 flex items-center justify-center text-2xl">
                              {SUBJECT_EMOJI[lesson.subject] || '📄'}
                            </div>
                            <span className="text-xs bg-[#FF5733]/10 text-[#FF5733] px-2 py-1 rounded-lg capitalize">{lesson.subject}</span>
                          </div>
                          <h3 className="font-bold text-white mb-1">{lesson.title}</h3>
                          <p className="text-[#8892B0] text-xs mb-3">{lesson.description || 'Ota-ona tomonidan yuklangan'}</p>
                          <div className="flex items-center gap-2 text-[#FF5733] text-sm font-medium">
                            O'rganish <ChevronRight size={14} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {books.length === 0 && lessons.length === 0 && (
                  <div className="bg-[#112240] rounded-2xl p-12 text-center border border-white/5">
                    <BookOpen size={48} className="text-[#8892B0] mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Hozircha dars yo'q</h3>
                    <p className="text-[#8892B0]">Ota-onangizdan dars yuklashni so'rang</p>
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* ── AI TUTOR ── */}
          {tab === 'learn' && selectedSource && (
            <div className="flex flex-col h-full">
              <div className="p-5 border-b border-white/5 bg-[#112240]/50 flex items-center justify-between shrink-0">
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold">{selectedSource.data.title}</h2>
                  <p className="text-[#8892B0] text-sm capitalize">{selectedSource.data.subject} · {selectedSource.type === 'book' ? 'Darslik' : 'Dars'}</p>
                </div>
                <button onClick={startQuiz}
                  className="flex items-center gap-2 bg-[#F5A623] hover:bg-[#FF5733] text-[#0A1628] font-bold px-4 py-2 rounded-xl text-sm transition-colors">
                  <Zap size={16} /> Quiz boshlash
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {messages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'ai' && (
                        <div className="w-8 h-8 rounded-full bg-[#F5A623]/20 flex items-center justify-center text-[#F5A623] mr-3 shrink-0 mt-1">
                          <Brain size={16} />
                        </div>
                      )}
                      <div className={`max-w-lg rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                        msg.role === 'user' ? 'bg-[#F5A623] text-[#0A1628] font-medium' : 'bg-[#112240] text-white border border-white/5'
                      }`}>
                        {msg.text.split('**').map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {chatLoading && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F5A623]/20 flex items-center justify-center text-[#F5A623]"><Brain size={16} /></div>
                    <div className="bg-[#112240] rounded-2xl px-5 py-3 border border-white/5">
                      <div className="flex gap-1">
                        {[0,1,2].map(i => (
                          <motion.div key={i} animate={{ y: [0,-5,0] }} transition={{ repeat: Infinity, delay: i*0.15, duration: 0.6 }}
                            className="w-2 h-2 bg-[#F5A623] rounded-full" />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="px-6 pb-2 shrink-0">
                <div className="flex gap-2 flex-wrap">
                  {['Boshidan tushuntir', 'Misol keltir', 'Asosiy fikrlar', 'Soddaroq ayt'].map(q => (
                    <button key={q} onClick={() => setChatInput(q)}
                      className="text-xs bg-white/5 hover:bg-[#F5A623]/10 hover:text-[#F5A623] border border-white/10 hover:border-[#F5A623]/30 text-[#8892B0] px-3 py-1.5 rounded-full transition-all">
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 border-t border-white/5 shrink-0">
                <div className="flex gap-3">
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="AI o'qituvchingizga savol bering..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-[#8892B0] focus:outline-none focus:border-[#F5A623] transition-colors text-sm" />
                  <button onClick={sendMessage} disabled={!chatInput.trim() || chatLoading}
                    className="w-12 h-12 bg-[#F5A623] hover:bg-[#FF5733] disabled:opacity-40 rounded-xl flex items-center justify-center transition-colors shrink-0">
                    <Send size={18} className="text-[#0A1628]" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── QUIZ ── */}
          {tab === 'quiz' && (
            <div className="p-8 max-w-2xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold">Quiz vaqti! ⚡</h1>
                    <p className="text-[#8892B0] text-sm">{selectedSource?.data?.title}</p>
                  </div>
                  {!quizSubmitted && (
                    <div className="flex items-center gap-2 text-[#8892B0] text-sm">
                      <Clock size={14} />
                      <span>{quizAnswers.filter(a => a !== -1).length}/{quiz.length}</span>
                    </div>
                  )}
                </div>

                {quizLoading && (
                  <div className="flex flex-col items-center py-16">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-10 h-10 border-2 border-[#F5A623] border-t-transparent rounded-full mb-4" />
                    <p className="text-[#8892B0]">Quiz tayyorlanmoqda...</p>
                  </div>
                )}

                {quizSubmitted && quizResult && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#112240] rounded-2xl p-8 border border-white/5 text-center mb-6">
                    <div className="text-6xl mb-4">{quizResult.score >= 70 ? '🎉' : quizResult.score >= 50 ? '📚' : '💪'}</div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl font-bold mb-2">{quizResult.score}%</h2>
                    <p className="text-[#8892B0] mb-2">{quizResult.correctAnswers}/{quizResult.totalQuestions} to'g'ri</p>
                    {quizResult.weakAreas?.length > 0 && (
                      <p className="text-red-400 text-sm mt-2">Qiyin bo'ldi: {quizResult.weakAreas.join(', ')}</p>
                    )}
                    <div className="flex gap-3 mt-6 justify-center">
                      <button onClick={startQuiz} className="bg-[#F5A623] text-[#0A1628] font-bold px-6 py-2.5 rounded-xl">Qayta urinish</button>
                      <button onClick={() => setTab('learn')} className="bg-white/10 text-white px-6 py-2.5 rounded-xl">Darsga qaytish</button>
                    </div>
                  </motion.div>
                )}

                {!quizLoading && quiz.length > 0 && (
                  <div className="space-y-5">
                    {quiz.map((q: any, qi: number) => (
                      <motion.div key={qi} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qi * 0.05 }}
                        className="bg-[#112240] rounded-2xl p-6 border border-white/5">
                        <div className="flex items-start gap-3 mb-4">
                          <span className="w-7 h-7 rounded-full bg-[#F5A623]/20 text-[#F5A623] text-xs font-bold flex items-center justify-center shrink-0">{qi+1}</span>
                          <p className="text-white font-medium leading-relaxed">{q.question}</p>
                        </div>
                        <div className="space-y-2 ml-10">
                          {q.options.map((opt: string, oi: number) => {
                            const isSelected = quizAnswers[qi] === oi;
                            const isCorrect = quizSubmitted && oi === q.correctIndex;
                            const isWrong = quizSubmitted && isSelected && oi !== q.correctIndex;
                            return (
                              <button key={oi} disabled={quizSubmitted}
                                onClick={() => { const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a); }}
                                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                                  isCorrect ? 'border-green-500 bg-green-500/10 text-green-300' :
                                  isWrong ? 'border-red-500 bg-red-500/10 text-red-300' :
                                  isSelected ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]' :
                                  'border-white/10 text-[#8892B0] hover:border-white/30 hover:text-white'
                                }`}>
                                {quizSubmitted && isCorrect && <CheckCircle size={14} className="text-green-400 shrink-0" />}
                                {quizSubmitted && isWrong && <XCircle size={14} className="text-red-400 shrink-0" />}
                                {!quizSubmitted && <div className={`w-4 h-4 rounded-full border shrink-0 ${isSelected ? 'border-[#F5A623] bg-[#F5A623]' : 'border-white/30'}`} />}
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {quizSubmitted && q.explanation && (
                          <div className="mt-3 ml-10 bg-white/5 rounded-xl px-4 py-3 text-sm text-[#8892B0]">💡 {q.explanation}</div>
                        )}
                      </motion.div>
                    ))}
                    {!quizSubmitted && (
                      <button onClick={submitQuiz} disabled={quizAnswers.includes(-1)}
                        className="w-full bg-[#F5A623] hover:bg-[#FF5733] disabled:opacity-40 text-[#0A1628] font-bold py-4 rounded-xl text-lg transition-colors">
                        Yuborish ({quizAnswers.filter(a => a !== -1).length}/{quiz.length})
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* ── PROGRESS ── */}
          {tab === 'progress' && (
            <div className="p-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl font-bold mb-1">Mening natijam</h1>
                <p className="text-[#8892B0] mb-8">O'sishingizni kuzating</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "O'rtacha ball", value: `${progressData?.avgScore || 0}%`, color: '#F5A623' },
                    { label: 'Quizlar', value: progressData?.totalQuizzes || 0, color: '#FF5733' },
                    { label: 'Prognoz', value: `${progressData?.forecast || 0}%`, color: '#10B981' },
                    { label: 'Fanlar', value: progressData?.subjectScores?.length || 0, color: '#8B5CF6' },
                  ].map((s, i) => (
                    <div key={i} className="bg-[#112240] rounded-2xl p-5 border border-white/5">
                      <p style={{ fontFamily: "'Playfair Display', serif", color: s.color }} className="text-3xl font-bold">{s.value}</p>
                      <p className="text-[#8892B0] text-xs mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {radarData.length > 0 && (
                    <div className="bg-[#112240] rounded-2xl p-6 border border-white/5">
                      <h3 className="font-bold text-white mb-4">Fan bo'yicha natijalar</h3>
                      <ResponsiveContainer width="100%" height={260}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#8892B0', fontSize: 11 }} />
                          <Radar name="Ball" dataKey="score" stroke="#F5A623" fill="#F5A623" fillOpacity={0.4} />
                          <Tooltip contentStyle={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {progressData?.weeklyData?.length > 0 && (
                    <div className="bg-[#112240] rounded-2xl p-6 border border-white/5">
                      <h3 className="font-bold text-white mb-4">Quiz tarixi</h3>
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={progressData.weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" tick={{ fill: '#8892B0', fontSize: 11 }} />
                          <YAxis domain={[0,100]} tick={{ fill: '#8892B0', fontSize: 11 }} />
                          <Tooltip contentStyle={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                            formatter={(v: any) => [`${v}%`, 'Ball']} />
                          <Line type="monotone" dataKey="score" stroke="#F5A623" strokeWidth={2} dot={{ fill: '#F5A623', r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Prognoz */}
                {progressData?.forecast !== undefined && (
                  <div className="mt-6 bg-[#112240] rounded-2xl p-6 border border-green-500/20">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp size={20} className="text-green-400" />
                      <h3 className="font-bold text-white">AI Prognoz</h3>
                    </div>
                    <p className="text-[#8892B0] text-sm">
                      Hozirgi o'sish sur'atida keyingi quiz natijangiz taxminan
                      <span className="text-green-400 font-bold text-lg mx-1">{progressData.forecast}%</span>
                      bo'lishi kutilmoqda.
                      {progressData.forecast >= 80 ? ' Zo\'r natija! 🎉' : progressData.forecast >= 60 ? ' Yaxshi sur\'at! 💪' : ' Ko\'proq mashq qiling! 📚'}
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
