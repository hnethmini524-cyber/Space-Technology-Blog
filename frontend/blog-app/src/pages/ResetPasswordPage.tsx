import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Input, Card, CardBody, CardHeader } from '@nextui-org/react';
import { Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { apiService } from "../services/apiService";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token"); // Capture token from URL

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Guard clause: check if token actually exists
    if (!token) {
      setError("Invalid or missing reset token. Please check your email link.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      // Now TypeScript knows 'token' is a string here
      await apiService.resetPassword({ token, password });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "This link has expired or is invalid.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030617] p-4">
      <Card className="w-full max-w-md bg-[#0b1121]/90 border border-purple-500/30 backdrop-blur-xl">
        <CardHeader className="flex flex-col gap-1 items-start px-6 pt-6">
          <h2 className="text-2xl font-bold text-white">New Credentials</h2>
          <p className="text-sm text-gray-400">Secure your orbit with a new password.</p>
        </CardHeader>

        <CardBody className="p-6">
          {!isSuccess ? (
            <form onSubmit={handleReset} className="space-y-4">
              <Input
                type="password"
                label="New Password"
                variant="bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                startContent={<Lock size={18} className="text-gray-400" />}
                isRequired
              />
              <Input
                type="password"
                label="Confirm Password"
                variant="bordered"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                startContent={<Lock size={18} className="text-gray-400" />}
                isRequired
              />
              
              {error && <p className="text-xs text-red-400">{error}</p>}

              <Button 
                type="submit" 
                color="secondary" 
                className="w-full bg-[#9614d0] font-bold"
                isLoading={isLoading}
              >
                Update Password
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center"><CheckCircle size={48} className="text-green-400" /></div>
              <p className="text-white">Password successfully updated!</p>
              <Button color="primary" variant="flat" onClick={() => navigate('/login')} className="w-full">
                Go to Sign In <ArrowRight size={16} />
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;