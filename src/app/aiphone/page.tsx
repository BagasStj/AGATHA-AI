import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PhoneTabs } from "./components/PhoneTabs";
import { checkRateLimit, logRateLimitedRequest } from '@/lib/rateLimit';
import { useUser } from '@clerk/nextjs';
import { useToast } from "@/components/ui/use-toast";
const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

export default function AIPhonePage() {
  const { user } = useUser();
  const { toast } = useToast();

  // Add this function to handle rate limiting
  const handleRateLimit = async () => {
    if (!user) return false;

    const { success, limit, reset, remaining } = await checkRateLimit(user.id, 'aiphone');

    if (!success) {
      await logRateLimitedRequest(user.id, user.username || '', 'aiphone');
      toast({
        title: "Rate Limit Exceeded",
        description: "You have reached your request limit for AI Phone. Please try again later.",
        duration: 5000,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return (
    <div className="p-1 flex items-center justify-center">
      <Card className="w-[92vw] h-[100vh] overflow-hidden shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">AI Phone Call</CardTitle>
          <CardDescription>
            Make AI-powered phone calls with vapi.ai
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-grow">
          <div className="w-[100%] h-[85vh] p-4 flex items-center justify-center bg-gray-100">
            <Card className="w-full h-full overflow-hidden">
              <PhoneTabs  />
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}