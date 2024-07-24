'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToastProvider } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
// Remove the import for Icons as it's not found and not used in this component

function EmailPageContent() {
    const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const { toast } = useToast();

    const sendEmail = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setEmailStatus('loading');
        try {
            const response = await fetch('/api/email/send-emaill', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: event.currentTarget.to.value,
                    subject: event.currentTarget.subject.value,
                    message: event.currentTarget.message.value,
                }),
            });
            if (response.ok) {
                setEmailStatus('success');
                toast({ description: 'Email sent successfully!', duration: 3000 });
                event.currentTarget.reset();
            } else {
                setEmailStatus('error');
                toast({ description: 'Error sending email. Please try again.', variant: 'destructive', duration: 3000 });
            }
        } catch (error) {
            setEmailStatus('error');
            toast({ description: 'Error sending email. Please try again.', variant: 'destructive', duration: 3000 });
        } finally {
            setEmailStatus('idle');
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <Card className="shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Send Email</CardTitle>
                    <CardDescription>Compose and send an email to your contacts.</CardDescription>
                </CardHeader>
                <form onSubmit={sendEmail}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="to" className="text-sm font-medium">To</Label>
                            <Input id="to" name="to" type="email" placeholder="recipient@example.com" required className="w-full" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                            <Input id="subject" name="subject" placeholder="Enter email subject" required className="w-full" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                            <Textarea id="message" name="message" placeholder="Type your message here" required className="w-full min-h-[150px]" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={emailStatus === 'loading'} className="w-full">
                            {emailStatus === 'loading' ? (
                                <>
                                    <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13"></line>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                    </svg>
                                    Send Email
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

export default function EmailPage() {
    return (
        <ToastProvider>
            <EmailPageContent />
        </ToastProvider>
    );
}