/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Shield, 
  Video, 
  Mic, 
  Star, 
  MessageSquare, 
  Settings, 
  Upload, 
  ChevronRight, 
  Play, 
  Pause,
  Volume2,
  Crosshair,
  Map,
  Zap,
  CheckCircle2,
  ArrowLeft,
  Wallet,
  History,
  Share2,
  Gift,
  CreditCard,
  Target,
  FileText,
  X,
  QrCode,
  Copy,
  ExternalLink,
  Store,
  LayoutGrid,
  TrendingUp,
  Award,
  LifeBuoy,
  LogOut,
  Camera,
  Music,
  Save,
  Clock,
  AlertCircle,
  Activity,
  Calendar,
  Bell,
  Heart,
  Maximize,
  Mail,
  MailOpen,
  Inbox
} from 'lucide-react';

// --- Types ---
interface Order {
  id: string;
  status: '待支付' | '进行中' | '已完成';
  companionId: number;
  companionName: string;
  price: number;
  date: string;
  time?: string;
  duration?: number; // in hours
}

interface Companion {
  id: number;
  name: string;
  avatar: string;
  tags: string;
  rating: number;
  price: number;
  description: string;
  video_url: string;
  audio_url: string;
  role: string;
}

// --- Components ---

const Badge = ({ children, className = "" }: { children: React.ReactNode, className?: string, key?: React.Key }) => (
  <span className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 rounded ${className}`}>
    {children}
  </span>
);

const TacticalCard = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void, key?: React.Key }) => (
  <div 
    onClick={onClick}
    className={`relative overflow-hidden bg-white border border-black/5 rounded-xl shadow-sm group transition-all duration-300 hover:border-emerald-500/30 ${className}`}
  >
    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/0 group-hover:bg-emerald-500/50 transition-all duration-300" />
    {children}
  </div>
);

const MiniAudioAvatar = ({ src, audioUrl, onClick }: { src: string, audioUrl: string, onClick: () => void }) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playing) {
      audioRef.current?.pause();
    } else {
      document.querySelectorAll('audio').forEach(a => {
        a.pause();
        a.currentTime = 0;
      });
      audioRef.current?.play();
    }
  };

  return (
    <div 
      className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-black/5 shadow-sm group cursor-pointer"
      onClick={onClick}
    >
      <img src={src} className="w-full h-full object-cover" alt="avatar" referrerPolicy="no-referrer" />
      <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/40" />
      <button 
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all ${playing ? 'bg-emerald-500/90 scale-110 shadow-lg shadow-emerald-500/40' : 'bg-black/40 hover:bg-black/60'}`}>
          {playing ? <Pause size={14} className="text-white" fill="currentColor" /> : <Play size={14} className="text-white ml-0.5" fill="currentColor" />}
        </div>
      </button>
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        onPlay={() => setPlaying(true)} 
        onPause={() => setPlaying(false)} 
        onEnded={() => setPlaying(false)} 
      />
    </div>
  );
};

