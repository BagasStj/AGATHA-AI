'use client'

import { useCallback, useEffect, useState } from 'react';
import FlowComponent from './FlowComponent';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Flow {
  id: string;
  name: string;
  createdAt: string;
}

export default function FlowPage() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchFlows() {
      try {
        const response = await fetch('/api/flows');
        if (!response.ok) {
          throw new Error('Failed to fetch flows');
        }
        const data = await response.json();
        setFlows(data);
      } catch (error) {
        console.error('Error fetching flows:', error);
      }
    }

    fetchFlows();
  }, []);

  const deleteFlow = async (id: string) => {
    try {
      const response = await fetch(`/api/flows/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setFlows(flows.filter(flow => flow.id !== id));
      } else {
        console.error('Failed to delete flow');
      }
    } catch (error) {
      console.error('Error deleting flow:', error);
    }
  };

  const filteredFlows = flows.filter(flow =>
    flow.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onFlowSaved = useCallback((savedFlow: any) => {
    setFlows((prevFlows) => [...prevFlows, savedFlow]);
    fetchFlows(); // Re-fetch all flows after saving
  }, []);
  
  const fetchFlows = useCallback(async () => {
    try {
      const response = await fetch('/api/flows');
      if (!response.ok) {
        throw new Error('Failed to fetch flows');
      }
      const data = await response.json();
      setFlows(data);
    } catch (error) {
      console.error('Error fetching flows:', error);
    }
  }, []);


  return (
    <div className="p-4 flex h-[89vh]">
      <Card className="w-[15vw] ml-[2vw] mr-2 overflow-hidden shadow-lg">
        <CardHeader className="space-y-1 border-b-2 mb-4">
          <CardTitle className="text-2xl font-bold">AI Flow Diagram</CardTitle>
          <CardDescription>Flow List</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search flows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <div className="h-[58vh] overflow-auto">
            {filteredFlows.map((flow) => (
              <div
                key={flow.id}
                className={`p-3 border-b border-gray-200 hover:bg-gray-100 cursor-pointer ${selectedFlow === flow.id ? 'bg-blue-100' : ''} flex justify-between items-center`}
              >
                <div onClick={() => setSelectedFlow(flow.id)}>
                  <h3 className="font-semibold">{flow.name}</h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(flow.createdAt), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical className="h-5 w-5 text-gray-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e:any) => e.preventDefault()}>
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure delete {flow.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the flow
                            and remove its data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteFlow(flow.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="flex-1 overflow-hidden shadow-lg">
        <CardContent className="p-0 h-full">
          <FlowComponent selectedFlowId={selectedFlow} onFlowSaved={onFlowSaved}/>
        </CardContent>
      </Card>
    </div>
  );
}