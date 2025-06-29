
import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";

const SignInPage = () => {
  return (
    <div className="min-h-screen bg-[#FDF6F0] flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">Talkflo</h1>
          <div className="w-12 h-1 bg-orange-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 mb-8">
            Go from fuzzy thought to clear text. <em>Fast.</em>
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Welcome to Talkflo
          </h2>
          <p className="text-gray-600 mb-8 text-center">
            Sign in to start recording your thoughts and converting them to clear text.
          </p>
          
          <div className="space-y-4">
            <SignInButton mode="modal">
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg">
                Sign In
              </Button>
            </SignInButton>
            
            <SignUpButton mode="modal">
              <Button variant="outline" className="w-full py-3 text-lg border-orange-200 text-orange-600 hover:bg-orange-50">
                Create Account
              </Button>
            </SignUpButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
