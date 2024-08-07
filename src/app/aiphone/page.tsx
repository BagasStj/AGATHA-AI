
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import PhoneCall from "./components/PhoneCall";

export default function AIPhonePage() {
  return (
    <div className="p-4 flex items-center justify-center">
      <Card className="w-[90vw] h-[100vh] overflow-hidden shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">AI Phone Call</CardTitle>
          <CardDescription>
            Make AI-powered phone calls with vapi.ai
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-grow">
          <div className="w-[100%] h-[85vh] p-4 flex items-center justify-center bg-gray-100">
            <Card className="w-full h-full overflow-hidden">
              <PhoneCall />
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}