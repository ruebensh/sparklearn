import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Brain, Trophy, Clock, LogOut,
  ChevronRight, Send, X, CheckCircle, XCircle,
  BarChart2, Zap, Star, WifiOff
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, Legend
} from 'recharts';

const API = async (url: string, opts: RequestInit = {}) => {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(url, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
  return res.json();
};

type Tab = 'lessons' | 'learn' | 'quiz' | 'progress';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [tab, setTab] = useState<Tab>('lessons');
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // AI Chat
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Quiz
  const [quiz, setQuiz] = useState<any[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);

  useEffect(() => { fetchLessons(); fetchProgress(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchLessons = async () => {
    const data = await API('/api/lessons');
    if (data.success) setLessons(data.data.lessons);
  };

  const fetchProgress = async () => {
    const data = await API('/api/progress');
    if (data.success) setProgressData(data.data);
  };

  const openLesson = (lesson: any) => {
    setSelectedLesson(lesson);
    setMessages([{
      role: 'ai',
      text: `Hi! 👋 I'm your AI teacher for **${lesson.title}**. Ask me anything about this lesson, or I can explain it from the beginning!`
    }]);
    setTab('learn');
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !selectedLesson) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);

    const token = localStorage.getItem('accessToken');
    const res = await fetch(`/api/lessons/${selectedLesson._id}/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ question: userMsg }),
    });
    const data = await res.json();
    setChatLoading(false);

    if (data.success) {
      setMessages(prev => [...prev, { role: 'ai', text: data.data.explanation }]);
    } else {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I had trouble answering. Please try again!' }]);
    }
  };

  const startQuiz = async () => {
    if (!selectedLesson) return;
    setQuizLoading(true);
    setQuizSubmitted(false);
    setQuizResult(null);
    setQuizAnswers([]);

    const token = localStorage.getItem('accessToken');
    const res = await fetch(`/api/lessons/${selectedLesson._id}/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ level: user.currentLevel || 'beginner', count: 5 }),
    });
    const data = await res.json();
    setQuizLoading(false);

    if (data.success) {
      setQuiz(data.data.questions);
      setQuizAnswers(new Array(data.data.questions.length).fill(-1));
      setQuizStartTime(new Date());
      setTab('quiz');
    }
  };

  const submitQuiz = async () => {
    if (quizAnswers.includes(-1)) return;
    setLoading(true);
    const timeSpent = quizStartTime
      ? Math.round((new Date().getTime() - quizStartTime.getTime()) / 60000)
      : 0;

    const token = localStorage.getItem('accessToken');
    const res = await fetch(`/api/lessons/${selectedLesson._id}/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ answers: quizAnswers, questions: quiz, level: user.currentLevel || 'beginner', timeSpentMinutes: timeSpent }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setQuizResult(data.data);
      setQuizSubmitted(true);
      fetchProgress();
      // Update local user level
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.currentLevel = data.data.nextLevel;
      localStorage.setItem('user', JSON.stringify(storedUser));
    }
  };

  const logout = () => { localStorage.clear(); navigate('/auth'); };

  const radarData = progressData ? [
    { subject: 'Math', score: progressData.skillSummary?.math || 0 },
    { subject: 'Literacy', score: progressData.skillSummary?.literacy || 0 },
    { subject: 'Science', score: progressData.skillSummary?.science || 0 },
    { subject: 'Language', score: progressData.skillSummary?.language || 0 },
    { subject: 'Life Skills', score: progressData.skillSummary?.['life-skills'] || 0 },
  ] : [];

  const levelColor = { beginner: '#10B981', intermediate: '#F5A623', advanced: '#FF5733' };
  const currentLevel = (user.currentLevel || 'beginner') as keyof typeof levelColor;

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap'); * { font-family: 'DM Sans', sans-serif; }`}</style>

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
                <span className="text-xs font-medium px-2 py-0.5 rounded-full capitalize"
                  style={{ background: `${levelColor[currentLevel]}20`, color: levelColor[currentLevel] }}>
                  {currentLevel}
                </span>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {[
              { id: 'lessons', icon: BookOpen, label: 'My Lessons' },
              { id: 'learn', icon: Brain, label: 'AI Tutor', disabled: !selectedLesson },
              { id: 'quiz', icon: Zap, label: 'Quiz', disabled: !selectedLesson },
              { id: 'progress', icon: BarChart2, label: 'My Progress' },
            ].map((item) => (
              <button key={item.id}
                onClick={() => !item.disabled && setTab(item.id as Tab)}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  item.disabled ? 'opacity-30 cursor-not-allowed text-[#8892B0]' :
                  tab === item.id ? 'bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20' :
                  'text-[#8892B0] hover:text-white hover:bg-white/5'
                }`}>
                <item.icon size={18} />
                {item.label}
                {item.id === 'learn' && !selectedLesson && (
                  <span className="ml-auto text-xs bg-white/5 px-2 py-0.5 rounded-full">Select lesson</span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 space-y-2 border-t border-white/5">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#8892B0]">
              <WifiOff size={12} />
              <span>Offline ready</span>
            </div>
            <button onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#8892B0] hover:text-[#FF5733] hover:bg-[#FF5733]/10 transition-all">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">

          {/* ── LESSONS ── */}
          {tab === 'lessons' && (
            <div className="p-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl font-bold mb-1">
                  Hello, {user.name || user.username}! 👋
                </h1>
                <p className="text-[#8892B0] mb-8">Pick a lesson to start learning with your AI tutor.</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { icon: BookOpen, label: 'Lessons', value: lessons.length, color: '#F5A623' },
                    { icon: Trophy, label: 'Avg Score', value: `${progressData?.avgScore || 0}%`, color: '#FF5733' },
                    { icon: Star, label: 'Quizzes', value: progressData?.totalQuizzes || 0, color: '#10B981' },
                  ].map((s, i) => (
                    <div key={i} className="bg-[#112240] rounded-2xl p-5 border border-white/5">
                      <s.icon size={18} style={{ color: s.color }} className="mb-2" />
                      <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold">{s.value}</p>
                      <p className="text-[#8892B0] text-xs mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                {lessons.length === 0 ? (
                  <div className="bg-[#112240] rounded-2xl p-12 text-center border border-white/5">
                    <BookOpen size={48} className="text-[#8892B0] mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No lessons yet</h3>
                    <p className="text-[#8892B0]">Ask your parent to upload lessons for you</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {lessons.map((lesson: any) => (
                      <motion.div key={lesson._id} whileHover={{ y: -2 }}
                        className={`bg-[#112240] rounded-2xl p-6 border cursor-pointer transition-all ${
                          selectedLesson?._id === lesson._id ? 'border-[#F5A623]/50' : 'border-white/5 hover:border-[#F5A623]/30'
                        }`}
                        onClick={() => openLesson(lesson)}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-[#F5A623]/10 flex items-center justify-center text-xl">
                            {{ math: '🔢', literacy: '📖', science: '🔬', language: '🗣️', 'life-skills': '🌱', other: '📚' }[lesson.subject] || '📚'}
                          </div>
                          <div className="flex gap-2">
                            <span className="text-xs bg-[#F5A623]/10 text-[#F5A623] px-2 py-1 rounded-lg capitalize">{lesson.subject}</span>
                            <span className="text-xs bg-white/5 text-[#8892B0] px-2 py-1 rounded-lg capitalize">{lesson.level}</span>
                          </div>
                        </div>
                        <h3 className="font-bold text-white text-lg mb-1">{lesson.title}</h3>
                        <p className="text-[#8892B0] text-sm mb-4 line-clamp-2">{lesson.description || 'Start learning with AI assistance'}</p>
                        <div className="flex items-center gap-2 text-[#F5A623] text-sm font-medium">
                          Start Learning <ChevronRight size={16} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* ── AI TUTOR (LEARN) ── */}
          {tab === 'learn' && selectedLesson && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-white/5 bg-[#112240]/50 flex items-center justify-between shrink-0">
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold">{selectedLesson.title}</h2>
                  <p className="text-[#8892B0] text-sm capitalize">{selectedLesson.subject} · {selectedLesson.level}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={startQuiz}
                    className="flex items-center gap-2 bg-[#F5A623] hover:bg-[#FF5733] text-[#0A1628] font-bold px-4 py-2 rounded-xl text-sm transition-colors">
                    <Zap size={16} /> Take Quiz
                  </button>
                  <button onClick={() => setTab('lessons')} className="text-[#8892B0] hover:text-white"><X size={20} /></button>
                </div>
              </div>

              {/* Chat messages */}
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
                        msg.role === 'user'
                          ? 'bg-[#F5A623] text-[#0A1628] font-medium'
                          : 'bg-[#112240] text-white border border-white/5'
                      }`}>
                        {msg.text.split('**').map((part, j) =>
                          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {chatLoading && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F5A623]/20 flex items-center justify-center text-[#F5A623]"><Brain size={16} /></div>
                    <div className="bg-[#112240] rounded-2xl px-5 py-3 border border-white/5">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, delay: i * 0.15, duration: 0.6 }}
                            className="w-2 h-2 bg-[#F5A623] rounded-full" />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Suggested questions */}
              <div className="px-6 pb-2 shrink-0">
                <div className="flex gap-2 flex-wrap">
                  {['Explain from the beginning', 'Give me an example', 'What are the key points?', 'Make it simpler'].map((q) => (
                    <button key={q} onClick={() => { setChatInput(q); }}
                      className="text-xs bg-white/5 hover:bg-[#F5A623]/10 hover:text-[#F5A623] border border-white/10 hover:border-[#F5A623]/30 text-[#8892B0] px-3 py-1.5 rounded-full transition-all">
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-6 border-t border-white/5 shrink-0">
                <div className="flex gap-3">
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Ask your AI tutor anything..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-[#8892B0] focus:outline-none focus:border-[#F5A623] transition-colors text-sm"
                  />
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
                    <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold">Quiz Time!</h1>
                    <p className="text-[#8892B0] text-sm">{selectedLesson?.title}</p>
                  </div>
                  {!quizSubmitted && (
                    <div className="flex items-center gap-2 text-[#8892B0] text-sm">
                      <Clock size={14} />
                      <span>{quizAnswers.filter(a => a !== -1).length}/{quiz.length} answered</span>
                    </div>
                  )}
                </div>

                {quizLoading && (
                  <div className="flex flex-col items-center py-16">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-10 h-10 border-2 border-[#F5A623] border-t-transparent rounded-full mb-4" />
                    <p className="text-[#8892B0]">Generating quiz questions...</p>
                  </div>
                )}

                {/* Quiz result */}
                {quizSubmitted && quizResult && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#112240] rounded-2xl p-8 border border-white/5 text-center mb-6">
                    <div className="text-6xl mb-4">{quizResult.score >= 70 ? '🎉' : '📚'}</div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl font-bold mb-2">{quizResult.score}%</h2>
                    <p className="text-[#8892B0] mb-4">{quizResult.correct}/{quizResult.total} correct</p>
                    <p className="text-white mb-4">{quizResult.message}</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[#8892B0] text-sm">Next level:</span>
                      <span className="font-bold capitalize" style={{ color: (levelColor as any)[quizResult.nextLevel] }}>{quizResult.nextLevel}</span>
                    </div>
                    <div className="flex gap-3 mt-6 justify-center">
                      <button onClick={startQuiz} className="bg-[#F5A623] text-[#0A1628] font-bold px-6 py-2.5 rounded-xl">Try Again</button>
                      <button onClick={() => setTab('learn')} className="bg-white/10 text-white px-6 py-2.5 rounded-xl">Back to Lesson</button>
                    </div>
                  </motion.div>
                )}

                {/* Questions */}
                {!quizLoading && quiz.length > 0 && (
                  <div className="space-y-6">
                    {quiz.map((q: any, qi: number) => (
                      <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qi * 0.05 }}
                        className="bg-[#112240] rounded-2xl p-6 border border-white/5">
                        <div className="flex items-start gap-3 mb-4">
                          <span className="w-7 h-7 rounded-full bg-[#F5A623]/20 text-[#F5A623] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {qi + 1}
                          </span>
                          <p className="text-white font-medium leading-relaxed">{q.question}</p>
                        </div>

                        <div className="space-y-2 ml-10">
                          {q.options.map((opt: string, oi: number) => {
                            const isSelected = quizAnswers[qi] === oi;
                            const isCorrect = quizSubmitted && oi === q.correctIndex;
                            const isWrong = quizSubmitted && isSelected && oi !== q.correctIndex;

                            return (
                              <button key={oi} disabled={quizSubmitted}
                                onClick={() => {
                                  if (quizSubmitted) return;
                                  const newAnswers = [...quizAnswers];
                                  newAnswers[qi] = oi;
                                  setQuizAnswers(newAnswers);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                                  isCorrect ? 'border-green-500 bg-green-500/10 text-green-300' :
                                  isWrong ? 'border-red-500 bg-red-500/10 text-red-300' :
                                  isSelected ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]' :
                                  'border-white/10 text-[#8892B0] hover:border-white/30 hover:text-white'
                                }`}>
                                {quizSubmitted && isCorrect && <CheckCircle size={14} className="text-green-400 shrink-0" />}
                                {quizSubmitted && isWrong && <XCircle size={14} className="text-red-400 shrink-0" />}
                                {!quizSubmitted && (
                                  <div className={`w-4 h-4 rounded-full border shrink-0 ${isSelected ? 'border-[#F5A623] bg-[#F5A623]' : 'border-white/30'}`} />
                                )}
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && q.explanation && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="mt-3 ml-10 bg-white/5 rounded-xl px-4 py-3 text-sm text-[#8892B0]">
                            💡 {q.explanation}
                          </motion.div>
                        )}
                      </motion.div>
                    ))}

                    {!quizSubmitted && (
                      <button onClick={submitQuiz} disabled={quizAnswers.includes(-1) || loading}
                        className="w-full bg-[#F5A623] hover:bg-[#FF5733] disabled:opacity-40 text-[#0A1628] font-bold py-4 rounded-xl transition-colors text-lg">
                        {loading ? 'Submitting...' : `Submit Quiz (${quizAnswers.filter(a => a !== -1).length}/${quiz.length})`}
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
                <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl font-bold mb-1">My Progress</h1>
                <p className="text-[#8892B0] mb-8">Track your learning journey and skill growth</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Radar */}
                  <div className="bg-[#112240] rounded-2xl p-6 border border-white/5">
                    <h3 className="font-bold text-white mb-1">My Skills</h3>
                    <p className="text-[#8892B0] text-xs mb-4">Your performance across all subjects</p>
                    <ResponsiveContainer width="100%" height={260}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#8892B0', fontSize: 12 }} />
                        <Radar name="Score" dataKey="score" stroke="#F5A623" fill="#F5A623" fillOpacity={0.4} />
                        <Tooltip contentStyle={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Stats */}
                  <div className="space-y-4">
                    <div className="bg-[#112240] rounded-2xl p-6 border border-white/5">
                      <h3 className="font-bold text-white mb-4">Learning Summary</h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Current Level', value: user.currentLevel || 'Beginner', color: levelColor[currentLevel] },
                          { label: 'Avg Quiz Score', value: `${progressData?.avgScore || 0}%`, color: '#F5A623' },
                          { label: 'Quizzes Taken', value: progressData?.totalQuizzes || 0, color: '#10B981' },
                          { label: 'Lessons Available', value: lessons.length, color: '#8B5CF6' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                            <span className="text-[#8892B0] text-sm">{item.label}</span>
                            <span className="font-bold capitalize" style={{ color: item.color }}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#112240] rounded-2xl p-6 border border-[#F5A623]/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy size={18} className="text-[#F5A623]" />
                        <h3 className="font-bold text-white">Keep Going!</h3>
                      </div>
                      <p className="text-[#8892B0] text-sm">
                        {progressData?.avgScore >= 80
                          ? "You're doing excellent! Try advanced level quizzes."
                          : progressData?.avgScore >= 60
                          ? "Good progress! Keep practicing to improve your scores."
                          : "Every lesson makes you stronger. Don't give up!"}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}