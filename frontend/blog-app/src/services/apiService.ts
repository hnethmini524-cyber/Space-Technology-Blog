import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresIn: number;
}

export interface UserDto {
  userId: string;
  userName: string;
  email: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  postCount?: number;
}

export interface Tag {
  id: string;
  name: string;
  postCount?: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  author?: {
    id: string;
    name: string;
  };
  category: Category;
  tags: Tag[];
  readingTime?: number;
  createdAt: string;
  updatedAt: string;
  status?: PostStatus;
  clapCount: number;
}

export interface Comment {
  id: string;
  content: string;
  userName: string;
  userProfile?: string;
  createdAt: string;
  likes: number;
  userId: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  categoryId: string;
  tagIds: string[];
  status: PostStatus;
  imageUrl?: string;
}

export interface UpdatePostRequest extends CreatePostRequest {
  id: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED'
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password?: string; // Optional if you handle confirmation logic in-service or component
}

export interface MessageResponse {
  message: string;
}

class ApiService {
  private api: AxiosInstance;
  private static instance: ApiService;

  private constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:8080/api/v1',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response?.data) {
      return error.response.data as ApiError;
    }
    return {
      status: 500,
      message: 'An unexpected error occurred'
    };
  }

  // Auth endpoints
  public async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials);
    localStorage.setItem('token', response.data.token);
    return response.data;
  }

  public async register(data: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', data);
    // Auto-login after successful registration
    localStorage.setItem('token', response.data.token);
    return response.data;
  }

  // Method to fetch the profile
  public async fetchCurrentUser(): Promise<UserDto> {
    const response: AxiosResponse<UserDto> = await this.api.get('/users/me');
    return response.data;
  }

  public async requestPasswordReset(email: string): Promise<MessageResponse> {
    const response: AxiosResponse<MessageResponse> = await this.api.post('/auth/forgot-password', { email });
    return response.data;
  }

  public async resetPassword(data: ResetPasswordRequest): Promise<MessageResponse> {
    const response: AxiosResponse<MessageResponse> = await this.api.post('/auth/reset-password', data);
    return response.data;
  }

  public logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/login';
  }

  // Posts endpoints
  public async getPosts(params: {
    categoryId?: string;
    tagId?: string;
  }): Promise<Post[]> {
    const response: AxiosResponse<Post[]> = await this.api.get('/posts', { params });
    return response.data;
  }

  public async getPost(id: string): Promise<Post> {
    const response: AxiosResponse<Post> = await this.api.get(`/posts/${id}`);
    return response.data;
  }

  public async createPost(post: CreatePostRequest): Promise<Post> {
    const response: AxiosResponse<Post> = await this.api.post('/posts', post);
    return response.data;
  }

  public async updatePost(id: string, post: UpdatePostRequest): Promise<Post> {
    const response: AxiosResponse<Post> = await this.api.put(`/posts/${id}`, post);
    return response.data;
  }

  public async deletePost(id: string): Promise<void> {
    await this.api.delete(`/posts/${id}`);
  }

  public async getDrafts(params: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<Post[]> {
    const response: AxiosResponse<Post[]> = await this.api.get('/posts/drafts', { params });
    return response.data;
  }

  // Categories endpoints
  public async getCategories(): Promise<Category[]> {
    const response: AxiosResponse<Category[]> = await this.api.get('/categories');
    return response.data;
  }

  public async createCategory(name: string): Promise<Category> {
    const response: AxiosResponse<Category> = await this.api.post('/categories', { name });
    return response.data;
  }

  public async deleteCategory(id: string): Promise<void> {
    await this.api.delete(`/categories/${id}`);
  }

  // Tags endpoints
  public async getTags(): Promise<Tag[]> {
    const response: AxiosResponse<Tag[]> = await this.api.get('/tags');
    return response.data;
  }

  public async createTags(names: string[]): Promise<Tag[]> {
    const response: AxiosResponse<Tag[]> = await this.api.post('/tags', { names });
    return response.data;
  }

  public async deleteTag(id: string): Promise<void> {
    await this.api.delete(`/tags/${id}`);
  }

  // Add comments
  public async getCommentsByPost(postId: string): Promise<Comment[]> {
    const response: AxiosResponse<Comment[]> = await this.api.get(`/posts/${postId}/comments`);
    return response.data;
  }


  public async addComment(postId: string, content: string): Promise<Comment> {
    const response: AxiosResponse<Comment> = await this.api.post(`/posts/${postId}/comments`, { content });
    return response.data;
  } 

  public async likeComment(commentId: string): Promise<number> {
    const response = await this.api.post(`/comments/${commentId}/like`);
    return response.data.likes; 
  }

  public async deleteComment(commentId: string): Promise<void> {
    await this.api.delete(`/comments/${commentId}`);
  }

  // Inside ApiService class in apiService.ts
  public async clapPost(postId: string): Promise<number> {
    const response = await this.api.patch(`/posts/${postId}/clap`); 
    return response.data.clapCount; 
  }

  public async getMyPosts(params: {
    page?: number;
    size?: number;
    sort?: string;
    status: PostStatus; // We can filter by status here
  }): Promise<Post[]> {
      const response: AxiosResponse<Post[]> = await this.api.get('/posts/me', { params });
      return response.data;
  }

  // Image upload
  public async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    //const response = await this.api.post('/images/upload', formData);
    const response = await this.api.post("/images/upload",formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      }
    );
    return response.data;
  }

}

// Export a singleton instance
export const apiService = ApiService.getInstance();