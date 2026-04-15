import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  CheckCircle, Star, Video, Users, BookOpen, Trophy,
  Globe, Filter, Calendar, Eye, Clock, FileText,
  Download, LogOut, Upload, Plus,
} from 'lucide-react';
import { fetchTeacherCourses, type CourseWithLessons } from '@/services/courseService';
import { toast } from 'sonner';

// ─── Reusable UI ─────────────────────────────────────────────────────────────

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md ${className}`}>
    {children}
  </div>
);

const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'bg-emerald-50 text-emerald-700' }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>{children}</span>
);

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`bg-gray-100 animate-pulse rounded-lg ${className}`} />
);

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) => (
  <Card className="p-4 text-center">
    <Icon className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
    <p className="text-2xl font-bold text-slate-900">{value}</p>
    <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
  </Card>
);

// ─── Main Teacher Profile ─────────────────────────────────────────────────────

const TeacherProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'videos' | 'notes'>('videos');
  const [courses, setCourses] = useState<CourseWithLessons[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user?.uid) return;
    fetchTeacherCourses(user.uid)
      .then(setCourses)
      .catch(() => toast.error('Failed to load your courses.'))
      .finally(() => setLoading(false));
  }, [user?.uid]);

  const handleTeacherLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const videoCourses = courses.filter(c =>
    c.lessons?.some(l => l.type === 'video')
  );
  const noteCourses = courses.filter(c =>
    c.lessons?.some(l => l.type === 'reading')
  );

  const totalLessons = courses.reduce((a, c) => a + (c.lessons?.length ?? 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">

      {/* Profile Header */}
      <header className="bg-white border-b border-gray-200 pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8">

          {/* Avatar */}
          <div className="relative">
            <img
              src={user?.photoURL ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid ?? 'teacher'}`}
              alt="Profile"
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-emerald-50 shadow-lg bg-white"
            />
            <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-md">
              <CheckCircle className="text-emerald-500 w-6 h-6 fill-emerald-50" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-end gap-2 mb-3">
              <button
                onClick={() => navigate('/teacher/dashboard')}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => navigate('/teacher/dashboard')}
                className="px-3 py-1.5 text-sm bg-emerald-600 rounded-lg text-white hover:bg-emerald-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Upload Course
              </button>
              <button
                onClick={handleTeacherLogout}
                className="px-3 py-1.5 text-sm border border-red-200 rounded-lg text-red-600 hover:bg-red-50 flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">
                {user?.displayName ?? 'Teacher'}
              </h1>
            </div>
            <p className="text-emerald-600 font-medium mb-1">{user?.email}</p>
            <div className="flex items-center justify-center md:justify-start gap-4 text-slate-500 text-sm mb-4">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Educator</span>
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> Verified Teacher</span>
            </div>
            <p className="max-w-2xl text-slate-600 leading-relaxed">
              Sharing knowledge to help students across India learn better. Upload courses, lessons, and notes to make education accessible for everyone.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">

          {/* Stats */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Courses" value={courses.length.toString()} icon={BookOpen} />
            <StatCard label="Total Lessons" value={totalLessons.toString()} icon={Video} />
            <StatCard label="Video Lessons" value={courses.reduce((a, c) => a + (c.lessons?.filter(l => l.type === 'video').length ?? 0), 0).toString()} icon={Star} />
            <StatCard label="Free Courses" value={courses.filter(c => c.is_free).length.toString()} icon={FileText} />
          </section>

          {/* Content Tabs */}
          <section>
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 border-b border-gray-200">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`pb-4 text-sm font-bold transition-colors relative ${activeTab === 'videos' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <span className="flex items-center gap-2"><Video className="w-4 h-4" /> Video Courses</span>
                  {activeTab === 'videos' && <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 rounded-t-full" />}
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`pb-4 text-sm font-bold transition-colors relative ${activeTab === 'notes' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Reading / Notes</span>
                  {activeTab === 'notes' && <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 rounded-t-full" />}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="rounded-xl border overflow-hidden">
                    <Skeleton className="h-40 rounded-none" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(activeTab === 'videos' ? videoCourses : noteCourses).map((course) => (
                  <Card key={course.id} className="overflow-hidden group cursor-pointer">
                    <div className="relative aspect-video">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-emerald-50 flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-emerald-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-tighter">
                          {course.subject} · Class {course.class_level}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${course.is_free ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                          {course.is_free ? 'Free' : 'Paid'}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{course.description}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Video className="w-3 h-3" /> {course.lessons?.length ?? 0} lessons</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(course.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}

                {(activeTab === 'videos' ? videoCourses : noteCourses).length === 0 && (
                  <div className="col-span-2 flex flex-col items-center justify-center py-16 text-gray-400 space-y-3">
                    <BookOpen size={40} className="opacity-20" />
                    <p className="text-sm">No {activeTab === 'videos' ? 'video courses' : 'reading courses'} yet.</p>
                    <button
                      onClick={() => navigate('/teacher/dashboard')}
                      className="flex items-center gap-2 text-emerald-600 text-sm font-semibold hover:underline"
                    >
                      <Upload size={14} /> Upload a course
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-8">

          {/* Quick Stats */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" /> Subjects Taught
            </h2>
            <div className="flex flex-wrap gap-2">
              {[...new Set(courses.map(c => c.subject))].map(s => (
                <Badge key={s}>{s}</Badge>
              ))}
              {courses.length === 0 && (
                <p className="text-sm text-slate-400">No subjects yet.</p>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-500 mb-2 uppercase">Class Levels</p>
              <div className="flex flex-wrap gap-2">
                {[...new Set(courses.map(c => c.class_level))].sort().map(cl => (
                  <span key={cl} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium border border-slate-200">
                    Class {cl}
                  </span>
                ))}
                {courses.length === 0 && (
                  <p className="text-sm text-slate-400">—</p>
                )}
              </div>
            </div>
          </Card>

          {/* Impact */}
          <div className="bg-emerald-600 rounded-xl p-6 text-white shadow-lg shadow-emerald-200 relative overflow-hidden group">
            <Globe className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-500/40 rotate-12 transition-transform group-hover:scale-110" />
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
              <Trophy className="w-5 h-5 text-emerald-200" /> Social Impact
            </h2>
            <div className="space-y-3 relative z-10">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                <p className="text-2xl font-bold">{courses.length}</p>
                <p className="text-emerald-50 text-xs">Courses published on VidyaPath</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                <p className="text-2xl font-bold">{totalLessons}</p>
                <p className="text-emerald-50 text-xs">Learning lessons created</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/teacher/dashboard')}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition font-semibold text-sm"
              >
                <Upload size={16} /> Upload New Course
              </button>
              <button
                onClick={() => navigate('/teacher/dashboard')}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 transition font-semibold text-sm"
              >
                <BookOpen size={16} /> View My Courses
              </button>
            </div>
          </Card>

        </div>
      </main>
    </div>
  );
};

export default TeacherProfile;