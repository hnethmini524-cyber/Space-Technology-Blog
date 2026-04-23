import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Chip,
  Button,
  Divider,
  Avatar,
  Textarea,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import { 
  Calendar,
  Clock,
  Tag,
  Edit,
  Trash,
  ArrowLeft,
  Share,
  MessageCircle, 
  ThumbsUp, 
  MoreHorizontal,
  Heart 
} from 'lucide-react';
import { apiService, Post } from '../services/apiService';

interface PostPageProps {
  isAuthenticated?: boolean;
  currentUserId?: string;
}

interface Comment {
  id: string;
  content: string;
  userName: string;
  userProfile?: string;
  userId: string;
  createdAt: string;
  likes: number;
}

const PostPage: React.FC<PostPageProps> = ({ 
  isAuthenticated,
  currentUserId
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isClapped, setIsClapped] = useState(false);
  
  // Comment specific states
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const storedId = localStorage.getItem('userId');
  const postAuthorId = post?.author?.id;

  console.log("IDs:", { storedId, postAuthorId });
  console.log("Current User ID:", storedId);
  const token = localStorage.getItem('token');

  console.log("--- AUTH CHECK ---");
  console.log("Stored UserID:", storedId);
  console.log("Token Present:", !!token); 
  console.log("------------------");

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await apiService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };
  //const currentUserId = localStorage.getItem('userId');
  const isAuthor = React.useMemo(() => {
    const sId = localStorage.getItem('userId');
    const pAuthId = post?.author?.id;
  
    if (!sId || !pAuthId) return false;
  
    // Clean comparison
    return String(sId).toLowerCase() === String(pAuthId).toLowerCase();
  }, [post, isAuthenticated]);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        if (!id) throw new Error('Post ID is required');
        
        const fetchedPost = await apiService.getPost(id);
        setPost(fetchedPost);
        
        const fetchedComments = await apiService.getCommentsByPost(id);
        setComments(fetchedComments);
        
        setError(null);
      } catch (err) {
        setError('Failed to load the post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [id]);

  const handleDelete = async () => {
    if (!post || !window.confirm('Are you sure you want to delete this post?')) return;
    try {
      setIsDeleting(true);
      await apiService.deletePost(post.id);
      navigate('/');
    } catch (err) {
      setError('Failed to delete the post. Please try again later.');
      setIsDeleting(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: post?.title,
        text: post?.content.substring(0, 100) + '...',
        url: window.location.href,
      });
    } catch (err) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !id) return;
    try {
      setIsSubmitting(true);
      const newComment = await apiService.addComment(id, commentText);
      // Add the new comment to the top of the list
      setComments(prev => [newComment, ...prev]);
      setCommentText(""); // Clear the input
    } catch (err) {
      console.error("Failed to post comment", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const updatedLikes = await apiService.likeComment(commentId);
    
      // Update the local state to show the new count
      setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === commentId 
          ? { ...comment, likes: updatedLikes } 
          : comment
        )
      );
    } catch (err) {
      console.error("Failed to like comment:", err);
    }
  };

  const handleClap = async () => {
    if (!post || !id) return;
    try {
      // Optimistic UI update
      setIsClapped(true);
      setPost(prev => prev ? { ...prev, clapCount: (prev.clapCount || 0) + 1 } : prev);
      
      await apiService.clapPost(id); // Ensure this exists in your apiService
    } catch (err) {
      console.error("Failed to clap:", err);
      // Revert if failed
      setIsClapped(false);
      setPost(prev => prev ? { ...prev, clapCount: (prev.clapCount || 0) - 1 } : prev);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const createSanitizedHTML = (content: string) => {
    return {
      __html: DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ['p', 'strong', 'em', 'br', 'h1', 'h2', 'ul', 'li'],
        ALLOWED_ATTR: []
      })
    };
  };

  const handleReplyTrigger = (userName: string) => {
    setCommentText(prev => `@${userName.replace(/\s+/g, '')} ${prev}`);
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Smooth scroll to the input area
      textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const renderCommentContent = (content: string) => {
     return content.split(' ').map((word, index) => {
     if (word.startsWith('@')) {
       return (
         <span key={index} className="text-primary font-semibold hover:underline cursor-pointer">
          {word}{' '}
         </span>
        );
      }
      return word + ' ';
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <Card className="w-full animate-pulse p-4">
          <div className="h-8 bg-default-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-default-200 rounded w-full"></div>
            <div className="h-4 bg-default-200 rounded w-full"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 mt-8 text-center">
        <p className="text-danger mb-4">{error || 'Post not found'}</p>
        <Button as={Link} to="/" color="primary" variant="flat" startContent={<ArrowLeft size={16} />}>
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-white">
      <Card className="w-full shadow-none border-none bg-transparent">
        <CardHeader className="flex flex-col items-start gap-3">
          <div className="flex justify-between w-full">
            <Button
              as={Link}
              to="/"
              variant="flat"
              startContent={<ArrowLeft size={16} />}
              size="sm"
              className="bg-white/10 text-white hover:bg-white/20"
            >
              Back to Posts
            </Button>
            <div className="flex gap-2">
              {isAuthor && (
                <>
                  <Button
                    as={Link}
                    to={`/posts/${post.id}/edit`}
                    color="primary"
                    variant="flat"
                    className="bg-blue-500/20 text-blue-400"
                    startContent={<Edit size={16} />}
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    color="danger"
                    variant="flat"
                    className="bg-red-500/20 text-red-400"
                    startContent={<Trash size={16} />}
                    onPress={handleDelete}
                    isLoading={isDeleting}
                    size="sm"
                  >
                    Delete
                  </Button>
                </>
              )}
              <Button
                variant="flat"
                className="bg-white/10 text-white"
                startContent={<Share size={16} />}
                onClick={handleShare}
                size="sm"
              >
                Share
              </Button>
            </div>
          </div>
          <h1 className="post-title text-3xl font-bold text-white tracking-tight">{post.title}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar
                name={post.author?.name}
                size="sm"
                className="ring-2 ring-primary/30"
              />
              <span className="text-white/80 font-medium">{post.author?.name}</span>
            </div>
            <div className="flex items-center gap-2 text-white/50">
              <Calendar size={16} />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-white/50">
              <Clock size={16} />
              <span>{post.readingTime} min read</span>
            </div>
          </div>
        </CardHeader>

        <Divider className="my-6 bg-white/10" />

        <CardBody className="px-0 py-4">
          {post.imageUrl && (
            <img src={post.imageUrl} alt={post.title} className="w-full max-h-[450px] object-cover rounded-lg mb-8 border border-white/10 shadow-2xl"/>
          )}
          <div 
            className="preserve-lines prose prose-lg md:prose-xl max-w-none prose-invert prose-p:leading-relaxed prose-p:my-6" 
            dangerouslySetInnerHTML={createSanitizedHTML(post.content)}
          />
        </CardBody>

        <CardFooter className="flex flex-col items-start gap-6 px-0">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="light"
              radius="full"
              size="sm"
              onPress={handleClap}
              className={`group transition-all ${isClapped ? 'text-primary bg-primary/10' : 'text-white/60 hover:text-white'}`}
              startContent={
                <Heart  
                  size={18} 
                  className={isClapped ? 'text-primary animate-pulse' : 'text-white/40'} 
                />
              }
            >
              {post.clapCount?.toLocaleString() || 0}
            </Button>

            <Button
              variant="light"
              radius="full"
              size="sm"
              onPress={() => document.getElementById('responses-heading')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-white/60 hover:text-white"
              startContent={<MessageCircle size={18} className="text-white/40" />}
            >
              {comments.length}
            </Button>
            <Chip color="primary" variant="flat" size="sm" className="border-primary/50 text-white">{post.category.name}</Chip>
            {post.tags.map((tag) => (
              <Chip key={tag.id} variant="dot" size="sm" className="border-white/20 text-white/60" startContent={<Tag size={12} />}>{tag.name}</Chip>
            ))}
          </div>
          
          <Divider className="mt-4 bg-white/10" />

          {/* --- RESPONSES SECTION --- */}
          <div className="w-full mt-8 space-y-10">
            <h2 className="text-2xl font-bold text-white">Responses ({comments.length})</h2>
            
            {/* Input Area */}
            <div className="w-full mt-8">
              {isAuthenticated ? (
                /* Logged In View: Show the standard Textarea */
                <Card className="p-5 shadow-2xl bg-[#0b1121] border border-white/10">
                  <div className="flex gap-3 items-center mb-4">
                    <Avatar size="sm" name={localStorage.getItem('userName') || 'User'} />
                    <span className="text-sm font-medium text-white/90">
                      {localStorage.getItem('userName') || 'You'}
                      </span>
                  </div>
                  <Textarea
                    ref={textareaRef}
                    placeholder="What are your thoughts?"
                    variant="underlined"
                    minRows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="space-textarea"
                    classNames={{
                      input: "text-white placeholder:text-white/30 text-base leading-relaxed",
                      inputWrapper: "border-white/10 px-0 group-data-[focus=true]:border-success",
                    }}
                  />
                  
                  <div className="flex justify-end gap-3 mt-4">
                    <Button
                      variant="light"
                      radius="full"
                      size="sm"
                      className="text-white/50"
                      onClick={() => setCommentText("")}
                    >
                     Cancel
                    </Button>
                    <Button
                      color="success"
                      radius="full"
                      size="sm"
                      className="px-8 text-white font-bold bg-success/80 shadow-lg shadow-success/20"
                      isDisabled={!commentText.trim()}
                      isLoading={isSubmitting}
                      onClick={handleCommentSubmit}
                    >
                     Respond
                    </Button>
                  </div>
                </Card>
              ) : (
                /* Unauthorized View: Show the "Log in to respond" message */
                <Card className="p-8 shadow-sm border border-dashed border-default-300 bg-default-50/50 flex flex-col items-center gap-4">
                  <div className="p-8 bg-white/5 border border-dashed border-white/20 flex flex-col items-center gap-4">
                    <MessageCircle size={32} className="text-default-400" />
                      <p className="text-default-600 font-medium">Log in to share your thoughts on this post.</p>
                  </div>
                  <Button 
                    as={Link} 
                    to="/login" 
                    color="primary" 
                    variant="solid" 
                    radius="full"
                    className="px-8"
                  >
                    Log in to respond
                  </Button>
                </Card>
                )}
            </div>
            {/* Comments List */}
            <div className="space-y-12 pb-20">
              {comments.map((comment) => (
                <div key={comment.id} className="p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <Avatar name={comment.userName} size="sm" radius="full" />
                      <div>
                        <p className="font-bold text-sm text-white">{comment.userName}</p>
                        <p className="text-xs text-white/40">{formatDate(comment.createdAt)}</p>
                      </div>
                    </div>

                    {/* DROP-DOWN MENU FOR DELETE */}
                    <Dropdown placement="bottom-end" className="dark bg-[#0b1121] border border-white/10">
                      <DropdownTrigger>
                        <Button isIconOnly variant="light" radius="full" size="sm">
                          <MoreHorizontal size={18} className="text-white/40" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Comment actions">
                         {/* Check if current user is the author of the comment OR the post author */}
                         {(storedId === comment.userId || isAuthor) ? (
                          <DropdownItem 
                              key="delete" 
                              className="text-danger" 
                              color="danger"
                              startContent={<Trash size={14} />}
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              Delete
                          </DropdownItem>
                          ) : (
                        <DropdownItem key="report">Delete</DropdownItem>
                        )}
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  
                  <p className="mt-3 text-white/80 text-md leading-relaxed">
                    {renderCommentContent(comment.content)}
                  </p>

                  <div className="flex items-center gap-6 mt-4">
                    <button onClick={() => handleLikeComment(comment.id)} className="flex items-center gap-1.5 text-default-500 hover:text-black transition-colors text-sm">
                      <ThumbsUp size={16} className={comment.likes > 0 ? "fill-primary text-primary" : ""}/> 
                      <span className="font-medium">{comment.likes}</span>
                    </button>
                    <button onClick={() => isAuthenticated ? handleReplyTrigger(comment.userName): navigate('/login')} className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-sm">
                      <MessageCircle size={16} /> 
                      <span className="font-medium">Reply</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PostPage;

