import React, { useState } from 'react';
import { 
  CheckCircle, 
  Star, 
  Video, 
  Users, 
  BookOpen, 
  Trophy, 
  Globe, 
  Filter,
  Calendar,
  Eye,
  Clock,
  FileText,
  Download,
  ExternalLink
} from 'lucide-react';

// --- Types ---
interface VideoItem {
  id: string;
  title: string;
  subject: string;
  topic: string;
  views: string;
  date: string;
  thumbnail: string;
  rating: number;
}

interface NoteItem {
  id: string;
  title: string;
  subject: string;
  type: 'PDF' | 'DOC' | 'Handwritten';
  size: string;
  downloads: number;
}

interface Feedback {
  id: number;
  name: string;
  rating: number;
  comment: string;
}

// --- Mock Data ---
const TEACHER_DATA = {
  name: "Dr. Ananya Sharma",
  qualification: "Ph.D. in Applied Physics, B.Ed",
  experience: "8+ Years Teaching",
  bio: "Passionate educator dedicated to making complex physical concepts accessible to everyone. Specializing in interactive learning and inclusive pedagogy.",
  stats: [
    { label: "Total Students", value: "15,400+", icon: Users },
    { label: "Videos Uploaded", value: "142", icon: Video },
    { label: "Average Rating", value: "4.9/5", icon: Star },
    { label: "Study Notes", value: "85", icon: FileText },
  ],
  subjects: ["Physics", "Mathematics"],
  expertise: ["Quantum Mechanics", "Calculus", "Optics", "Algebra"],
};

