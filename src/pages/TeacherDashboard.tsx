import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Video, BookOpen, Upload as UploadIcon,
  IndianRupee, Bell, User, LogOut, Plus, Search,
  ChevronRight, TrendingUp, PlayCircle, FileText,
  CheckCircle, AlertCircle, X, Image as ImageIcon, File,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  uploadCourseWithLesson,
  fetchTeacherCourses,
  deleteCourse,
  type CourseWithLessons,
} from '@/services/courseService';

type Section = 'Dashboard' | 'My Courses' | 'Upload Course' | 'Earnings';

// ─── Reusable UI ─────────────────────────────────────────────────────────────

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string; icon: React.ElementType; color: string }) => (
  <Card className="flex items-center space-x-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </Card>
);

// ─── Upload Progress Bar ──────────────────────────────────────────────────────

const UploadProgress = ({ stage, pct }: { stage: string; pct: number }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
    <div className="bg-white rounded-2xl p-8 w-[420px] shadow-2xl">
      {/* Spinner + stage */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-emerald-50 border-4 border-emerald-200 border-t-emerald-600 animate-spin shrink-0" />
        <div>
          <p className="font-bold text-gray-900 text-base">{stage}</p>
          <p className="text-xs text-gray-400 mt-0.5">Please don't close this window</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
          style={{ width: pct > 0 ? `${pct}%` : '10%' }}
        />
      </div>

      {/* Percentage + hint */}
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-gray-400">
          {pct === 0 ? 'Starting…' : pct >= 100 ? 'Processing…' : `${pct}% uploaded`}
        </p>
        <p className="text-sm font-bold text-emerald-600">{pct}%</p>
      </div>

      {/* Large file hint */}
      <p className="text-[11px] text-gray-300 text-center mt-4">
        Large video files may take a few minutes depending on your internet speed.
      </p>
    </div>
  </div>
);

// ─── File Drop Zone ───────────────────────────────────────────────────────────

const DropZone = ({
  accept, label, hint, icon: Icon, file, onFile, id,
}: {
  accept: string; label: string; hint: string;
  icon: React.ElementType; file: File | null;
  onFile: (f: File) => void; id: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };

  return (
    <div
      id={id}
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
        ${drag ? 'border-emerald-500 bg-emerald-50' : file ? 'border-emerald-400 bg-emerald-50/50' : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
      {file ? (
        <div className="flex items-center justify-center gap-2 text-emerald-700">
          <CheckCircle size={20} className="text-emerald-500" />
          <span className="text-sm font-semibold truncate max-w-[200px]">{file.name}</span>
        </div>
      ) : (
        <>
          <Icon size={28} className="mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-semibold text-gray-600">{label}</p>
          <p className="text-xs text-gray-400 mt-1">{hint}</p>
        </>
      )}
    </div>
  );
};

// ─── Upload Form ──────────────────────────────────────────────────────────────

const UploadCourseForm = ({
  teacherUid,
  onSuccess,
}: {
  teacherUid: string;
  onSuccess: () => void;
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState('6');
  const [level, setLevel] = useState('Beginner');
  const [isFree, setIsFree] = useState(true);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState('');
  const [uploadPct, setUploadPct] = useState(0);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !subject.trim() || !lessonTitle.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setUploading(true);
    try {
      await uploadCourseWithLesson({
        teacherUid,
        title,
        description,
        subject,
        classLevel: parseInt(classLevel),
        level,
        isFree,
        thumbnailFile,
        videoFile,
        lessonTitle,
        lessonContent,
        onProgress: (stage, pct) => {
          setUploadStage(stage);
          setUploadPct(pct);
        },
      });
      toast.success('🎉 Course published successfully!');
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition';
  const labelCls = 'block text-sm font-semibold text-gray-700 mb-1';

  return (
    <>
      {uploading && <UploadProgress stage={uploadStage} pct={uploadPct} />}

      <div className="bg-white rounded-2xl shadow border-t-4 border-emerald-500 max-w-3xl mx-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Upload New Course</h2>
          <p className="text-sm text-gray-500 mt-1">Fill in the details to publish your course to students.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Course Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Course Details</h3>

            <div>
              <label className={labelCls}>Course Title *</label>
              <input id="course-title" className={inputCls} placeholder="e.g. Introduction to Algebra" value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            <div>
              <label className={labelCls}>Description *</label>
              <textarea id="course-description" className={`${inputCls} h-24 resize-none`} placeholder="What will students learn?" value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Subject *</label>
                <input id="course-subject" className={inputCls} placeholder="e.g. Mathematics" value={subject} onChange={e => setSubject(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Class Level</label>
                <select id="course-class" className={inputCls} value={classLevel} onChange={e => setClassLevel(e.target.value)}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>Class {n}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Difficulty Level</label>
                <select id="course-level" className={inputCls} value={level} onChange={e => setLevel(e.target.value)}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsFree(!isFree)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isFree ? 'bg-emerald-500' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${isFree ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm font-semibold text-gray-700">{isFree ? 'Free Course' : 'Paid Course'}</span>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Media</h3>
            <div className="grid grid-cols-2 gap-4">
              <DropZone
                id="thumbnail-drop"
                accept="image/*"
                label="Upload Thumbnail"
                hint="JPG, PNG, WebP (16:9)"
                icon={ImageIcon}
                file={thumbnailFile}
                onFile={setThumbnailFile}
              />
              <DropZone
                id="video-drop"
                accept="video/*"
                label="Upload Video"
                hint="MP4, WebM (Max 2GB)"
                icon={Video}
                file={videoFile}
                onFile={setVideoFile}
              />
            </div>
          </div>

          {/* Lesson */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">First Lesson</h3>
            <div>
              <label className={labelCls}>Lesson Title *</label>
              <input id="lesson-title" className={inputCls} placeholder="e.g. Introduction to the Course" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Lesson Notes / Reading Content</label>
              <textarea id="lesson-content" className={`${inputCls} h-28 resize-none`} placeholder="Add reading notes or transcript for this lesson…" value={lessonContent} onChange={e => setLessonContent(e.target.value)} />
            </div>
          </div>

          <button
            id="publish-btn"
            type="submit"
            disabled={uploading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
          >
            <UploadIcon size={18} />
            Publish Course
          </button>
        </form>
      </div>
    </>
  );
};

// ─── My Courses List ──────────────────────────────────────────────────────────

const MyCourses = ({ teacherUid, onUpload }: { teacherUid: string; onUpload: () => void }) => {
  const [courses, setCourses] = useState<CourseWithLessons[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchTeacherCourses(teacherUid);
      setCourses(data);
    } catch {
      toast.error('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [teacherUid]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    try {
      await deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      toast.success('Course deleted.');
    } catch {
      toast.error('Failed to delete course.');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-48 text-gray-400">
      <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
    </div>
  );

  if (courses.length === 0) return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-4">
      <BookOpen size={48} className="opacity-20" />
      <p>No courses yet. Upload your first course!</p>
      <button
        onClick={onUpload}
        className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-emerald-700 transition"
      >
        <Plus size={16} /> Upload Course
      </button>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <div key={course.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
          {course.thumbnail_url ? (
            <img src={course.thumbnail_url} alt={course.title} className="w-full h-40 object-cover" />
          ) : (
            <div className="w-full h-40 bg-emerald-50 flex items-center justify-center">
              <BookOpen size={40} className="text-emerald-300" />
            </div>
          )}
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                {course.subject}
              </span>
              <span className="text-xs text-gray-400">Class {course.class_level}</span>
            </div>
            <h4 className="font-bold text-gray-800 mb-1 line-clamp-1">{course.title}</h4>
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{course.description}</p>
            <div className="flex justify-between items-center pt-3 border-t border-gray-50">
              <div className="flex items-center text-sm text-gray-600">
                <PlayCircle size={14} className="mr-1 text-gray-400" />
                {course.lessons?.length ?? 0} lesson(s)
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${course.is_free ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                  {course.is_free ? 'Free' : 'Paid'}
                </span>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="text-red-400 hover:text-red-600 transition"
                  title="Delete course"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Dashboard Overview ───────────────────────────────────────────────────────

const DashboardOverview = ({ teacherUid }: { teacherUid: string }) => {
  const [courses, setCourses] = useState<CourseWithLessons[]>([]);

  useEffect(() => {
    fetchTeacherCourses(teacherUid).then(setCourses).catch(() => {});
  }, [teacherUid]);

  const totalVideos = courses.reduce((acc, c) => acc + (c.lessons?.filter(l => l.type === 'video').length ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Courses" value={courses.length.toString()} icon={Video} color="bg-emerald-500" />
        <StatCard title="Total Lessons" value={courses.reduce((a, c) => a + (c.lessons?.length ?? 0), 0).toString()} icon={BookOpen} color="bg-blue-500" />
        <StatCard title="Video Lessons" value={totalVideos.toString()} icon={TrendingUp} color="bg-amber-500" />
        <StatCard title="Earnings" value="₹ 0" icon={IndianRupee} color="bg-purple-500" />
      </div>
      <Card>
        <h3 className="font-semibold text-gray-800 mb-4">Recent Courses</h3>
        {courses.length === 0 ? (
          <p className="text-sm text-gray-400">No courses yet.</p>
        ) : (
          <div className="space-y-3">
            {courses.slice(0, 4).map(course => (
              <div key={course.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} className="w-10 h-10 rounded-lg object-cover" alt="" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <BookOpen size={16} className="text-emerald-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{course.title}</p>
                  <p className="text-xs text-gray-500">{course.subject} · Class {course.class_level}</p>
                </div>
                <span className="text-xs text-gray-400">{course.lessons?.length ?? 0} lessons</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

// ─── Earnings ────────────────────────────────────────────────────────────────

const EarningsPage = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-emerald-600 text-white border-none">
        <p className="opacity-80 text-sm">Wallet Balance</p>
        <h2 className="text-3xl font-bold mt-1">₹ 0.00</h2>
        <button className="mt-4 bg-white/20 w-full py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition">Withdraw to Bank</button>
      </Card>
      <StatCard title="Points Earned" value="0" icon={TrendingUp} color="bg-amber-500" />
      <StatCard title="Ad Revenue" value="₹ 0" icon={IndianRupee} color="bg-blue-500" />
    </div>
    <Card>
      <h3 className="font-semibold mb-4">How it works</h3>
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</div>
          <p className="text-sm text-gray-600">Points are awarded based on engagement (views, completion rate, and quiz scores).</p>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</div>
          <p className="text-sm text-gray-600">Every 100 points converts to ₹10 for creators in rural distribution programs.</p>
        </div>
      </div>
    </Card>
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function VidyaPathDashboard() {
  const [activeSection, setActiveSection] = useState<Section>('Dashboard');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const menuItems: { name: Section; icon: React.ElementType }[] = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'My Courses', icon: Video },
    { name: 'Upload Course', icon: UploadIcon },
    { name: 'Earnings', icon: IndianRupee },
  ];

  const handleTeacherLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'Dashboard':
        return <DashboardOverview teacherUid={user?.uid ?? ''} />;
      case 'My Courses':
        return <MyCourses teacherUid={user?.uid ?? ''} onUpload={() => setActiveSection('Upload Course')} />;
      case 'Upload Course':
        return (
          <UploadCourseForm
            teacherUid={user?.uid ?? ''}
            onSuccess={() => setActiveSection('My Courses')}
          />
        );
      case 'Earnings':
        return <EarningsPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex-col hidden lg:flex">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <BookOpen className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-emerald-900">VidyaPath</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveSection(item.name)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeSection === item.name
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium text-sm">{item.name}</span>
            </button>
          ))}

          <button
            onClick={() => navigate('/teacher/profile')}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          >
            <User size={20} />
            <span className="font-medium text-sm">Teacher Profile</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-50">
          <div className="bg-emerald-900 rounded-xl p-4 text-white">
            <p className="text-xs opacity-70">Support rural education</p>
            <p className="text-sm font-semibold mt-1 flex items-center">
              Invite Teachers <ChevronRight size={14} className="ml-1" />
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search content..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <button
              onClick={() => navigate('/teacher/profile')}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <User size={16} /> Profile
            </button>
            <button
              onClick={handleTeacherLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
            >
              <LogOut size={16} /> Logout
            </button>
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">{user?.displayName ?? 'Teacher'}</p>
                <p className="text-xs text-gray-400">Educator</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-full border-2 border-emerald-50 overflow-hidden">
                <img
                  src={user?.photoURL ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid ?? 'teacher'}`}
                  alt="avatar"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 max-w-6xl mx-auto w-full">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{activeSection}</h1>
              <p className="text-sm text-gray-500">Welcome back to your teaching portal.</p>
            </div>
            {activeSection !== 'Upload Course' && (
              <button
                onClick={() => setActiveSection('Upload Course')}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-emerald-700 transition shadow-md shadow-emerald-100"
              >
                <Plus size={18} />
                <span className="font-medium">Upload New</span>
              </button>
            )}
          </div>

          {renderContent()}
        </div>
      </main>
    </div>
  );
}