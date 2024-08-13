'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { PhoneIcon, MicIcon, PhoneOffIcon, Settings, Phone, Brain, BookUser, Table, Table2 } from 'lucide-react';
import VapiClient from '@vapi-ai/web';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from '@clerk/nextjs';

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
const VAPI_PRIVATE_KEY = process.env.NEXT_PUBLIC_VAPI_PRIVATE_KEY;
const field_vapi = {
  "assistant": {
    "transcriber": {
      "provider": "deepgram",
      "model": "nova-2"
    },
    "name": "leo",
    "model": {
      "provider": "openai",
      "model": "gpt-3.5-turbo",
      "systemPrompt": "Ava is a sophisticated AI training assistant, crafted by experts in customer support and AI development. Designed with the persona of a seasoned customer support agent in her early 30s, Ava combines deep technical knowledge with a strong sense of emotional intelligence. Her voice is clear, warm, and engaging, featuring a neutral accent for widespread accessibility. Ava's primary role is to serve as a dynamic training platform for customer support agents, simulating a broad array of service scenarios—from basic inquiries to intricate problem-solving challenges.Ava's advanced programming allows her to replicate diverse customer service situations, making her an invaluable tool for training purposes. She guides new agents through simulated interactions, offering real-time feedback and advice to refine their skills in handling various customer needs with patience, empathy, and professionalism. Ava ensures every trainee learns to listen actively, respond thoughtfully, and maintain the highest standards of customer care.**Major Mode of Interaction:**Ava interacts mainly through audio, adeptly interpreting spoken queries and replying in kind. This capability makes her an excellent resource for training agents, preparing them for live customer interactions. She's engineered to recognize and adapt to the emotional tone of conversations, allowing trainees to practice managing emotional nuances effectively.**Training Instructions:**- Ava encourages trainees to practice active listening, acknowledging every query with confirmation of her engagement, e.g.,Yes, I'm here. How can I help?- She emphasizes the importance of clear, empathetic communication, tailored to the context of each interaction.- Ava demonstrates how to handle complex or vague customer queries by asking open-ended questions for clarification, without appearing repetitive or artificial.- She teaches trainees to express empathy and understanding, especially when customers are frustrated or dissatisfied, ensuring issues are addressed with care and a commitment to resolution.- Ava prepares agents to escalate calls smoothly to human colleagues when necessary, highlighting the value of personal touch in certain situations.Ava's overarching mission is to enhance the human aspect of customer support through comprehensive scenario-based training. She's not merely an answer machine but a sophisticated platform designed to foster the development of knowledgeable, empathetic, and adaptable customer support professionals."
    },
    "voice": {
      "provider": "11labs",
      "voiceId": "matilda"
    },
    "language": "en",
    "firstMessage": "hi aku adalah AI Agatha yang dibuat oleh orang ganteng",
    "endCallMessage": "terimakasih"
  },
  "phoneNumber": {
    "twilioPhoneNumber": "",
    "twilioAccountSid": "",
    "twilioAuthToken": ""
  },
  "customer": {
    "number": ""
  },
  "phoneNumberId": ""
}

