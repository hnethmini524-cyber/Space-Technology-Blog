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
import { apiService, Post, PostStatus, UserDto } from '../services/apiService';
import PostList from '../components/PostList';

//Fuction to handle empty state
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
  // States for Data
  const [publishedPosts, setPublishedPosts] = useState<Post[]>([]);
  const [drafts, setDrafts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("updatedAt,desc");
  const [userProfile, setUserProfile] = useState<UserDto | null>(null);
  
  const formatDate = (dateString: string) => { return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',month: 'long', day: 'numeric'});
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetching Published and Drafts in parallel
        const [userRes, postsRes, draftsRes] = await Promise.all([
          apiService.fetchCurrentUser(),
          apiService.getMyPosts({ status: PostStatus.PUBLISHED }),
          apiService.getDrafts({ page: 0, size: 10 })
        ]);

        console.log("Published Posts:", postsRes);
        
        setUserProfile(userRes);
        setPublishedPosts(postsRes);
        setDrafts(draftsRes);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch profile data", err);
        setError("Could not load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
  <div className="min-h-screen bg-[#030617] text-white overflow-y-auto px-4 py-6 md:py-10">
    <div className="starfield" />
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10">
      
      {/* Left side: Content tabs */}
      <div className="w-full md:flex-grow order-2 md:order-1">
        <Tabs 
          variant="underlined" 
          color="primary"
          classNames={{
            base: "w-full overflow-x-auto", 
            tabList: "gap-4 md:gap-6 w-full relative rounded-none border-b border-divider",
            cursor: "w-full bg-primary",
            tab: "max-w-fit px-2 md:px-0 h-12 text-white/70",
            tabContent: "group-data-[selected=true]:text-white font-semibold text-sm md:text-base"
          }}
        >
          <Tab key="posts" title={
            <div className="flex items-center space-x-2">
              <span>My Posts</span>
              <Chip size="sm" variant="flat" className="bg-white/10 text-white/90">
                {publishedPosts?.length || 0}
              </Chip>
            </div>
          }>
            <div className="mt-6 md:mt-8">
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

          <Tab key="drafts" title={
            <div className="flex items-center space-x-2">
              <span>My Drafts</span>
              <Chip size="sm" variant="flat" className="bg-white/10 text-white/90">
                {drafts?.length || 0}
              </Chip>
            </div>
          }>
            <div className="mt-6 md:mt-8">
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

      {/* Vertical divider */}
      <div className="hidden md:block w-px border-l border-white/10 shrink-0 self-stretch" />

      {/* Right side: User details */}
      <div className="w-full md:w-64 shrink-0 order-1 md:order-2">
        <Card className="bg-transparent shadow-none border-none md:sticky md:top-10">
          <CardBody className="flex flex-col items-center p-0">
            <Avatar 
              showFallback
              src={undefined}
              fallback={<UserRound className="w-12 h-12 md:w-20 md:h-20 text-white/60" />}
              // Scaled size for mobile
              className="w-32 h-32 md:w-40 md:h-40 bg-space-800 border-4 border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]" 
              radius="full"
            />
            
            <h2 className="text-xl md:text-2xl font-bold mt-4 md:mt-6 text-center text-white/80">
              Explorer: {userProfile?.userName}
            </h2>

            {/* User info grid - two columns on mobile, single on desktop */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 mt-6 md:mt-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white/40">
                  <Mail size={14} />
                  <p className="text-xs md:text-sm font-medium">Email:</p>
                </div>
                <p className="text-xs md:text-sm font-medium text-cyan-400 truncate">{userProfile?.email}</p>
              </div>
              
              <Divider className="bg-white/10 sm:hidden md:block" />

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white/40">
                  <CalendarDays size={14} />
                  <p className="text-xs md:text-sm font-medium">Created At:</p>
                </div>
                <p className="px-1 text-xs md:text-sm font-medium uppercase tracking-wider text-cyan-400">
                  {userProfile?.createdAt ? formatDate(userProfile.createdAt) : "Not available"}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        {/* Mobile-only divider after profile card */}
        <Divider className="bg-white/10 mt-8 md:hidden" />
      </div>

    </div>
  </div>
);
};

export default ProfilePage;