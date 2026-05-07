import React, { useEffect, useState} from 'react';
import { 
  Card, 
  CardHeader, 
  CardBody,
  Tabs, 
  Tab,
} from '@nextui-org/react';
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
              <Tabs 
                selectedKey={selectedCategory} 
                onSelectionChange={(key) => {
                  handleCategoryChange(key as string)
                }}
                variant="underlined"
                classNames={{
                  tabList: "gap-6",
                  cursor: "w-full bg-primary",
                  tabContent: "group-data-[selected=true]:text-cyan-400",
                }}
              >
                <Tab key="all" title="All Posts"/>
                {categories.map((category) => (
                  <Tab 
                    key={category.id} 
                    title={`${category.name} (${category.postCount})`}
                  />
                ))}
              </Tabs>

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
        /* Normal PostList display */
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