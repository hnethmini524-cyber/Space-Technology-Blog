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
import { User, Mail, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService, Post, PostStatus } from '../services/apiService';
import PostList from '../components/PostList';

const ProfilePage = () => {
  // 1. States for Data
  const [publishedPosts, setPublishedPosts] = useState<Post[] | null>(null);
  const [drafts, setDrafts] = useState<Post[] | null>(null);
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
                <PostList 
                  posts={publishedPosts} 
                  loading={loading} 
                  error={error}
                  page={page}
                  sortBy={sortBy}
                  onPageChange={setPage}
                  onSortChange={setSortBy}
                />
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
                <PostList 
                  posts={drafts} 
                  loading={loading}
                  error={error}
                  page={page}
                  sortBy={sortBy}
                  onPageChange={setPage}
                  onSortChange={setSortBy}
                />

                {drafts?.length === 0 && !loading && (
                            <div className="text-center py-8 text-default-500">
                              <p>You don't have any draft posts yet.</p>
                              <Button
                                as={Link}
                                to="/posts/new"
                                color="primary"
                                variant="flat"
                                className="mt-4 bg-[#a855f7]"
                              >
                                Create Your First Post
                              </Button>
                            </div>
                          )}
              </div>
            </Tab>
          </Tabs>
        </div>

        {/* === Vertical Divider === */}
        <div className="hidden md:block w-px border-l border-white/10 shrink-0 self-stretch" />

        {/* === Right Side: User Details === */}
        <div className="w-full md:w-80 shrink-0">
          <Card className="bg-transparent shadow-none border-none sticky top-10">
            <CardBody className="flex flex-col items-center p-0">
              <Avatar 
                name={userName} 
                className="w-40 h-40 text-large bg-black/30 border-4 border-white/10 shadow-2xl" 
                radius="full"
              />
              
              <h2 className="text-2xl font-bold mt-6 text-center">{userName}</h2>

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