const VIDEOS: VideoItem[] = [
  { id: '1', title: 'Understanding Laws of Motion', subject: 'Physics', topic: 'Mechanics', views: '12k', date: '2 days ago', thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400', rating: 5 },
  { id: '2', title: 'Introduction to Derivatives', subject: 'Math', topic: 'Calculus', views: '8.5k', date: '1 week ago', thumbnail: 'https://images.unsplash.com/photo-1632571401005-458b9d244391?auto=format&fit=crop&q=80&w=400', rating: 4.8 },
  { id: '3', title: 'Wave-Particle Duality', subject: 'Physics', topic: 'Quantum', views: '15k', date: '3 weeks ago', thumbnail: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=400', rating: 4.9 },
];

const NOTES: NoteItem[] = [
  { id: 'n1', title: 'Complete Guide to Newton’s Laws', subject: 'Physics', type: 'PDF', size: '2.4 MB', downloads: 1200 },
  { id: 'n2', title: 'Calculus Cheat Sheet: Integration', subject: 'Math', type: 'Handwritten', size: '5.1 MB', downloads: 850 },
  { id: 'n3', title: 'Optics Formula Bank', subject: 'Physics', type: 'PDF', size: '1.2 MB', downloads: 430 },
];

const FEEDBACK: Feedback[] = [
  { id: 1, name: "Rahul M.", rating: 5, comment: "Dr. Ananya explains things so simply. The visualization of gravity changed how I think about space!" },
  { id: 2, name: "Sara Khan", rating: 5, comment: "Excellent pace and very inclusive language. Great for competitive exam prep." },
];

// --- Reusable Components ---

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md ${className}`}>
    {children}
  </div>
);

const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = "bg-emerald-50 text-emerald-700" }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
    {children}
  </span>
);

const TeacherProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'videos' | 'notes'>('videos');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      {/* 1. Profile Header */}
      <header className="bg-white border-b border-gray-200 pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200" 
              alt="Profile" 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-emerald-50 shadow-lg"
            />
            <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-md">
              <CheckCircle className="text-emerald-500 w-6 h-6 fill-emerald-50" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">{TEACHER_DATA.name}</h1>
              <div className="flex items-center justify-center gap-1 text-amber-500 font-semibold">
                <Star className="w-5 h-5 fill-current" />
                <span>4.9/5</span>
              </div>
            </div>
            <p className="text-emerald-600 font-medium mb-1">{TEACHER_DATA.qualification}</p>
            <div className="flex items-center justify-center md:justify-start gap-4 text-slate-500 text-sm mb-4">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {TEACHER_DATA.experience}</span>
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> Verified Educator</span>
            </div>
            <p className="max-w-2xl text-slate-600 leading-relaxed">
              {TEACHER_DATA.bio}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Content & Stats */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 2. Stats Section */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TEACHER_DATA.stats.map((stat, index) => (
              <Card key={index} className="p-4 text-center">
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
              </Card>
            ))}
          </section>

          {/* 4. Content Section (Tabs for Videos & Notes) */}
          <section>
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 border-b border-gray-200">
              <div className="flex gap-8">
                <button 
                  onClick={() => setActiveTab('videos')}
                  className={`pb-4 text-sm font-bold transition-colors relative ${activeTab === 'videos' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <span className="flex items-center gap-2"><Video className="w-4 h-4" /> Video Lessons</span>
                  {activeTab === 'videos' && <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 rounded-t-full" />}
                </button>
                <button 
                  onClick={() => setActiveTab('notes')}
                  className={`pb-4 text-sm font-bold transition-colors relative ${activeTab === 'notes' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Study Notes</span>
                  {activeTab === 'notes' && <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 rounded-t-full" />}
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-white border px-3 py-1.5 rounded-lg shadow-sm mb-3">
                <Filter className="w-4 h-4" />
                <span className="font-medium">Filter Content</span>
              </div>
            </div>

            {/* Dynamic Content Rendering */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTab === 'videos' ? (
                VIDEOS.map((video) => (
                  <Card key={video.id} className="overflow-hidden group">
                    <div className="relative aspect-video">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        12:45
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-tighter">{video.subject} • {video.topic}</span>
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-current" /> {video.rating}
                        </div>
                      </div>
                      <h3 className="font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-1">{video.title}</h3>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {video.views} views</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {video.date}</span>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                NOTES.map((note) => (
                  <Card key={note.id} className="p-5 flex items-start gap-4 hover:border-emerald-200 group">
                    <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{note.subject}</span>
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold">{note.type}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm mt-1 mb-2 leading-snug">{note.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{note.size}</span>
                        <button className="flex items-center gap-1 text-emerald-600 text-xs font-bold hover:underline">
                          <Download className="w-3 h-3" /> Download
                        </button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Expertise, Impact, Feedback */}
        <div className="space-y-8">
          
          {/* 3. Subjects & Expertise */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              Expertise
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-2 uppercase">Core Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {TEACHER_DATA.subjects.map(s => <Badge key={s}>{s}</Badge>)}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-2 uppercase">Specializations</p>
                <div className="flex flex-wrap gap-2">
                  {TEACHER_DATA.expertise.map(e => (
                    <span key={e} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium border border-slate-200">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* 6. Impact Section */}
          <div className="bg-emerald-600 rounded-xl p-6 text-white shadow-lg shadow-emerald-200 relative overflow-hidden group">
            <Globe className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-500/40 rotate-12 transition-transform group-hover:scale-110" />
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
              <Trophy className="w-5 h-5 text-emerald-200" />
              Social Impact
            </h2>
            <div className="space-y-3 relative z-10">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                <p className="text-2xl font-bold">12,000+</p>
                <p className="text-emerald-50 text-xs">Students helped across rural districts</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                <p className="text-2xl font-bold">3 Languages</p>
                <p className="text-emerald-50 text-xs">Content in Hindi, English, and Marathi</p>
              </div>
            </div>
          </div>

          {/* 5. Student Feedback */}
          <section>
            <h2 className="text-lg font-bold mb-4">Student Feedback</h2>
            <div className="space-y-4">
              {FEEDBACK.map(f => (
                <Card key={f.id} className="p-4 bg-white/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">{f.name}</span>
                    <div className="flex text-amber-400">
                      {[...Array(f.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm italic leading-relaxed">"{f.comment}"</p>
                </Card>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default TeacherProfile;