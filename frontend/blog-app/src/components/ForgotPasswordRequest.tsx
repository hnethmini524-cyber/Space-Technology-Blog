import React, { useState } from 'react';
import { Button, Input, Card, CardBody, CardHeader } from '@nextui-org/react';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { apiService } from "../services/apiService";

const ForgotPasswordRequest = ({ onBack }: { onBack: () => void }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await apiService.requestPasswordReset(email);
      setIsSent(true);
    } catch (error) {
      console.error("Reset request failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-[#0b1121]/90 border border-white/10 backdrop-blur-md">
      <CardHeader className="flex flex-col gap-1 items-start px-6 pt-6">
        <h2 className="text-xl font-bold text-white">Reset Access</h2>
        <p className="text-sm text-gray-400">Enter your email to receive a secure recovery link.</p>
      </CardHeader>
      
      <CardBody className="p-6">
        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email Address"
              className="text-white/60"
              placeholder="commander@space.com"
              variant="bordered"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startContent={<Mail className="text-gray-400" size={18} />}
              isRequired
            />
            <Button 
              type="submit" 
              color="primary" 
              className="w-full font-bold" 
              isLoading={isLoading}
              endContent={!isLoading && <Send size={18} />}
            >
              Send Recovery Link
            </Button>
            <Button 
              variant="light" 
              size="sm" 
              className="text-gray-400 hover:text-white" 
              onClick={onBack}
              startContent={<ArrowLeft size={16} />}
            >
              Back to Login
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="bg-green-500/20 text-green-400 p-4 rounded-xl border border-green-500/30">
              Check your inbox! If an account exists, a link has been sent.
            </div>
            <Button variant="flat" onClick={onBack} className="w-full text-white">
              Return to Login
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ForgotPasswordRequest;