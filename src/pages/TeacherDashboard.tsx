import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, File, Image as ImageIcon } from 'lucide-react';
type UploadType = 'video' | 'notes';
type NotesType = 'image' | 'pdf';
import { 
  LayoutDashboard, 
  Video, 
  BookOpen, 
  Layers, 
  Upload, 
  IndianRupee, 
  Bell, 
  User, 
  LogOut,
  Plus, 
  Search,
  ChevronRight,
  TrendingUp,
  PlayCircle,
  MoreVertical
} from 'lucide-react';

// --- Types ---
type Section = 'Dashboard' | 'View Classes' | 'Subjects' | 'Topics' | 'Upload Material' | 'Earnings';

interface VideoCard {
  id: number;
  title: string;
  subject: string;
  topic: string;
  views: number;
  date: string;
  points: number;
  thumbnail: string;
}

// --- Mock Data ---
const MOCK_VIDEOS: VideoCard[] = [
  { id: 1, title: 'Algebraic Expressions Part 1', subject: 'Math', topic: 'Algebra', views: 1240, date: '2024-03-10', points: 450, thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400' },
  { id: 2, title: 'Laws of Motion', subject: 'Science', topic: 'Physics', views: 890, date: '2024-03-12', points: 320, thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=400' },
];

const SUBJECTS = ['Math', 'Science', 'English', 'History'];

// --- Reusable Components ---

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, icon: Icon, color }: any) => (
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

// --- Main Pages ---

const DashboardOverview = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Videos" value="24" icon={Video} color="bg-emerald-500" />
      <StatCard title="Students Reached" value="12,450" icon={User} color="bg-blue-500" />
      <StatCard title="Total Points" value="8,290" icon={TrendingUp} color="bg-amber-500" />
      <StatCard title="Earnings" value="₹ 14,200" icon={IndianRupee} color="bg-purple-500" />
    </div>
    
    <Card>
      <h3 className="font-semibold text-gray-800 mb-4">Recent Performance</h3>
      <div className="h-48 flex items-end justify-between px-4 pb-2 border-b border-gray-100">
        {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
          <div key={i} className="w-8 bg-emerald-100 hover:bg-emerald-400 transition-colors rounded-t-md" style={{ height: `${h}%` }}></div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
      </div>
    </Card>
  </div>
);
const UploadMaterial = () => {
  const [uploadType, setUploadType] = useState<UploadType>('video');
  const [notesType, setNotesType] = useState<NotesType>('pdf');

  return (
    <div className="bg-white rounded-xl p-6 max-w-2xl mx-auto border-t-4 border-emerald-600 shadow">
      
      {/* Toggle */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
        <button 
          onClick={() => setUploadType('video')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
            uploadType === 'video' ? 'bg-white text-emerald-600' : 'text-gray-500'
          }`}
        >
          <Video size={18}/> Video
        </button>

        <button 
          onClick={() => setUploadType('notes')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
            uploadType === 'notes' ? 'bg-white text-emerald-600' : 'text-gray-500'
          }`}
        >
          <FileText size={18}/> Notes
        </button>
      </div>

      {/* Form */}
      <form className="space-y-4">
        
        <input 
          type="text"
          placeholder={uploadType === 'video' ? "Video Title" : "Notes Title"}
          className="w-full p-2 border rounded-lg"
        />

        {/* Subject + Topic */}
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="Subject" className="p-2 border rounded-lg"/>
          <input placeholder="Topic" className="p-2 border rounded-lg"/>
        </div>

        {/* VIDEO */}
        {uploadType === 'video' ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="border-dashed border-2 p-6 text-center rounded-lg">
              <Upload className="mx-auto mb-2"/>
              Upload Video
            </div>
            <div className="border-dashed border-2 p-6 text-center rounded-lg">
              <Plus className="mx-auto mb-2"/>
              Upload Thumbnail
            </div>
          </div>
        ) : (
          
          /* NOTES */
          <div>
            <div className="flex gap-4 mb-4">
              <label>
                <input 
                  type="radio" 
                  checked={notesType === 'pdf'} 
                  onChange={() => setNotesType('pdf')}
                /> PDF
              </label>

              <label>
                <input 
                  type="radio" 
                  checked={notesType === 'image'} 
                  onChange={() => setNotesType('image')}
                /> Image
              </label>
            </div>

            <div className="border-dashed border-2 p-8 text-center rounded-lg">
              {notesType === 'pdf' ? <File size={28}/> : <ImageIcon size={28}/>}
              <p className="mt-2">Upload {notesType}</p>
            </div>
          </div>
        )}

        <textarea 
          placeholder="Description"
          className="w-full p-2 border rounded-lg"
        />

        <button className="w-full bg-emerald-600 text-white py-2 rounded-lg">
          Publish {uploadType}
        </button>
      </form>
    </div>
  );
};

