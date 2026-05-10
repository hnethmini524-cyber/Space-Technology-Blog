import React, { useEffect, useState, useRef} from 'react';
import { 
  Card, 
  CardHeader, 
  CardBody,
  Tabs, 
  Tab,
} from '@nextui-org/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService, Post, Category, Tag } from '../services/apiService';
import PostList from '../components/PostList';

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt,desc");
  const [selectedCategory, setSelectedCategory] = useState<string|undefined>(undefined);
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);

  // arrows
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postsResponse, categoriesResponse, tagsResponse] = await Promise.all([
          apiService.getPosts({      
            categoryId: selectedCategory != undefined ? selectedCategory : undefined,
            tagId: selectedTag || undefined
          }),
          apiService.getCategories(),
          apiService.getTags()
        ]);

        setPosts(postsResponse);
        setCategories(categoriesResponse);
        setTags(tagsResponse);
        setError(null);
      } catch (err) {
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, sortBy, selectedCategory, selectedTag]);

  useEffect(() => {
    checkScrollPosition();

    window.addEventListener('resize', checkScrollPosition);

    return () => {
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [categories]);

  const checkScrollPosition = () => {
    const container = tabsContainerRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 5);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    const container = tabsContainerRef.current;

    if (!container) return;
    const scrollAmount = 250;

    container.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });

    setTimeout(checkScrollPosition, 300);
  };

  const handleCategoryChange = (categoryId: string|undefined) => {
    if("all" === categoryId){
      setSelectedCategory(undefined)
    } else {
      setSelectedCategory(categoryId);
    }
  };

  return (
    <div className="min-h-screen w-full text-white ">
      <div className="starfield" />
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <Card className="space-card mb-6 px-2">
          <CardHeader>
            <h1 className="text-2xl font-bold text-slate-400">Blog Posts</h1>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-4">                     
              <div className="relative flex items-center">

              {/* left arrow */}
              {showLeftArrow && (
                <button
                  onClick={() => scrollTabs('left')}
                  className="absolute left-0 z-20 h-10 w-10 rounded-full 
                  bg-black/40 backdrop-blur-md border border-white/10
                  flex items-center justify-center text-white
                  hover:bg-black transition"
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              <div
                ref={tabsContainerRef}
                onScroll={checkScrollPosition}
                className="overflow-x-auto scrollbar-hide w-full px-10"
              >
                  <Tabs
                    selectedKey={selectedCategory}
                    onSelectionChange={(key) => {
                      handleCategoryChange(key as string);
                    }}
                    variant="underlined"
                    classNames={{
                      tabList: "gap-6 flex-nowrap w-max",
                      cursor: "w-full bg-primary",
                      tabContent:
                        "group-data-[selected=true]:text-cyan-400 whitespace-nowrap",
                    }}
                  >
                    <Tab key="all" title="All Posts" />

                    {categories.map((category) => (
                      <Tab
                        key={category.id}
                        title={`${category.name} (${category.postCount})`}
                      />
                    ))}
                  </Tabs>
                </div>

                {/* Right arrow */}
                {showRightArrow && (
                  <button
                    onClick={() => scrollTabs('right')}
                    className="absolute right-0 z-20 h-10 w-10 rounded-full 
                    bg-black/40 backdrop-blur-md border border-white/10
                    flex items-center justify-center text-white
                    hover:bg-black transition"
                  >
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>

              {tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => setSelectedTag(selectedTag == tag.id ? undefined : tag.id)}
                      className={`tag-asteroid ${selectedTag === tag.id ? 'tag-asteroid-active' : ''}`}
                    >
                      {tag.name} ({tag.postCount})
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      {loading ? (
        <PostList
          posts={posts}
          loading={loading}
          error={error}
          page={page}
          sortBy={sortBy}
          onPageChange={setPage}
          onSortChange={setSortBy}
        />
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full" />
            <span className="text-8xl">🚀</span>
          </div>
          <div className="space-y-2 relative">
            <h3 className="text-2xl font-semibold text-white">This sector is empty</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              We couldn't find any posts in this category. 
              Try exploring a different orbit or check back later!
            </p>
            <button 
              //variant="flat" 
              color="primary" 
              onClick={() => handleCategoryChange('all')}
              className="mt-4"
            >
              Return to Home Base
            </button>
          </div>
        </div>
      ) : (
        /* Normal postlist display */
        <PostList
          posts={posts}
          loading={loading}
          error={error}
          page={page}
          sortBy={sortBy}
          onPageChange={setPage}
          onSortChange={setSortBy}
        />
      )}
      </div>
    </div>
  );
};

export default HomePage;