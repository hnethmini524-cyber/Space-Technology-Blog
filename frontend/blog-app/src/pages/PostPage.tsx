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
  MoreHorizontal
} from 'lucide-react';
import { apiService, Post } from '../services/apiService';

interface PostPageProps {
  isAuthenticated?: boolean;
  currentUserId?: string;
}

// Basic interface for Comments - replace with your actual API type
interface Comment {
  id: string;
  content: string;
  userName: string;
  userProfile?: string;
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
  
  // Comment specific states
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const isAuthor = isAuthenticated && currentUserId === post.author?.id;

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
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Card className="w-full shadow-none border-none bg-transparent">
        <CardHeader className="flex flex-col items-start gap-3">
          <div className="flex justify-between w-full">
            <Button
              as={Link}
              to="/"
              variant="flat"
              startContent={<ArrowLeft size={16} />}
              size="sm"
            >
              Back to Posts
            </Button>
            <div className="flex gap-2">
              {isAuthenticated && (
                <>
                  <Button
                    as={Link}
                    to={`/posts/${post.id}/edit`}
                    color="primary"
                    variant="flat"
                    startContent={<Edit size={16} />}
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    color="danger"
                    variant="flat"
                    startContent={<Trash size={16} />}
                    onClick={handleDelete}
                    isLoading={isDeleting}
                    size="sm"
                  >
                    Delete
                  </Button>
                </>
              )}
              <Button
                variant="flat"
                startContent={<Share size={16} />}
                onClick={handleShare}
                size="sm"
              >
                Share
              </Button>
            </div>
          </div>
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar
                name={post.author?.name}
                size="sm"
              />
              <span className="text-default-600">{post.author?.name}</span>
            </div>
            <div className="flex items-center gap-2 text-default-500">
              <Calendar size={16} />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-default-500">
              <Clock size={16} />
              <span>{post.readingTime} min read</span>
            </div>
          </div>
        </CardHeader>

        <Divider className="my-6" />

        <CardBody className="px-0 py-4">
          {post.imageUrl && (
            <img src={post.imageUrl} alt={post.title} className="w-full max-h-[450px] object-cover rounded-lg"/>
          )}
          <div 
            className="prose prose-lg max-w-none prose-slate"
            dangerouslySetInnerHTML={createSanitizedHTML(post.content)}
          />
        </CardBody>

        <CardFooter className="flex flex-col items-start gap-6 px-0">
          <div className="flex flex-wrap gap-2">
            <Chip color="primary" variant="flat" size="sm">{post.category.name}</Chip>
            {post.tags.map((tag) => (
              <Chip key={tag.id} variant="dot" size="sm" startContent={<Tag size={12} />}>{tag.name}</Chip>
            ))}
          </div>
          
          <Divider className="mt-4" />

          {/* --- RESPONSES SECTION --- */}
          <div className="w-full mt-8 space-y-10">
            <h2 className="text-2xl font-bold text-gray-900">Responses ({comments.length})</h2>
            
            {/* Input Area */}
            <Card className="p-5 shadow-md border border-default-100">
              <div className="flex gap-3 items-center mb-4">
                <Avatar size="sm" name={post.author?.name} />
                <span className="text-sm font-medium text-default-600">{post.author?.name}</span>
              </div>
              <Textarea
                ref={textareaRef}
                placeholder="What are your thoughts?"
                variant="flat"
                minRows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                classNames={{
                  input: "text-lg",
                  inputWrapper: "bg-transparent border-none p-0"
                }}
              />
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="light" radius="full" size="sm" onClick={() => setCommentText("")}>
                  Cancel
                </Button>
                <Button 
                  color="success" 
                  radius="full" 
                  size="sm" 
                  className="px-6 text-white font-medium"
                  isDisabled={!commentText.trim()}
                  isLoading={isSubmitting}
                  onClick={handleCommentSubmit}
                >
                  Respond
                </Button>
              </div>
            </Card>

            {/* Comments List */}
            <div className="space-y-12 pb-20">
              {comments.map((comment) => (
                <div key={comment.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <Avatar name={comment.userName} size="sm" radius="full" />
                      <div>
                        <p className="font-bold text-sm text-gray-900">{comment.userName}</p>
                        <p className="text-xs text-default-500">{formatDate(comment.createdAt)}</p>
                      </div>
                    </div>
                    <Button isIconOnly variant="light" radius="full" size="sm">
                      <MoreHorizontal size={18} className="text-default-400" />
                    </Button>
                  </div>
                  
                  <p className="mt-3 text-gray-700 text-md leading-relaxed">
                    {renderCommentContent(comment.content)}
                  </p>

                  <div className="flex items-center gap-6 mt-4">
                    <button onClick={() => handleLikeComment(comment.id)} className="flex items-center gap-1.5 text-default-500 hover:text-black transition-colors text-sm">
                      <ThumbsUp size={16} className={comment.likes > 0 ? "fill-primary text-primary" : ""}/> 
                      <span className="font-medium">{comment.likes}</span>
                    </button>
                    <button onClick={() => handleReplyTrigger(comment.userName)} className="flex items-center gap-1.5 text-default-500 hover:text-black transition-colors text-sm">
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