const AudioPlayer = ({ url }: { url: string }) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggle = () => {
    if (playing) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="flex items-center gap-3 bg-black/5 p-3 rounded-lg border border-black/5">
      <button 
        onClick={toggle}
        className="w-10 h-10 flex items-center justify-center bg-emerald-500 rounded-full text-white hover:scale-105 transition-transform shadow-sm"
      >
        {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="ml-1" fill="currentColor" />}
      </button>
      <div className="flex-1">
        <div className="text-[10px] font-mono text-black/40 uppercase mb-1">语音介绍</div>
        <div className="h-1 bg-black/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-emerald-500"
            animate={{ width: playing ? "100%" : "0%" }}
            transition={{ duration: 10, ease: "linear" }}
          />
        </div>
      </div>
      <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} />
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [identitySelected, setIdentitySelected] = useState<boolean>(false);
  const [role, setRole] = useState<'user' | 'companion'>('user');
  const [view, setView] = useState<'home' | 'chat' | 'service' | 'profile'>('home');
  const [previousView, setPreviousView] = useState<'home' | 'chat' | 'service' | 'profile' | null>(null);
  const [subView, setSubView] = useState<string | null>(null);
  const [companionStatus, setCompanionStatus] = useState<'idle' | 'pending' | 'approved'>('idle');
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [followedCompanions, setFollowedCompanions] = useState<number[]>([]);
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [activeCategory, setActiveCategory] = useState('全部');
  const categories = ['全部', '狙击手', '突击手', '医疗兵', '工程兵'];
  const filteredCompanions = companions.filter(c => activeCategory === '全部' || c.tags.includes(activeCategory));

  // Chat State
  const [activeChat, setActiveChat] = useState<Companion | null>(null);

  // Companion Edit State
  const [editData, setEditData] = useState<Partial<Companion>>({});

  // Fullscreen Image State
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Order Filter State
  const [orderFilter, setOrderFilter] = useState('全部');
  const [orders, setOrders] = useState<Order[]>([
    { id: "ORD-2024-001", status: "已完成", companionId: 1, companionName: "干员 凯尔", price: 150, date: "2024-02-22", time: "10:00", duration: 2 },
    { id: "ORD-2024-002", status: "进行中", companionId: 2, companionName: "干员 露娜", price: 200, date: "2024-02-23", time: "14:00", duration: 1 },
    { id: "ORD-2024-003", status: "待支付", companionId: 3, companionName: "干员 幽灵", price: 120, date: "2024-02-23", time: "16:30", duration: 1.5 },
  ]);

  // Pomodoro Timer State
  const [pomodoroTime, setPomodoroTime] = useState(45 * 60); // 45 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setPomodoroTime(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchCompanions();
    // Check local storage for identity
    const savedRole = localStorage.getItem('delta_role');
    const savedStatus = localStorage.getItem('delta_companion_status');
    if (savedRole) {
      setRole(savedRole as 'user' | 'companion');
      setIdentitySelected(true);
    }
    if (savedStatus) {
      setCompanionStatus(savedStatus as 'idle' | 'pending' | 'approved');
    }
    const savedFollows = localStorage.getItem('delta_follows');
    if (savedFollows) {
      setFollowedCompanions(JSON.parse(savedFollows));
    }
  }, []);

  const toggleFollow = (id: number) => {
    setFollowedCompanions(prev => {
      const newFollows = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('delta_follows', JSON.stringify(newFollows));
      return newFollows;
    });
  };

  const selectIdentity = (r: 'user' | 'companion') => {
    setRole(r);
    setIdentitySelected(true);
    localStorage.setItem('delta_role', r);
    if (r === 'companion' && companionStatus === 'idle') {
      setCompanionStatus('pending');
      localStorage.setItem('delta_companion_status', 'pending');
    }
  };

  const fetchCompanions = async () => {
    try {
      const res = await fetch('/api/companions');
      const data = await res.json();
      setCompanions(data);
      if (data.length > 0) {
        setEditData(data[0]); 
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editData.id) return;
    try {
      const res = await fetch(`/api/companions/${editData.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        alert("战术资料已更新，审核中");
        if (companionStatus !== 'approved') {
          setCompanionStatus('pending');
          localStorage.setItem('delta_companion_status', 'pending');
        }
        fetchCompanions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
      <div className="text-emerald-600 font-mono animate-pulse">正在初始化战术链接...</div>
    </div>
  );

  // --- Identity Selection Screen ---
  if (!identitySelected) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6 text-[#1D1D1F]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-500 mx-auto flex items-center justify-center rounded-2xl shadow-lg shadow-emerald-500/20">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">三角洲行动</h1>
            <p className="text-sm text-black/40 font-mono">请选择您的作战身份</p>
          </div>

          <div className="grid gap-4">
            <TacticalCard 
              onClick={() => selectIdentity('user')}
              className="p-6 cursor-pointer hover:bg-emerald-500/5 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center border border-black/5">
                  <User size={24} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg uppercase tracking-tight">雇主 / 玩家</h3>
                  <p className="text-xs text-black/40">寻找精英干员提供战术支援。</p>
                </div>
              </div>
            </TacticalCard>

            <TacticalCard 
              onClick={() => selectIdentity('companion')}
              className="p-6 cursor-pointer hover:bg-emerald-500/5 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center border border-black/5">
                  <Crosshair size={24} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg uppercase tracking-tight">干员 / 陪玩</h3>
                  <p className="text-xs text-black/40">提供专业的游戏服务与战术指导。</p>
                </div>
              </div>
            </TacticalCard>
          </div>

          <p className="text-[10px] text-center text-black/20 font-mono uppercase tracking-widest">
            身份可在设置中随时切换
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col">
      <main className="flex-1 w-full max-w-md mx-auto relative flex flex-col overflow-hidden pt-4">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col overflow-hidden p-4"
            >
              {role === 'user' ? (
                <>
                  {/* Header Info */}
                  <div className="shrink-0 flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-500 flex items-center justify-center rounded-lg shadow-sm">
                        <Shield size={20} className="text-white" />
                      </div>
                      <div>
                        <h1 className="text-sm font-black tracking-tighter uppercase italic">三角洲链接</h1>
                        <div className="text-[10px] font-mono text-emerald-600/60 leading-none">V2.4.0-稳定版</div>
                      </div>
                    </div>
                  </div>

                  {/* Hero Section */}
                  <section className="shrink-0 relative h-40 rounded-2xl overflow-hidden mb-6 shadow-sm">
                    <img 
                      src="https://picsum.photos/seed/delta/800/400" 
                      className="w-full h-full object-cover opacity-80"
                      alt="Delta Force"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <Badge className="mb-2">推荐任务</Badge>
                      <h2 className="text-2xl font-black tracking-tighter uppercase italic text-black">零点行动</h2>
                      <p className="text-xs text-black/60 font-mono">与精英干员建立联系，获取战术支援。</p>
                    </div>
                  </section>

                  {/* Filters */}
                  <div 
                    className="shrink-0 flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x"
                    style={{ justifyContent: 'safe center' }}
                  >
                    {categories.map(tag => (
                      <button 
                        key={tag} 
                        onClick={() => setActiveCategory(tag)}
                        className={`snap-center flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                          activeCategory === tag 
                            ? 'bg-emerald-500 text-white border-transparent shadow-emerald-500/30' 
                            : 'bg-white text-black/60 border border-black/5 hover:bg-black/5'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* Companion List */}
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="shrink-0 flex items-center justify-between mb-4">
                      <h3 className="text-xs font-mono text-black/40 uppercase tracking-widest">活跃干员</h3>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-600">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        1,240 在线
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pb-24">
                      {filteredCompanions.map(c => (
                        <div 
                          key={c.id} 
                          onClick={() => setSelectedCompanion(c)} 
                          className="flex items-center p-3 bg-white rounded-2xl border border-black/5 shadow-sm active:scale-[0.98] transition-transform cursor-pointer gap-4"
                        >
                          <MiniAudioAvatar src={c.avatar} audioUrl={c.audio_url} onClick={() => setSelectedCompanion(c)} />
                          
                          <div className="flex-1 min-w-0 py-1">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-sm tracking-tight truncate pr-2 text-black">{c.name}</h4>
                              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">
                                <Star size={10} fill="currentColor" />
                                {c.rating}
                              </div>
                            </div>
                            <div className="text-[10px] text-black/40 truncate mb-2">{c.tags.split(',').join(' · ')}</div>
                            <div className="flex items-center justify-between mt-auto">
                              <div className="text-xs font-mono font-bold text-black">
                                <span className="text-emerald-600 text-[10px] mr-0.5">¥</span>{c.price}
                                <span className="text-[9px] text-black/30 font-sans ml-1">/小时</span>
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedCompanion(c); }}
                                className="w-7 h-7 bg-black/5 rounded-full flex items-center justify-center text-black/40 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              >
                                <ChevronRight size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-24">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-500 flex items-center justify-center rounded-lg shadow-sm">
                        <Shield size={20} className="text-white" />
                      </div>
                      <div>
                        <h1 className="text-sm font-black tracking-tighter uppercase italic">三角洲链接</h1>
                        <div className="text-[10px] font-mono text-emerald-600/60 leading-none">干员控制台</div>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        执勤中
                      </div>
                    </Badge>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <TacticalCard className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] font-mono uppercase opacity-80">今日收益</div>
                        <Wallet size={16} className="opacity-80" />
                      </div>
                      <div className="text-2xl font-black tracking-tight">¥450.00</div>
                      <div className="text-[10px] opacity-80 mt-1">+12% 较昨日</div>
                    </TacticalCard>
                    <TacticalCard 
                      className="p-4 bg-white border-black/5 shadow-sm active:scale-95 transition-transform cursor-pointer"
                      onClick={() => {
                        setPreviousView(view);
                        setView('service');
                        setOrderFilter('进行中');
                        setSubView(null);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] font-mono text-black/40 uppercase">今日订单</div>
                        <Target size={16} className="text-blue-500" />
                      </div>
                      <div className="text-2xl font-black text-black">{orders.length}</div>
                      <div className="text-[10px] text-black/40 mt-1">{orders.filter(o => o.status === '进行中').length} 个进行中</div>
                    </TacticalCard>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { id: 'schedule', icon: Calendar, label: "日程", color: "text-purple-500", bg: "bg-purple-50" },
                      { id: 'data', icon: Activity, label: "数据", color: "text-orange-500", bg: "bg-orange-50" },
                      { id: 'messages', icon: MessageSquare, label: "消息", color: "text-blue-500", bg: "bg-blue-50", badge: 4 },
                      { id: 'notifications', icon: Bell, label: "通知", color: "text-pink-500", bg: "bg-pink-50", badge: 1 },
                    ].map((action, i) => (
                      <button 
                        key={i} 
                        onClick={() => {
                          if (action.id === 'messages') {
                            setView('chat');
                          } else {
                            setPreviousView(view);
                            setView('profile');
                            setSubView(action.id);
                          }
                        }}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div className={`relative w-12 h-12 ${action.bg} rounded-xl flex items-center justify-center shadow-sm border border-black/5 group-active:scale-95 transition-transform`}>
                          <action.icon size={20} className={action.color} />
                          {action.badge && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-white">
                              {action.badge}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-black/60 uppercase">{action.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Active Tasks */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-mono text-black/40 uppercase tracking-[0.2em] pl-1">进行中的任务</h3>
                      <button className="text-[10px] text-emerald-600 font-bold hover:underline">查看全部</button>
                    </div>
                    
                    <div className="space-y-3">
                      {orders.filter(o => o.status === '进行中').length > 0 ? (
                        orders.filter(o => o.status === '进行中').map(task => (
                          <TacticalCard key={task.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <img src={`https://picsum.photos/seed/${task.companionId}/100/100`} className="w-10 h-10 rounded-full object-cover border border-black/5" alt="User" referrerPolicy="no-referrer" />
                                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white bg-emerald-500`} />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-black">{task.companionName}</div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[9px] px-1.5 py-0.5 bg-black/5 text-black/60 rounded uppercase">订单编号: {task.id}</span>
                                    <span className="text-[10px] text-emerald-600 font-mono">
                                      {Math.floor(pomodoroTime / 60).toString().padStart(2, '0')}:
                                      {(pomodoroTime % 60).toString().padStart(2, '0')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  const comp = companions.find(c => c.id === task.companionId);
                                  if (comp) {
                                    setActiveChat(comp);
                                  } else {
                                    setActiveChat({
                                      id: task.companionId,
                                      name: task.companionName,
                                      avatar: `https://picsum.photos/seed/${task.companionId}/100/100`,
                                      tags: [],
                                      price: task.price,
                                      rating: 5,
                                      orders: 1,
                                      status: 'online',
                                      description: ''
                                    });
                                  }
                                }}
                                className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                              >
                                <MessageSquare size={16} />
                              </button>
                            </div>
                          </TacticalCard>
                        ))
                      ) : (
                        <div className="text-center py-6 bg-white rounded-2xl border border-black/5 shadow-sm">
                          <p className="text-xs text-black/40">暂无进行中的任务</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Reviews */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-mono text-black/40 uppercase tracking-[0.2em] pl-1">最新评价</h3>
                      <button 
                        onClick={() => {
                          setPreviousView(view);
                          setView('profile');
                          setSubView('reviews');
                        }}
                        className="text-[10px] text-emerald-600 font-bold hover:underline"
                      >
                        查看更多评价
                      </button>
                    </div>
                    <TacticalCard className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-black/5 rounded-full flex items-center justify-center shrink-0">
                          <User size={14} className="text-black/40" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-black">匿名雇主</span>
                            <div className="flex text-emerald-500">
                              {[1,2,3,4,5].map(star => <Star key={star} size={10} fill="currentColor" />)}
                            </div>
                          </div>
                          <p className="text-xs text-black/60 leading-relaxed">
                            技术非常好，沟通也很顺畅，下次还会再点！
                          </p>
                          <div className="text-[9px] text-black/30 font-mono mt-2">2 小时前</div>
                        </div>
                      </div>
                    </TacticalCard>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {view === 'chat' && (
            <motion.div 
              key="chat-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col overflow-hidden p-4"
            >
              <h2 className="shrink-0 text-xl font-black italic uppercase tracking-tighter mb-6 text-black">战术通讯</h2>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-24">
                {companions.map(c => (
                  <TacticalCard key={c.id} className="p-4 cursor-pointer" onClick={() => setActiveChat(c)}>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={c.avatar} className="w-12 h-12 rounded-full object-cover shadow-sm" alt={c.name} referrerPolicy="no-referrer" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-sm text-black">{c.name}</h4>
                          <span className="text-[10px] text-black/20 font-mono">下午 12:45</span>
                        </div>
                        <p className="text-xs text-black/40 truncate">收到，请等待撤离...</p>
                      </div>
                    </div>
                  </TacticalCard>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'service' && (
            <motion.div 
              key="service-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pb-24"
            >
              <div className="text-center space-y-2 mb-8">
                <div className="w-16 h-16 bg-black/5 mx-auto flex items-center justify-center rounded-2xl border border-black/5">
                  <History size={32} className="text-emerald-500" />
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-black">全部订单</h2>
                <p className="text-xs text-black/40 font-mono uppercase tracking-widest">管理历史订单</p>
              </div>

              {/* Order Filters */}
              <div className="flex gap-2 p-1 bg-black/5 rounded-xl mb-6">
                {['全部', '进行中', '待支付', '已完成'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setOrderFilter(tab)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      orderFilter === tab 
                        ? 'bg-white text-black shadow-sm' 
                        : 'text-black/60 hover:text-black'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {orders.filter(order => orderFilter === '全部' || order.status === orderFilter).map((order, i) => (
                  <TacticalCard key={i} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-[10px] font-mono text-black/40 uppercase mb-1">订单编号: {order.id}</div>
                        <h4 className="font-bold text-black">{order.companionName}</h4>
                      </div>
                      <Badge className={order.status === '进行中' ? 'bg-emerald-500/10 text-emerald-600' : ''}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-end pt-3 border-t border-black/5">
                      <div className="text-[10px] text-black/40 font-mono uppercase">{order.date}</div>
                      <div className="text-lg font-black text-black">¥{order.price}</div>
                    </div>
                  </TacticalCard>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'profile' && !subView && (
            <motion.div 
              key="profile-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8 pb-24"
            >
              {role === 'companion' ? (
                <div className="space-y-8">
                  {/* Header & Profile Card */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-black italic uppercase tracking-tighter text-black">干员中心</h2>
                      <Badge className={companionStatus === 'pending' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : ''}>
                        状态: {companionStatus === 'pending' ? '审核中' : '活跃'}
                      </Badge>
                    </div>

                    {companionStatus === 'pending' && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-start gap-3"
                      >
                        <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={18} />
                        <div>
                          <div className="text-xs font-bold text-orange-800">资料审核中</div>
                          <div className="text-[10px] text-orange-700/70 mt-1 leading-relaxed">
                            您的干员资料正在接受指挥部审核。审核期间，您的店铺将暂时对雇主隐藏。预计审核时间：1-2个工作日。
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <TacticalCard className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={editData.avatar || "https://picsum.photos/seed/me/200/200"} 
                            className="w-20 h-20 rounded-2xl object-cover border border-black/5 shadow-sm" 
                            alt="Me"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-lg border-2 border-white">
                            {companionStatus === 'pending' ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-black">{editData.name}</h3>
                          <p className="text-xs text-black/40 font-mono">编号: #DX-9920-B</p>
                          <div className="flex gap-4 mt-2">
                            <div>
                              <div className="text-[10px] text-black/40 uppercase font-mono">评分</div>
                              <div className="text-emerald-600 font-bold text-sm">4.9</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-black/40 uppercase font-mono">订单</div>
                              <div className="font-bold text-black text-sm">142</div>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => { setPreviousView(view); setSubView('shop_setup'); }}
                          className="p-3 bg-black/5 rounded-xl text-black/40 hover:text-emerald-600 transition-colors"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </TacticalCard>
                  </div>

                  {/* Section: Shop Management */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-mono text-black/40 uppercase tracking-[0.2em] pl-1">店铺管理</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => { setPreviousView(view); setSubView('shop_setup'); }}
                        className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-black/5 shadow-sm active:scale-95 transition-transform"
                      >
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                          <Store size={20} />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-black">店铺设置</div>
                          <div className="text-[9px] text-black/40">修改资料与展示</div>
                        </div>
                      </button>
                      <button 
                        onClick={() => {
                          setPreviousView(view);
                          setOrderFilter('全部');
                          setView('service');
                          setSubView(null);
                        }}
                        className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-black/5 shadow-sm active:scale-95 transition-transform"
                      >
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                          <History size={20} />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-black">全部订单</div>
                          <div className="text-[9px] text-black/40">管理历史订单</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Section: Financial & Growth */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-mono text-black/40 uppercase tracking-[0.2em] pl-1">财务与成长</h3>
                    <div className="bg-white rounded-2xl border border-black/5 shadow-sm divide-y divide-black/5">
                      <button 
                        onClick={() => { setPreviousView(view); setSubView('wallet'); }}
                        className="w-full flex items-center justify-between p-4 active:bg-black/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Wallet size={18} className="text-orange-500" />
                          <span className="text-sm font-medium text-black">战术钱包</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-600">¥8,420.00</span>
                          <ChevronRight size={16} className="text-black/20" />
                        </div>
                      </button>
                      <button onClick={() => { setPreviousView(view); setSubView('data'); }} className="w-full flex items-center justify-between p-4 active:bg-black/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <TrendingUp size={18} className="text-purple-500" />
                          <span className="text-sm font-medium text-black">收益统计</span>
                        </div>
                        <ChevronRight size={16} className="text-black/20" />
                      </button>
                      <button className="w-full flex items-center justify-between p-4 active:bg-black/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <Award size={18} className="text-yellow-500" />
                          <span className="text-sm font-medium text-black">荣誉成就</span>
                        </div>
                        <ChevronRight size={16} className="text-black/20" />
                      </button>
                    </div>
                  </div>

                  {/* Section: Support */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-mono text-black/40 uppercase tracking-[0.2em] pl-1">其他服务</h3>
                    <div className="bg-white rounded-2xl border border-black/5 shadow-sm divide-y divide-black/5">
                      <button 
                        onClick={() => setView('service')}
                        className="w-full flex items-center justify-between p-4 active:bg-black/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <LifeBuoy size={18} className="text-blue-400" />
                          <span className="text-sm font-medium text-black">帮助与反馈</span>
                        </div>
                        <ChevronRight size={16} className="text-black/20" />
                      </button>
                      <button 
                        onClick={() => {
                          localStorage.removeItem('delta_role');
                          setIdentitySelected(false);
                        }}
                        className="w-full flex items-center justify-between p-4 active:bg-black/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <LogOut size={18} className="text-red-400" />
                          <span className="text-sm font-medium text-black">切换身份</span>
                        </div>
                        <ChevronRight size={16} className="text-black/20" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Header & Profile Card */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-black italic uppercase tracking-tighter text-black">个人中心</h2>
                      <Badge>已认证</Badge>
                    </div>
                    <TacticalCard className="p-6">
                      <div className="flex items-center gap-4">
                        <img 
                          src="https://picsum.photos/seed/user/100/100" 
                          className="w-20 h-20 rounded-full border border-black/5 shadow-sm" 
                          alt="User" 
                          referrerPolicy="no-referrer" 
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-black">幽灵协议</h3>
                          <p className="text-xs text-black/40 font-mono">加入时间: 2024</p>
                          <div className="flex gap-4 mt-2">
                            <div>
                              <div className="text-[10px] text-black/40 uppercase font-mono">等级</div>
                              <div className="text-emerald-600 font-bold text-sm">LV.12</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-black/40 uppercase font-mono">积分</div>
                              <div className="font-bold text-black text-sm">2,450</div>
                            </div>
                          </div>
                        </div>
                        <button className="p-3 bg-black/5 rounded-xl text-black/40 hover:text-emerald-600 transition-colors">
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </TacticalCard>
                  </div>

                  {/* Section: Task Management */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-mono text-black/40 uppercase tracking-[0.2em] pl-1">任务管理</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => {
                          setPreviousView(view);
                          setOrderFilter('全部');
                          setView('service');
                          setSubView(null);
                        }}
                        className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-black/5 shadow-sm active:scale-95 transition-transform"
                      >
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                          <History size={20} />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-black">我的订单</div>
                          <div className="text-[9px] text-black/40">查看所有任务记录</div>
                        </div>
                      </button>
                      <button 
                        onClick={() => {
                          setPreviousView(view);
                          setOrderFilter('进行中');
                          setView('service');
                          setSubView(null);
                        }}
                        className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-black/5 shadow-sm active:scale-95 transition-transform"
                      >
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                          <Target size={20} />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-black">进行中</div>
                          <div className="text-[9px] text-black/40">当前正在执行的任务</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Section: Financial & Social */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-mono text-black/40 uppercase tracking-[0.2em] pl-1">资产与社交</h3>
                    <div className="bg-white rounded-2xl border border-black/5 shadow-sm divide-y divide-black/5">
                      <button 
                        onClick={() => { setPreviousView(view); setSubView('wallet'); }}
                        className="w-full flex items-center justify-between p-4 active:bg-black/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard size={18} className="text-emerald-500" />
                          <span className="text-sm font-medium text-black">账户充值</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-black">余额: ¥245.00</span>
                          <ChevronRight size={16} className="text-black/20" />
                        </div>
                      </button>
                      <button 
                        onClick={() => { setPreviousView(view); setSubView('following'); }}
                        className="w-full flex items-center justify-between p-4 active:bg-black/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Heart size={18} className="text-red-500" />
                          <span className="text-sm font-medium text-black">关注列表</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-black">{followedCompanions.length} 人</span>
                          <ChevronRight size={16} className="text-black/20" />
                        </div>
                      </button>
                      <button 
                        onClick={() => { setPreviousView(view); setSubView('share'); }}
                        className="w-full flex items-center justify-between p-4 active:bg-black/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Share2 size={18} className="text-blue-500" />
                          <span className="text-sm font-medium text-black">分享推广</span>
                        </div>
                        <ChevronRight size={16} className="text-black/20" />
                      </button>
                    </div>
                  </div>

                  {/* Section: Support */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-mono text-black/40 uppercase tracking-[0.2em] pl-1">其他服务</h3>
                    <div className="bg-white rounded-2xl border border-black/5 shadow-sm divide-y divide-black/5">
                      <button 
                        onClick={() => setView('service')}
                        className="w-full flex items-center justify-between p-4 active:bg-black/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <LifeBuoy size={18} className="text-blue-400" />
                          <span className="text-sm font-medium text-black">帮助与反馈</span>
                        </div>
                        <ChevronRight size={16} className="text-black/20" />
                      </button>
                      <button 
                        onClick={() => {
                          localStorage.removeItem('delta_role');
                          setIdentitySelected(false);
                        }}
                        className="w-full flex items-center justify-between p-4 active:bg-black/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <LogOut size={18} className="text-red-400" />
                          <span className="text-sm font-medium text-black">切换身份</span>
                        </div>
                        <ChevronRight size={16} className="text-black/20" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Sub Views */}
          {view === 'profile' && subView === 'shop_setup' && (
            <motion.div 
              key="shop-setup-subview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pb-24"
            >
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => { if (previousView) setView(previousView); setSubView(null); }} className="p-2 bg-black/5 rounded-full text-black">
                  <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                  <Store size={20} className="text-emerald-600" />
                  <h2 className="text-xl font-black italic uppercase tracking-tighter text-black">店铺设置</h2>
                </div>
              </div>

              {companionStatus === 'pending' && (
                <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl flex items-center gap-2 mb-4">
                  <Clock size={14} className="text-orange-500" />
                  <span className="text-[10px] font-bold text-orange-800">资料审核中，部分修改可能在审核后生效</span>
                </div>
              )}

              <div className="space-y-6">
                {/* Media Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono text-black/40 uppercase tracking-widest">媒体展示</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="relative aspect-video bg-black/5 rounded-2xl border-2 border-dashed border-black/10 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-emerald-500/50 transition-colors overflow-hidden">
                      <input 
                        type="file" 
                        accept="video/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setEditData({ ...editData, video_url: url });
                          }
                        }}
                      />
                      {editData.video_url ? (
                        <video 
                          src={editData.video_url} 
                          className="absolute inset-0 w-full h-full object-cover"
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <>
                          <Camera size={24} className="text-black/20 group-hover:text-emerald-500" />
                          <span className="text-[10px] font-bold text-black/40">上传展示视频</span>
                        </>
                      )}
                    </label>
                    <label className="relative aspect-video bg-black/5 rounded-2xl border-2 border-dashed border-black/10 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-emerald-500/50 transition-colors overflow-hidden">
                      <input 
                        type="file" 
                        accept="audio/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setEditData({ ...editData, audio_url: url });
                          }
                        }}
                      />
                      {editData.audio_url ? (
                        <>
                          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-sm">
                            <Music size={20} />
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600">已上传语音</span>
                        </>
                      ) : (
                        <>
                          <Music size={24} className="text-black/20 group-hover:text-emerald-500" />
                          <span className="text-[10px] font-bold text-black/40">上传语音介绍</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Form Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono text-black/40 uppercase tracking-widest">基本信息</h3>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-black/40 uppercase">干员代号</label>
                    <input 
                      type="text" 
                      value={editData.name || ''} 
                      onChange={e => setEditData({...editData, name: e.target.value})}
                      className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-black/40 uppercase">战术简介</label>
                    <textarea 
                      rows={3}
                      value={editData.description || ''} 
                      onChange={e => setEditData({...editData, description: e.target.value})}
                      className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-black/40 uppercase">部署价格 (¥/小时)</label>
                      <input 
                        type="number" 
                        value={editData.price || 0} 
                        onChange={e => setEditData({...editData, price: parseInt(e.target.value)})}
                        className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-black/40 uppercase">战术标签</label>
                      <input 
                        type="text" 
                        placeholder="狙击, 突击, 医疗"
                        value={editData.tags || ''} 
                        onChange={e => setEditData({...editData, tags: e.target.value})}
                        className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleUpdateProfile}
                    className="w-full bg-emerald-500 text-white font-black uppercase py-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors active:scale-95"
                  >
                    <Save size={20} />
                    保存并发布店铺
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Sub Views */}
          {view === 'profile' && subView === 'following' && (
            <motion.div 
              key="following-subview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pb-24"
            >
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => { if (previousView) setView(previousView); setSubView(null); }} className="p-2 bg-black/5 rounded-full text-black">
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-black italic uppercase tracking-tighter text-black">关注列表</h2>
              </div>

              <div className="space-y-3">
                {followedCompanions.length === 0 ? (
                  <div className="text-center py-12 text-black/40 font-mono text-xs">
                    暂无关注的干员
                  </div>
                ) : (
                  companions
                    .filter(c => followedCompanions.includes(c.id))
                    .map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => setSelectedCompanion(c)} 
                        className="flex items-center p-3 bg-white rounded-2xl border border-black/5 shadow-sm active:scale-[0.98] transition-transform cursor-pointer gap-4"
                      >
                        <MiniAudioAvatar src={c.avatar} audioUrl={c.audio_url} onClick={() => setSelectedCompanion(c)} />
                        
                        <div className="flex-1 min-w-0 py-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-sm tracking-tight truncate pr-2 text-black">{c.name}</h4>
                            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">
                              <Star size={10} fill="currentColor" />
                              {c.rating}
                            </div>
                          </div>
                          <div className="text-[10px] text-black/40 truncate mb-2">{c.tags.split(',').join(' · ')}</div>
                          <div className="flex items-center justify-between mt-auto">
                            <div className="text-xs font-mono font-bold text-black">
                              <span className="text-emerald-600 text-[10px] mr-0.5">¥</span>{c.price}
                              <span className="text-[9px] text-black/30 font-sans ml-1">/小时</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  const link = `${window.location.origin}/companion/${c.id}`;
                                  navigator.clipboard.writeText(link);
                                  alert('分享链接已复制到剪贴板！');
                                }}
                                className="w-7 h-7 bg-black/5 rounded-full flex items-center justify-center text-black/40 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="分享"
                              >
                                <Share2 size={12} />
                              </button>
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  toggleFollow(c.id); 
                                }}
                                className="w-7 h-7 bg-red-50 rounded-full flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                              >
                                <Heart size={14} fill="currentColor" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </motion.div>
          )}

          {view === 'profile' && subView === 'schedule' && (
            <motion.div 
              key="schedule-subview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pb-24"
            >
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => { if (previousView) setView(previousView); setSubView(null); }} className="p-2 bg-black/5 rounded-full text-black">
                  <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-purple-600" />
                  <h2 className="text-xl font-black italic uppercase tracking-tighter text-black">今日日程</h2>
                </div>
              </div>

              {/* Schedule Timeline */}
              <div className="space-y-4">
                {orders.length > 0 ? (
                  [...orders].sort((a, b) => (a.time || "00:00").localeCompare(b.time || "00:00")).map((order, i) => {
                    const [hour, minute] = (order.time || "12:00").split(':').map(Number);
                    const duration = order.duration || 1;
                    const endHour = Math.floor(hour + duration);
                    const endMinute = minute + (duration % 1) * 60;
                    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
                    
                    const isCurrent = order.status === '进行中';

                    return (
                      <div key={i} className="flex gap-4">
                        {/* Timeline */}
                        <div className="flex flex-col items-center">
                          <div className={`text-xs font-bold ${isCurrent ? 'text-emerald-600' : 'text-black/40'}`}>
                            {order.time || "12:00"}
                          </div>
                          <div className={`w-0.5 flex-1 my-1 rounded-full ${isCurrent ? 'bg-emerald-500' : 'bg-black/10'}`} />
                          <div className="text-[10px] font-mono text-black/40">
                            {endTime}
                          </div>
                        </div>

                        {/* Card */}
                        <TacticalCard className={`flex-1 p-4 ${isCurrent ? 'border-emerald-500/30 bg-emerald-50/50' : 'bg-white border-black/5'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="text-[10px] font-mono text-black/40 uppercase mb-1">订单编号: {order.id}</div>
                              <h4 className={`font-bold ${isCurrent ? 'text-emerald-900' : 'text-black'}`}>{order.companionName}</h4>
                            </div>
                            <Badge className={isCurrent ? 'bg-emerald-500 text-white' : ''}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/5">
                            <div className="flex items-center gap-2">
                              <Clock size={14} className={isCurrent ? 'text-emerald-500' : 'text-black/40'} />
                              <span className="text-xs text-black/60">{duration} 小时</span>
                            </div>
                            {isCurrent && (
                              <div className="flex items-center gap-2 bg-emerald-500 text-white px-3 py-1 rounded-full animate-pulse">
                                <Activity size={12} />
                                <span className="text-[10px] font-mono font-bold">
                                  {Math.floor(pomodoroTime / 60).toString().padStart(2, '0')}:
                                  {(pomodoroTime % 60).toString().padStart(2, '0')}
                                </span>
                              </div>
                            )}
                          </div>
                        </TacticalCard>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar size={24} className="text-black/20" />
                    </div>
                    <h3 className="text-sm font-bold text-black mb-1">今日无安排</h3>
                    <p className="text-xs text-black/40">去接些新订单吧</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'profile' && subView === 'data' && (
            <motion.div 
              key="data-subview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pb-24"
            >
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => { if (previousView) setView(previousView); setSubView(null); }} className="p-2 bg-black/5 rounded-full text-black">
                  <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                  <Activity size={20} className="text-orange-600" />
                  <h2 className="text-xl font-black italic uppercase tracking-tighter text-black">收益数据</h2>
                </div>
              </div>

              {/* Revenue Overview */}
              <div className="grid grid-cols-2 gap-4">
                <TacticalCard className="p-4 bg-orange-50/50 border-orange-500/20">
                  <div className="text-[10px] font-mono text-orange-600/60 uppercase mb-2">今日收益</div>
                  <div className="text-2xl font-black text-orange-600">¥ 350</div>
                  <div className="text-[10px] text-orange-600/60 mt-1 flex items-center gap-1">
                    <TrendingUp size={10} />
                    较昨日 +12%
                  </div>
                </TacticalCard>
                <TacticalCard className="p-4">
                  <div className="text-[10px] font-mono text-black/40 uppercase mb-2">本周收益</div>
                  <div className="text-2xl font-black text-black">¥ 2,480</div>
                  <div className="text-[10px] text-black/40 mt-1">共 16 笔订单</div>
                </TacticalCard>
              </div>

              {/* Recent Transactions */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono text-black/40 uppercase tracking-widest">最近收益明细</h3>
                <div className="space-y-3">
                  {[
                    { id: "TRX-001", title: "干员 露娜 - 竞技模式", amount: "+200", date: "今天 14:00", status: "已入账" },
                    { id: "TRX-002", title: "干员 凯尔 - 休闲匹配", amount: "+150", date: "今天 10:00", status: "已入账" },
                    { id: "TRX-003", title: "干员 幽灵 - 教学指导", amount: "+120", date: "昨天 20:30", status: "已入账" },
                    { id: "TRX-004", title: "干员 露娜 - 竞技模式", amount: "+200", date: "昨天 15:00", status: "已入账" },
                    { id: "TRX-005", title: "提现至微信", amount: "-500", date: "昨天 12:00", status: "提现成功", type: "withdraw" },
                  ].map((trx, i) => (
                    <TacticalCard key={i} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] font-mono text-black/40 uppercase">{trx.id}</div>
                        <div className={`text-xs font-bold ${trx.type === 'withdraw' ? 'text-black' : 'text-emerald-600'}`}>
                          {trx.amount}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sm text-black">{trx.title}</div>
                        <div className="text-[10px] text-black/40">{trx.date}</div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between">
                        <Badge className={trx.type === 'withdraw' ? 'bg-black/5 text-black/60' : 'bg-emerald-50 text-emerald-600'}>
                          {trx.status}
                        </Badge>
                      </div>
                    </TacticalCard>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {view === 'profile' && subView === 'reviews' && (
            <motion.div 
              key="reviews-subview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pb-24"
            >
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => { if (previousView) setView(previousView); setSubView(null); }} className="p-2 bg-black/5 rounded-full text-black">
                  <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                  <Star size={20} className="text-yellow-500" />
                  <h2 className="text-xl font-black italic uppercase tracking-tighter text-black">全部评价</h2>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { user: "匿名雇主", time: "2 小时前", text: "技术非常好，沟通也很顺畅，下次还会再点！", rating: 5 },
                  { user: "玩家_8921", time: "昨天 15:30", text: "声音很好听，游戏意识也很强，带我躺赢了好几把。", rating: 5 },
                  { user: "夜空中的星", time: "昨天 10:15", text: "脾气很好，我打得很菜也没有嫌弃我，一直在鼓励我。", rating: 5 },
                  { user: "狙击手_007", time: "3天前", text: "报点很准，配合默契，是一次很棒的游戏体验。", rating: 4 },
                  { user: "快乐风男", time: "4天前", text: "很有趣的干员，聊天很开心，游戏也赢了。", rating: 5 },
                ].map((review, i) => (
                  <TacticalCard key={i} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-black/5 rounded-full flex items-center justify-center shrink-0">
                        <User size={14} className="text-black/40" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-black">{review.user}</span>
                          <div className="flex text-emerald-500">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star key={idx} size={10} fill={idx < review.rating ? "currentColor" : "none"} className={idx < review.rating ? "" : "text-black/20"} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-black/60 leading-relaxed">
                          {review.text}
                        </p>
                        <div className="text-[9px] text-black/30 font-mono mt-2">{review.time}</div>
                      </div>
                    </div>
                  </TacticalCard>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'profile' && subView === 'notifications' && (
            <motion.div 
              key="notifications-subview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pb-24"
            >
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => { if (previousView) setView(previousView); setSubView(null); }} className="p-2 bg-black/5 rounded-full text-black">
                  <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                  <Inbox size={20} className="text-pink-600" />
                  <h2 className="text-xl font-black italic uppercase tracking-tighter text-black">官方通知</h2>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { id: 1, title: "系统维护升级公告", sender: "系统管理员", time: "今天 10:00", read: false, content: "为了提供更好的服务，我们将于今晚 02:00-04:00 进行系统维护，期间可能会出现短暂的断线情况，请您提前做好准备。" },
                  { id: 2, title: "恭喜您获得本周「金牌干员」称号", sender: "运营团队", time: "昨天 18:30", read: true, content: "鉴于您本周出色的表现和极高的客户满意度，特授予您「金牌干员」称号，您的主页将获得专属徽章展示，并获得额外的流量曝光。" },
                  { id: 3, title: "提现成功通知", sender: "财务中心", time: "昨天 12:00", read: true, content: "您于昨天 10:00 申请的 500 元提现已成功打款至您的微信账户，请注意查收。" },
                  { id: 4, title: "新版本功能上线：快捷语音回复", sender: "产品团队", time: "3天前", read: true, content: "我们在最新版本中加入了快捷语音回复功能，您可以在聊天界面长按录音按钮快速发送语音消息，提升沟通效率。" },
                ].map((msg) => (
                  <TacticalCard key={msg.id} className={`p-0 overflow-hidden transition-colors ${msg.read ? 'bg-white' : 'bg-pink-50/30'}`}>
                    <div className="p-4 cursor-pointer active:bg-black/5 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.read ? 'bg-black/5 text-black/40' : 'bg-pink-100 text-pink-600'}`}>
                          {msg.read ? <MailOpen size={18} /> : <Mail size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm truncate pr-2 ${msg.read ? 'font-medium text-black/80' : 'font-bold text-black'}`}>
                              {msg.title}
                            </span>
                            <span className="text-[10px] text-black/40 whitespace-nowrap font-mono">{msg.time}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] px-1.5 py-0.5 bg-black/5 text-black/60 rounded uppercase">{msg.sender}</span>
                          </div>
                          <p className={`text-xs line-clamp-2 leading-relaxed ${msg.read ? 'text-black/50' : 'text-black/70'}`}>
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TacticalCard>
                ))}
              </div>
            </motion.div>
          )}

          {/* view === 'profile' && subView === 'orders' removed as it's now the main service view */}

          {view === 'profile' && subView === 'share' && (
            <motion.div 
              key="share-subview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pb-24"
            >
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => { if (previousView) setView(previousView); setSubView(null); }} className="p-2 bg-black/5 rounded-full text-black">
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-black italic uppercase tracking-tighter text-black">分享推广</h2>
              </div>

              <TacticalCard className="p-8 flex flex-col items-center text-center space-y-6">
                <div className="w-48 h-48 bg-black/5 rounded-2xl flex items-center justify-center border-2 border-dashed border-black/10">
                  <QrCode size={120} className="text-black/20" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black">邀请好友加入战术行动</h3>
                  <p className="text-xs text-black/40 mt-2">每成功邀请一位好友，您将获得 ¥20 战术津贴。</p>
                </div>
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-2 bg-black/5 p-3 rounded-lg border border-black/5">
                    <span className="flex-1 text-xs font-mono text-black/60 truncate">https://delta.link/invite/ghost-protocol</span>
                    <button className="p-1.5 bg-white rounded shadow-sm hover:bg-emerald-50 transition-colors">
                      <Copy size={14} className="text-emerald-600" />
                    </button>
                  </div>
                  <button className="w-full bg-emerald-500 text-white font-black uppercase py-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                    <Share2 size={20} />
                    立即分享
                  </button>
                </div>
              </TacticalCard>

              <div className="grid grid-cols-2 gap-4">
                <TacticalCard className="p-4 text-center">
                  <div className="text-[10px] font-mono text-black/40 uppercase mb-1">累计邀请</div>
                  <div className="text-2xl font-black text-black">12</div>
                </TacticalCard>
                <TacticalCard className="p-4 text-center">
                  <div className="text-[10px] font-mono text-black/40 uppercase mb-1">累计奖励</div>
                  <div className="text-2xl font-black text-emerald-600">¥240</div>
                </TacticalCard>
              </div>
            </motion.div>
          )}

          {view === 'profile' && subView === 'wallet' && (
            <motion.div 
              key="wallet-subview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pb-24"
            >
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => { if (previousView) setView(previousView); setSubView(null); }} className="p-2 bg-black/5 rounded-full text-black">
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-black italic uppercase tracking-tighter text-black">战术钱包</h2>
              </div>

              <TacticalCard className="p-8 bg-black text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Wallet size={120} />
                </div>
                <div className="relative z-10">
                  <div className="text-xs font-mono text-white/40 uppercase tracking-widest mb-2">当前余额</div>
                  <div className="text-4xl font-black italic tracking-tighter">¥1,240.50</div>
                  <div className="mt-8 flex gap-3">
                    <button className="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-lg text-sm">提现</button>
                    <button className="flex-1 bg-white/10 border border-white/10 text-white font-bold py-3 rounded-lg text-sm">充值</button>
                  </div>
                </div>
              </TacticalCard>

              <div className="space-y-4">
                <h3 className="text-xs font-mono text-black/40 uppercase tracking-widest">收支明细</h3>
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white rounded-xl border border-black/5">
                    <div>
                      <div className="text-sm font-bold text-black">任务收益 - 订单 #1290</div>
                      <div className="text-[10px] text-black/40">2024-02-23 14:20</div>
                    </div>
                    <div className="text-emerald-600 font-bold">+¥45.00</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Chat Overlay */}
      <AnimatePresence>
        {activeChat && (
          <motion.div 
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            className="fixed inset-0 z-[110] bg-black/20 flex justify-center"
          >
            <div className="w-full max-w-md bg-[#F5F5F7] flex flex-col h-full shadow-2xl">
              <div className="p-4 border-b border-black/5 flex items-center justify-between bg-white/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveChat(null)} className="p-2 bg-black/5 rounded-full text-black">
                  <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                  <img src={activeChat.avatar} className="w-8 h-8 rounded-full border border-black/5 shadow-sm" alt={activeChat.name} referrerPolicy="no-referrer" />
                  <div>
                    <div className="text-sm font-bold text-black">{activeChat.name}</div>
                    <div className="text-[10px] text-emerald-600 font-mono">在线</div>
                  </div>
                </div>
              </div>
              <button className="p-2 bg-black/5 rounded-full text-black">
                <Settings size={20} />
              </button>
            </div>

            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none max-w-[80%] border border-black/5 shadow-sm">
                  <p className="text-sm text-black">你好，干员。我需要协助完成沙漠地图的撤离任务。</p>
                  <span className="text-[9px] text-black/20 font-mono mt-1 block">下午 12:45</span>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-emerald-500 p-3 rounded-2xl rounded-tr-none max-w-[80%] text-white shadow-sm">
                  <p className="text-sm font-medium">收到。我已准备好部署，请发送坐标。</p>
                  <span className="text-[9px] text-white/60 font-mono mt-1 block">下午 12:46</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-black/5 bg-white pb-safe">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="输入战术指令..."
                  className="flex-1 bg-black/5 border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <Zap size={20} />
                </button>
              </div>
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Companion Detail Modal */}
      <AnimatePresence>
        {selectedCompanion && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/20 overflow-y-auto flex justify-center"
          >
            <div className="w-full max-w-md min-h-[100dvh] flex flex-col bg-white shadow-2xl">
              {/* Modal Header */}
              <div className="p-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-black/5">
                <button onClick={() => setSelectedCompanion(null)} className="p-2 bg-black/5 rounded-full text-black">
                  <ArrowLeft size={20} />
                </button>
                <Badge>干员资料</Badge>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const link = `${window.location.origin}/companion/${selectedCompanion.id}`;
                      navigator.clipboard.writeText(link);
                      alert('分享链接已复制到剪贴板！');
                    }}
                    className="p-2 bg-black/5 rounded-full text-black hover:bg-black/10 transition-colors"
                    title="分享"
                  >
                    <Share2 size={20} />
                  </button>
                  <button 
                    onClick={() => toggleFollow(selectedCompanion.id)}
                    className={`p-2 rounded-full transition-colors ${followedCompanions.includes(selectedCompanion.id) ? 'bg-red-50 text-red-500' : 'bg-black/5 text-black'}`}
                  >
                    <Heart size={20} fill={followedCompanions.includes(selectedCompanion.id) ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>

              {/* Video Preview */}
              <div className="relative aspect-video bg-black w-full shadow-lg">
                <video 
                  src={selectedCompanion.video_url} 
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/80">实时预览</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-8 flex-1 bg-[#F5F5F7]">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-black">{selectedCompanion.name}</h2>
                    <div className="flex gap-2 mt-2">
                      {selectedCompanion.tags.split(',').map(t => <Badge key={t}>{t}</Badge>)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-emerald-600">¥{selectedCompanion.price}</div>
                    <div className="text-[10px] text-black/40 font-mono uppercase">每小时</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-mono text-black/40 uppercase tracking-widest">干员情报</h3>
                  <p className="text-sm text-black/80 leading-relaxed">
                    {selectedCompanion.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-mono text-black/40 uppercase tracking-widest">语音试听</h3>
                  <AudioPlayer url={selectedCompanion.audio_url} />
                </div>

                {/* Image Gallery */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono text-black/40 uppercase tracking-widest">干员图集</h3>
                    <span className="text-[10px] text-black/40 font-mono">3 张</span>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6 snap-x">
                    {[1, 2, 3].map((i) => {
                      const imgSrc = `https://picsum.photos/seed/companion_${selectedCompanion.id}_img${i}/400/600`;
                      return (
                        <div 
                          key={i} 
                          onClick={() => setFullscreenImage(imgSrc)}
                          className="snap-start shrink-0 w-48 aspect-[3/4] rounded-2xl overflow-hidden border border-black/5 shadow-sm relative group cursor-pointer"
                        >
                          <img 
                            src={imgSrc} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt={`Gallery ${i}`}
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <TacticalCard className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Crosshair size={16} className="text-emerald-500" />
                      <span className="text-[10px] font-mono uppercase text-black/40">命中率</span>
                    </div>
                    <div className="text-xl font-bold text-black">98.2%</div>
                  </TacticalCard>
                  <TacticalCard className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Map size={16} className="text-emerald-500" />
                      <span className="text-[10px] font-mono uppercase text-black/40">地图熟练度</span>
                    </div>
                    <div className="text-xl font-bold text-black">100%</div>
                  </TacticalCard>
                </div>
              </div>

              {/* Footer Action */}
              <div className="p-6 sticky bottom-0 bg-white border-t border-black/5">
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setActiveChat(selectedCompanion);
                      setSelectedCompanion(null);
                    }}
                    className="flex-1 bg-black/5 border border-black/5 text-black font-bold uppercase py-4 rounded-xl hover:bg-black/10 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={20} />
                    私聊
                  </button>
                  <button 
                    onClick={() => {
                      const hasActiveOrder = orders.some(o => o.companionId === selectedCompanion.id && (o.status === '进行中' || o.status === '待支付'));
                      if (hasActiveOrder) {
                        alert('该干员当前正在执行其他任务，无法重复部署。');
                        return;
                      }
                      
                      const newOrder: Order = {
                        id: `ORD-2024-${String(orders.length + 1).padStart(3, '0')}`,
                        status: '进行中',
                        companionId: selectedCompanion.id,
                        companionName: selectedCompanion.name,
                        price: selectedCompanion.price,
                        date: new Date().toISOString().split('T')[0],
                        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                        duration: 1
                      };
                      setOrders([newOrder, ...orders]);
                      alert('部署成功！');
                      setSelectedCompanion(null);
                      setPreviousView(view);
                      setView('service');
                      setOrderFilter('进行中');
                      setSubView(null);
                    }}
                    className="flex-[2] bg-emerald-500 text-white font-black uppercase py-4 rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform"
                  >
                    立即部署
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav (Mobile Style) */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-white/90 backdrop-blur-xl border-t border-black/5 px-6 py-2 pb-safe shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-end h-16 relative">
          
          {/* Nav Items */}
          {[
            { id: 'home', icon: Zap, label: role === 'user' ? '任务' : '控制台' },
            { id: 'chat', icon: MessageSquare, label: '通讯' },
            { id: 'center', icon: role === 'user' ? Crosshair : Shield, isCenter: true },
            { id: 'service', icon: History, label: '订单' },
            { id: 'profile', icon: User, label: '我的' }
          ].map((item) => {
            if (item.isCenter) {
              return (
                <div key="center" className="relative -top-6 px-2">
                  <button 
                    onClick={() => { setView('home'); setSubView(null); }}
                    className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/40 border-4 border-white active:scale-95 transition-transform"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={role}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        <item.icon size={24} />
                      </motion.div>
                    </AnimatePresence>
                  </button>
                </div>
              );
            }

            const isActive = view === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => { setView(item.id as any); setSubView(null); }}
                className="flex flex-col items-center justify-center w-16 h-full gap-1 relative group"
              >
                <div className={`transition-all duration-300 ${isActive ? 'text-emerald-600 -translate-y-1' : 'text-black/40 group-hover:text-black/60'}`}>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <div className="relative h-3 w-full flex justify-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.span 
                      key={item.label}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: isActive ? 1 : 0 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute text-[9px] font-bold uppercase transition-all duration-300 ${isActive ? 'text-emerald-600' : 'text-black/40 group-hover:opacity-100'}`}
                    >
                      {item.label}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Fullscreen Image Viewer */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col"
          >
            <div className="p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
              <button 
                onClick={() => setFullscreenImage(null)}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="text-white/60 font-mono text-[10px] tracking-widest uppercase">
                高清预览
              </div>
              <div className="w-10 h-10" /> {/* Spacer */}
            </div>
            
            <div 
              className="flex-1 flex items-center justify-center p-4 overflow-hidden"
              onClick={() => setFullscreenImage(null)}
            >
              <motion.img 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                src={fullscreenImage} 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                alt="Fullscreen Preview"
                referrerPolicy="no-referrer"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
