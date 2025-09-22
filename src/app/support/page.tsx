'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/layout/navbar';
import { MessageSquare } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Support Center</h1>
            <p className="text-muted-foreground">Get help with your orders and account</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Support Center</h3>
                <p className="text-muted-foreground">This page is under maintenance</p>
                <Button className="mt-4">Contact Support</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
