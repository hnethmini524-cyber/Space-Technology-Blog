import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import EditPostPage from "./pages/EditPostPage";
import PostPage from "./pages/PostPage";
import CategoriesPage from "./pages/CategoriesPage";
import TagsPage from "./pages/TagsPage";
import DraftsPage from "./pages/DraftsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from './pages/RegisterPage';
import { AuthProvider, useAuth } from "./components/AuthContext";
import ProfilePage from "./pages/ProfilePage";
import ResetPasswordPage from './pages/ResetPasswordPage';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <BrowserRouter>
    <div className="flex flex-col min-h-screen">
      <NavBar 
        isAuthenticated={isAuthenticated}
        userProfile={user ? {
          name: user.userName,
          avatar: undefined // Add avatar support if needed
        } : undefined}
        onLogout={logout}
      />
      <main className="container mx-auto py-6 flex-grow pb-24">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/posts/new" 
            element={
              <ProtectedRoute>
                <EditPostPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/posts/:id" element={<PostPage isAuthenticated={isAuthenticated}/>} />
          <Route 
            path="/posts/:id/edit" 
            element={
              <ProtectedRoute>
                <EditPostPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/categories" element={<CategoriesPage isAuthenticated={isAuthenticated}/>} />
          <Route path="/tags" element={<TagsPage isAuthenticated={isAuthenticated}/>} />
          <Route 
            path="/posts/drafts" 
            element={
              <ProtectedRoute>
                <DraftsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      <Footer />
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
} 

export default App;