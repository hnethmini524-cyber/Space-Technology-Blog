import React, { useEffect, useState } from 'react';
import { 
  Tabs, 
  Tab, 
  Card, 
  CardBody, 
  Chip, 
  Avatar, 
  Divider,
  Spinner,
  Button,
} from '@nextui-org/react';
import { User, Mail, CalendarDays, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService, Post, PostStatus } from '../services/apiService';
import PostList from '../components/PostList';

//function for handle empty state
const EmptyState = ({ type }: { type: 'posts' | 'drafts' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
    <div className="relative">
      <div className="absolute inset-0 blur-3xl bg-primary/10 rounded-full" />
      <span className="text-7xl">{type === 'posts' ? '📡' : '📝'}</span>
    </div>
    <div className="relative z-10 space-y-2">
      <h3 className="text-2xl font-bold text-white tracking-tight">
        {type === 'posts' ? "No transmissions found" : "Your drafting table is clear"}
      </h3>
      <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
        {type === 'posts' 
          ? "You haven't published any space logs yet. Ready to share your discovery?" 
          : "Start a new log and save it as a draft to see it in your orbit."}
      </p>
      <Button 
        as={Link} 
        to="/posts/new" 
        className="mt-4 px-6 bg-primary/20 border border-primary/50 text-cyan-400 rounded-full hover:bg-primary/40"
      >
        Create New Post
      </Button>
    </div>
  </div>
);

const ProfilePage = () => {
  // 1. States for Data
  const [publishedPosts, setPublishedPosts] = useState<Post[]>([]);
  const [drafts, setDrafts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("updatedAt,desc");
  
  // User info from LocalStorage (set during login)
  const userName = localStorage.getItem('userName') || "Guest User";
  const userEmail = localStorage.getItem('userEmail') || "No Email Found"; 
  const userId = localStorage.getItem('userId');
  const rawDate = localStorage.getItem('userCreatedAt');
  const joinedDate = rawDate ? new Date(rawDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : "Not available";

  // 2. Fetch Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetching Published and Drafts in parallel
        const [postsRes, draftsRes] = await Promise.all([
          apiService.getMyPosts({ status: PostStatus.PUBLISHED }),
          apiService.getDrafts({ page: 0, size: 10 })
        ]);

        console.log("Published Posts:", postsRes);
        
        setPublishedPosts(postsRes);
        setDrafts(draftsRes);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch profile data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#030617] text-white overflow-y-auto px-4 py-10">
      <div className="starfield" />
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">
        
        {/* === Left Side: Content Tabs === */}
        <div className="flex-grow">
          <Tabs 
            variant="underlined" 
            color="primary"
            classNames={{
              tabList: "gap-6",
              cursor: "w-full bg-primary",
              tab: "max-w-fit px-0 h-12 text-white/70",
              tabContent: "group-data-[selected=true]:text-white font-semibold text-base"
            }}
          >
            {/* My Posts Tab */}
            <Tab key="posts" title={
              <div className="flex items-center space-x-2">
                <span>My Posts</span>
                <Chip size="sm" variant="flat" className="bg-white/10 text-white/90">
                  {publishedPosts?.length || 0}
                </Chip>
              </div>
            }>
              <div className="mt-8">
                {!loading && publishedPosts.length === 0 ? (
                  <EmptyState type="posts" />) : (
                    <PostList 
                      posts={publishedPosts} 
                      loading={loading} 
                      error={error}
                      page={page}
                      sortBy={sortBy}
                      onPageChange={setPage}
                      onSortChange={setSortBy}
                    />
                  )}
              </div>
            </Tab>

            {/* My Drafts Tab - REPLICATING DRAFTSPAGE LOGIC */}
            <Tab key="drafts" title={
              <div className="flex items-center space-x-2">
                <span>My Drafts</span>
                <Chip size="sm" variant="flat" className="bg-white/10 text-white/90">
                  {drafts?.length || 0}
                </Chip>
              </div>
            }>
              <div className="mt-8">
                {!loading && drafts.length === 0 ? (
                  <EmptyState type="drafts" />) : (
                    <PostList 
                      posts={drafts} 
                      loading={loading}
                      error={error}
                      page={page}
                      sortBy={sortBy}
                      onPageChange={setPage}
                      onSortChange={setSortBy}
                    />
                  )}
              </div>
            </Tab>
          </Tabs>
        </div>

        {/* === Vertical Divider === */}
        <div className="hidden md:block w-px border-l border-white/10 shrink-0 self-stretch" />

        {/* === Right Side: User Details === */}
        <div className="w-full md:w-64 shrink-0">
          <Card className="bg-transparent shadow-none border-none sticky top-10">
            <CardBody className="flex flex-col items-center p-0">
              <Avatar 
                showFallback
                src={undefined} // Force fallback if no image exists
                fallback={
                  <UserRound size={80} className="text-white/60" /> 
                }
                className="w-40 h-40 text-large bg-space-800 border-4 border-starlight shadow-[0_0_20px_rgba(34,211,238,0.3)]" 
                radius="full"
              />
              
              <h2 className="text-2xl font-bold mt-6 text-center text-white/80">{userName}</h2>

              <div className="w-full text-left space-y-5 mt-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-white/40">
                    <Mail size={16} />
                    <p className="text-sm font-medium">Email address:</p>
                  </div>
                  <p className="text-sm font-medium text-white/90 pl-6">{userEmail}</p>
                </div>
                
                <Divider className="bg-white/10" />

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-white/40">
                    <CalendarDays size={16} />
                    <p className="text-sm font-medium">Created At:</p>
                  </div>
                  <p className="text-sm font-medium text-white/90 pl-6 uppercase text-[10px]">
                    {joinedDate}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;