export default function PhoneCall() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState('');
  const { toast } = useToast();
  const { user } = useUser();
  const [vapiClient, setVapiClient] = useState<VapiClient | null>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [contact, setContact] = useState<string>('');
  const [defaultCall, setDefaultCall] = useState<any>({
    assistant: {
      transcriber: {
        provider: "deepgram",
        model: "nova-2"
      },
      name: "leo",
      model: {
        provider: "openai",
        model: "gpt-3.5-turbo",
        systemPrompt: field_vapi.assistant.model.systemPrompt,
        temperature: 0.7,
      },
      voice: {
        provider: "11labs",
        voiceId: "matilda"
      },
      language: "en",
      firstMessage: "hi aku adalah AI Agatha yang dibuat oleh orang ganteng",
      endCallMessage: "terimakasih"
    },
    phoneNumber: {
      twilioPhoneNumber: field_vapi.phoneNumber.twilioPhoneNumber,
      twilioAccountSid: field_vapi.phoneNumber.twilioAccountSid,
      twilioAuthToken: field_vapi.phoneNumber.twilioAuthToken
    },
    customer: {
      number: field_vapi.customer.number
    },
    phoneNumberId: field_vapi.phoneNumberId
  });
  const [callHistory, setCallHistory] = useState<any[]>([]);



  // In the useEffect hook
  useEffect(() => {
    if (VAPI_PUBLIC_KEY && VAPI_PRIVATE_KEY) {
      const client = new VapiClient(VAPI_PUBLIC_KEY);
      setVapiClient(client);
    }
  }, []);
  useEffect(() => {
    const fetchCallHistory = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`/api/call-history?userId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setCallHistory(data);
          } else {
            console.error('Failed to fetch call history');
          }
        } catch (error) {
          console.error('Error fetching call history:', error);
        }
      }
    };
  
    fetchCallHistory();
  }, [user]);

  const startCall = useCallback(async () => {
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
      const phoneNumberResponse = await fetch('https://api.vapi.ai/phone-number/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          number: defaultCall.phoneNumber.twilioPhoneNumber,
          name: contact,
          twilioAccountSid: defaultCall.phoneNumber.twilioAccountSid,
          twilioAuthToken: defaultCall.phoneNumber.twilioAuthToken,
          provider: "twilio"
        })
      });

      if (!phoneNumberResponse.ok) {
        throw new Error(`HTTP error! status: ${phoneNumberResponse.status}`);
      }

      const phoneNumberData = await phoneNumberResponse.json();
      console.log('Phone Number API response:', phoneNumberData);

      // Only proceed with /call/phone if phone-number/ was successful
      const callResponse = await fetch('https://api.vapi.ai/call/phone', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...defaultCall,
          phoneNumberId: phoneNumberData.id
        })
      });

      if (!callResponse.ok) {
        throw new Error(`HTTP error! status: ${callResponse.status}`);
      }

      const callData = await callResponse.json();
      console.log('Call API response:', callData);

      // Save call history

      const historyResponse = await fetch('/api/call-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.id,
          username: user?.username,
          phoneNumber: defaultCall.customer.number,
          phoneNumberId: callData.id,
          contact: contact,
          twilioPhoneNumber: defaultCall.phoneNumber.twilioPhoneNumber,
          timestamp: new Date().toISOString()
        })
      });

      if (!historyResponse.ok) {
        console.error('Failed to save call history:', await historyResponse.text());
      }


      toast({
        title: "Success",
        description: `Call Success`,
        duration: 3000,
        variant: "default",
        color: "green"
      });


      setCallStatus('Call initiated');
      setIsCallActive(false);



    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Error",
        description: `Failed to start the call: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: 3000,
        variant: "destructive",
      });
      setIsCallActive(false);
    }
  }, [toast, vapiClient, defaultCall, contact, user]);

  const endCall = useCallback(() => {
    if (vapiClient) {
      vapiClient.stop();
    }
    // if (activeCall) {
    //   activeCall.hangUp();
    // }
    setActiveCall(null);
    setIsCallActive(false);
    setCallStatus('Call ended');
  }, [vapiClient, activeCall]);

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center">
          <Phone className="mr-2" /> Phone Call Settings
        </h2>

      </div>

      <Tabs defaultValue="llm-model" className="w-full">
        <div className="flex justify-between items-center mb-4">

          <TabsList className="grid w-[36vw] grid-cols-3">
            <TabsTrigger value="llm-model" className="flex items-center">
              <Brain className="mr-2 h-4 w-4" /> LLM Model
            </TabsTrigger>
            <TabsTrigger value="phone-settings" className="flex items-center">
              <BookUser className="mr-2 h-4 w-4" /> Number Settings
            </TabsTrigger>
            <TabsTrigger value="history-call" className="flex items-center">
              <Table className="mr-2 h-4 w-4" /> History Call
            </TabsTrigger>
          </TabsList>
          <Button
            onClick={isCallActive ? endCall : () => startCall()}
            className={`${isCallActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white w-[20vw]`}
          >
            {isCallActive ? (
              <>
                <PhoneOffIcon className="mr-2 h-4 w-4" /> End Call
              </>
            ) : (
              <>
                <PhoneIcon className="mr-2 h-4 w-4" /> Start Call
              </>
            )}
          </Button>
        </div>
        <TabsContent value="llm-model" className="mt-4">
          <div className="flex space-x-8">
            <div className="space-y-4 w-[70%]">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Assistant Name
                </label>
                <Input
                  value={defaultCall.assistant.name}
                  onChange={(e) => setDefaultCall({ ...defaultCall, assistant: { ...defaultCall.assistant, name: e.target.value } })}
                  id="name"
                  placeholder="Enter assistant name"
                  disabled={isCallActive}
                />
              </div>

              <div>
                <label htmlFor="firstMessage" className="block text-sm font-medium text-gray-700 mb-1">
                  First Message
                </label>
                <Input
                  value={defaultCall.assistant.firstMessage}
                  onChange={(e) => setDefaultCall({ ...defaultCall, assistant: { ...defaultCall.assistant, firstMessage: e.target.value } })}
                  id="firstMessage"
                  placeholder="Enter the first message"
                  disabled={isCallActive}
                />
              </div>

              <div>
                <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 mb-1">
                  System Prompt
                </label>
                <textarea
                  value={defaultCall.assistant.model.systemPrompt}
                  onChange={(e) => setDefaultCall({ ...defaultCall, assistant: { ...defaultCall.assistant, model: { ...defaultCall.assistant.model, systemPrompt: e.target.value } } })}
                  id="systemPrompt"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter the system prompt"
                  disabled={isCallActive}
                ></textarea>
              </div>
            </div>
            <div className="space-y-4 w-[30%]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="voice" className="block text-sm font-medium text-gray-700 mb-1">
                    Voice
                  </label>
                  <Select value={defaultCall.assistant.voice.voiceId} onValueChange={(value) => setDefaultCall({ ...defaultCall, assistant: { ...defaultCall.assistant, voice: { ...defaultCall.assistant.voice, voiceId: value } } })} disabled={isCallActive}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {['burt', 'marissa', 'andrea', 'sarah', 'phillip', 'steve', 'joseph', 'myra', 'paula', 'ryan', 'drew', 'paul', 'mrb', 'matilda', 'mark'].map((voice) => (
                        <SelectItem key={voice} value={voice}>
                          {voice.charAt(0).toUpperCase() + voice.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <Select value={defaultCall.assistant.language} onValueChange={(value) => setDefaultCall({ ...defaultCall, assistant: { ...defaultCall.assistant, language: value } })} disabled={isCallActive}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
                    Provider
                  </label>
                  <Select value={defaultCall.assistant.model.provider} onValueChange={(value) => setDefaultCall({ ...defaultCall, assistant: { ...defaultCall.assistant, model: { ...defaultCall.assistant.model, provider: value } } })} disabled={isCallActive}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      {/* <SelectItem value="anthropic">Anthropic</SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <Select value={defaultCall.assistant.model.model} onValueChange={(value) => setDefaultCall({ ...defaultCall, assistant: { ...defaultCall.assistant, model: { ...defaultCall.assistant.model, model: value } } })} disabled={isCallActive}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature
                </label>
                <div className="flex items-center">
                  <Slider
                    id="temperature"
                    min={0}
                    max={2}
                    step={0.1}
                    className="w-full mr-4"
                    defaultValue={[defaultCall.assistant.model.temperature]}
                    onValueChange={(value) => setDefaultCall({ ...defaultCall, assistant: { ...defaultCall.assistant, model: { ...defaultCall.assistant.model, temperature: value[0] } } })}
                    disabled={isCallActive}
                  />
                  <span className="text-sm font-medium text-gray-700">{defaultCall.assistant.model.temperature.toFixed(1)}</span>
                </div>
              </div>

              <div>
                <label htmlFor="endCallMessage" className="block text-sm font-medium text-gray-700 mb-1">
                  End Call Message
                </label>
                <Input
                  value={defaultCall.assistant.endCallMessage}
                  onChange={(e) => setDefaultCall({ ...defaultCall, assistant: { ...defaultCall.assistant, endCallMessage: e.target.value } })}
                  id="endCallMessage"
                  placeholder="Enter end call message"
                  disabled={isCallActive}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="phone-settings" className="mt-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                Name Contact
              </label>
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                id="contactName"
                placeholder="Enter contact name"
                disabled={isCallActive}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="twilioAccountSid" className="block text-sm font-medium text-gray-700 mb-1">
                  Twilio Account SID
                </label>
                <Input
                  value={defaultCall.phoneNumber.twilioAccountSid}
                  onChange={(e) => setDefaultCall({ ...defaultCall, phoneNumber: { ...defaultCall.phoneNumber, twilioAccountSid: e.target.value } })}
                  id="twilioAccountSid"
                  placeholder="Enter Twilio Account SID"
                  disabled={isCallActive}
                />
              </div>

              <div>
                <label htmlFor="twilioAuthToken" className="block text-sm font-medium text-gray-700 mb-1">
                  Twilio Auth Token
                </label>
                <Input
                  value={defaultCall.phoneNumber.twilioAuthToken}
                  onChange={(e) => setDefaultCall({ ...defaultCall, phoneNumber: { ...defaultCall.phoneNumber, twilioAuthToken: e.target.value } })}
                  id="twilioAuthToken"
                  type="password"
                  placeholder="Enter Twilio Auth Token"
                  disabled={isCallActive}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="customerNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Number
                </label>
                <Input
                  value={defaultCall.customer.number}
                  onChange={(e) => setDefaultCall({ ...defaultCall, customer: { ...defaultCall.customer, number: e.target.value } })}
                  id="customerNumber"
                  placeholder="Enter customer number"
                  disabled={isCallActive}
                />
              </div>

              <div>
                <label htmlFor="twilioPhoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Twilio Phone Number
                </label>
                <Input
                  value={defaultCall.phoneNumber.twilioPhoneNumber}
                  onChange={(e) => setDefaultCall({ ...defaultCall, phoneNumber: { ...defaultCall.phoneNumber, twilioPhoneNumber: e.target.value } })}
                  id="twilioPhoneNumber"
                  placeholder="Enter Twilio phone number"
                  disabled={isCallActive}
                />
              </div>
            </div>


          </div>
        </TabsContent>
        <TabsContent value="history-call" className="mt-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Call History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Phone Number</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Twilio Number</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {callHistory.map((call, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.phoneNumberId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.phoneNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(call.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.twilioPhoneNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}