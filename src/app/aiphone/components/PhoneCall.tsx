'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { PhoneIcon, MicIcon, PhoneOffIcon, Settings } from 'lucide-react';
import VapiClient from '@vapi-ai/web';

const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY;

export default function PhoneCall() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState('');
  const { toast } = useToast();
  const [vapiClient, setVapiClient] = useState<VapiClient | null>(null);
  const [temperature, setTemperature] = useState(0.7);
  const [voiceId, setVoiceId] = useState("21m00Tcm4TlvDq8ikWAM");
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [language, setLanguage] = useState("en-US");
  const [callHistory, setCallHistory] = useState<{ number: string; date: string; duration: string }[]>([
    { number: "+1234567890", date: "2023-05-01 14:30", duration: "5m 23s" },
    { number: "+9876543210", date: "2023-05-02 10:15", duration: "3m 45s" },
    { number: "+1122334455", date: "2023-05-03 16:45", duration: "8m 12s" },
    { number: "+5544332211", date: "2023-05-04 09:00", duration: "2m 56s" },
    { number: "+6677889900", date: "2023-05-05 13:20", duration: "6m 39s" },
  ]);

  useEffect(() => {
    if (VAPI_API_KEY) {
      const client = new VapiClient(VAPI_API_KEY);
      setVapiClient(client);
    }
  }, []);

  const startCall = useCallback(async (number: string) => {
    if (!number) {
      toast({
        title: "Error",
        description: "Please enter a phone number.",
        duration: 3000,
        variant: "destructive",
      });
      return;
    }

    if (!vapiClient) {
      toast({
        title: "Error",
        description: "Vapi client is not initialized.",
        duration: 3000,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCallActive(true);
      setCallStatus('Calling...');

      // const call = await vapiClient.createCall({
      //   phoneNumber: number,
      //   assistant: {
      //     name: "AI Assistant",
      //     model: {
      //       provider: "openai",
      //       model: model,
      //       temperature: temperature,
      //     },
      //     voice: {
      //       provider: "11labs",
      //       voiceId: voiceId,
      //     },
      //     language: language,
      //   },
      // });

      // call.on('ringing', () => setCallStatus('Ringing...'));
      // call.on('connected', () => setCallStatus('Connected'));
      // call.on('ended', () => {
      //   setCallStatus('Call ended');
      //   setIsCallActive(false);
      // });

      // setCallHistory(prev => [...prev, { number, date: new Date().toLocaleString() }]);

    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Error",
        description: "Failed to start the call. Please try again.",
        duration: 3000,
        variant: "destructive",
      });
      setIsCallActive(false);
    }
  }, [toast, vapiClient, temperature, voiceId, model, language]);

  const endCall = useCallback(() => {
    // if (vapiClient) {
    //   vapiClient.endCall();
    // }
    setIsCallActive(false);
    setCallStatus('Call ended');
  }, [vapiClient]);

  return (
    <div className="flex justify-center items-start space-x-8 p-8">
      {/* Left Card: AI Phone Settings */}
      <div className="bg-white rounded-lg shadow-lg p-6 w-1/2">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Settings className="mr-2" /> AI Phone Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Temperature</label>
            <Slider
              value={[temperature]}
              onValueChange={(value) => setTemperature(value[0])}
              max={1}
              step={0.1}
              className="mt-2"
            />
            <span className="text-sm text-gray-500">{temperature}</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Voice ID</label>
            <Input
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Model</label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Language</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="es-ES">Spanish (Spain)</SelectItem>
                <SelectItem value="fr-FR">French (France)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Right Card: Call History Table */}
      <div className="bg-white rounded-lg shadow-lg p-6 w-1/2">
        <h2 className="text-2xl font-bold mb-4">Call History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {callHistory.map((call, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button onClick={() => startCall(call.number)} disabled={isCallActive} className="bg-green-500 hover:bg-green-600 text-white">
                      <PhoneIcon className="mr-2 h-4 w-4" /> Call
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isCallActive && (
          <div className="mt-4">
            <Button onClick={endCall} variant="destructive" className="w-full">
              <PhoneOffIcon className="mr-2 h-4 w-4" /> End Call
            </Button>
            <div className="text-lg font-semibold text-center mt-2">
              Status: {callStatus}
            </div>
            <div className="flex justify-center mt-2">
              <MicIcon className="h-8 w-8 text-blue-500 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}