const ViewClasses = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {MOCK_VIDEOS.map((video) => (
      <Card key={video.id} className="overflow-hidden p-0 hover:shadow-md transition-shadow">
        <img src={video.thumbnail} alt="thumb" className="w-full h-40 object-cover" />
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">{video.subject}</span>
            <span className="text-xs text-gray-400">{video.date}</span>
          </div>
          <h4 className="font-bold text-gray-800 mb-1">{video.title}</h4>
          <p className="text-sm text-gray-500 mb-4">{video.topic}</p>
          <div className="flex justify-between items-center pt-4 border-t border-gray-50">
            <div className="flex items-center text-sm text-gray-600">
              <PlayCircle size={16} className="mr-1 text-gray-400" /> {video.views}
            </div>
            <div className="text-sm font-medium text-amber-600">{video.points} pts</div>
          </div>
        </div>
      </Card>
    ))}
  </div>
);

// const UploadMaterial = () => (
//   <Card className="max-w-2xl mx-auto">
//     <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
//         <input type="text" className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Enter title" />
//       </div>
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
//           <select className="w-full p-2 border border-gray-200 rounded-lg outline-none">
//             {SUBJECTS.map(s => <option key={s}>{s}</option>)}
//           </select>
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
//           <input type="text" className="w-full p-2 border border-gray-200 rounded-lg outline-none" placeholder="e.g. Calculus" />
//         </div>
//       </div>
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Video File</label>
//           <div className="border-2 border-dashed border-gray-200 p-4 rounded-lg text-center hover:bg-gray-50 cursor-pointer">
//             <Upload className="mx-auto text-gray-400 mb-2" size={20} />
//             <span className="text-xs text-gray-500">MP4, WebM (Max 500MB)</span>
//           </div>
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
//           <div className="border-2 border-dashed border-gray-200 p-4 rounded-lg text-center hover:bg-gray-50 cursor-pointer">
//             <Plus className="mx-auto text-gray-400 mb-2" size={20} />
//             <span className="text-xs text-gray-500">JPG, PNG (16:9)</span>
//           </div>
//         </div>
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//         <textarea className="w-full p-2 border border-gray-200 rounded-lg outline-none h-24" placeholder="Describe the lesson..."></textarea>
//       </div>
//       <button className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100">
//         Publish Video
//       </button>
//     </form>
//   </Card>
// );

const EarningsPage = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-emerald-600 text-white border-none">
        <p className="opacity-80 text-sm">Wallet Balance</p>
        <h2 className="text-3xl font-bold mt-1">₹ 14,200.00</h2>
        <button className="mt-4 bg-white/20 w-full py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">Withdraw to Bank</button>
      </Card>
      <StatCard title="Points Earned" value="8,290" icon={TrendingUp} color="bg-amber-500" />
      <StatCard title="Ad Revenue" value="₹ 4,120" icon={IndianRupee} color="bg-blue-500" />
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

// --- Main Dashboard Shell ---

export default function VidyaPathDashboard() {
  const [activeSection, setActiveSection] = useState<Section>('Dashboard');
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'View Classes', icon: Video },
    { name: 'Subjects', icon: BookOpen },
    { name: 'Topics', icon: Layers },
    { name: 'Upload Material', icon: Upload },
    { name: 'Earnings', icon: IndianRupee },
  ];

  const handleTeacherLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'Dashboard': return <DashboardOverview />;
      case 'View Classes': return <ViewClasses />;
      case 'Upload Material': return <UploadMaterial />;
      case 'Earnings': return <EarningsPage />;
      default: return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <Layers size={48} className="mb-2 opacity-20" />
          <p>The {activeSection} module is under development.</p>
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col hidden lg:flex">
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
              onClick={() => setActiveSection(item.name as Section)}
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
        {/* Navbar */}
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
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button
              onClick={() => navigate('/teacher/profile')}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <User size={16} />
              Profile
            </button>
            <button
              onClick={handleTeacherLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
            >
              <LogOut size={16} />
              Logout
            </button>
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">Aditya Prakash</p>
                <p className="text-xs text-gray-400">Senior Educator</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-full border-2 border-emerald-50 overflow-hidden">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya" 
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
            {activeSection !== 'Upload Material' && (
              <button 
                onClick={() => setActiveSection('Upload Material')}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-emerald-700 transition-shadow shadow-md shadow-emerald-100"
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