'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Mail,
  Phone,
  Calendar,
  Paperclip,
  Send
} from 'lucide-react'

// Mock data for support tickets
const tickets = [
  {
    id: 'TKT-001',
    subject: 'Payment not confirmed',
    description: 'I made a payment but it\'s still showing as pending',
    status: 'open',
    priority: 'high',
    category: 'payment',
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      avatar: '/avatars/user1.png'
    },
    assignedTo: 'Alice Smith',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T14:20:00Z',
    messages: [
      {
        id: 1,
        sender: 'user',
        content: 'I made a payment of 0.005 BTC but it\'s still showing as pending in my order.',
        timestamp: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        sender: 'admin',
        content: 'Thank you for contacting support. I\'m checking your payment status now.',
        timestamp: '2024-01-15T11:15:00Z'
      },
      {
        id: 3,
        sender: 'admin',
        content: 'I can see your payment is still waiting for confirmations. Bitcoin typically requires 3 confirmations, which can take 30-60 minutes. I\'ll monitor this for you.',
        timestamp: '2024-01-15T14:20:00Z'
      }
    ]
  },
  {
    id: 'TKT-002',
    subject: 'Cannot access my account',
    description: 'I forgot my password and 2FA is not working',
    status: 'in-progress',
    priority: 'urgent',
    category: 'account',
    user: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatar: '/avatars/user2.png'
    },
    assignedTo: 'Bob Johnson',
    createdAt: '2024-01-14T16:45:00Z',
    updatedAt: '2024-01-15T09:30:00Z',
    messages: [
      {
        id: 1,
        sender: 'user',
        content: 'I cannot access my account. I forgot my password and my 2FA app is not working.',
        timestamp: '2024-01-14T16:45:00Z'
      },
      {
        id: 2,
        sender: 'admin',
        content: 'I understand this is urgent. Please verify your identity by providing your email address and last order number.',
        timestamp: '2024-01-15T09:30:00Z'
      }
    ]
  },
  {
    id: 'TKT-003',
    subject: 'Product delivery issue',
    description: 'Ordered digital product but haven\'t received download link',
    status: 'resolved',
    priority: 'medium',
    category: 'delivery',
    user: {
      name: 'Mike Johnson',
      email: 'mike@example.com',
      avatar: '/avatars/user3.png'
    },
    assignedTo: 'Carol White',
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-14T15:45:00Z',
    messages: [
      {
        id: 1,
        sender: 'user',
        content: 'I ordered a digital product yesterday but still haven\'t received the download link.',
        timestamp: '2024-01-13T09:15:00Z'
      },
      {
        id: 2,
        sender: 'admin',
        content: 'I\'m checking your order status. Can you please provide your order number?',
        timestamp: '2024-01-13T10:00:00Z'
      },
      {
        id: 3,
        sender: 'user',
        content: 'Order number is ORD-2024-001234',
        timestamp: '2024-01-13T10:15:00Z'
      },
      {
        id: 4,
        sender: 'admin',
        content: 'Thank you. I\'ve found your order and resent the download link to your email. Please check your inbox and spam folder.',
        timestamp: '2024-01-13T11:00:00Z'
      },
      {
        id: 5,
        sender: 'user',
        content: 'Got it! Thank you for your help.',
        timestamp: '2024-01-14T15:45:00Z'
      }
    ]
  }
]

const agents = [
  { id: 1, name: 'Alice Smith', email: 'alice@cryptoshop.com', status: 'online' },
  { id: 2, name: 'Bob Johnson', email: 'bob@cryptoshop.com', status: 'busy' },
  { id: 3, name: 'Carol White', email: 'carol@cryptoshop.com', status: 'offline' }
]

const stats = {
  total: 156,
  open: 45,
  inProgress: 23,
  resolved: 88,
  avgResponseTime: '2.5 hours',
  avgResolutionTime: '24 hours'
}

export default function SupportPage() {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="default">Open</Badge>
      case 'in-progress':
        return <Badge variant="secondary">In Progress</Badge>
      case 'resolved':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Resolved</Badge>
      case 'closed':
        return <Badge variant="outline">Closed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline">Low</Badge>
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>
      case 'high':
        return <Badge variant="default" className="bg-orange-500">High</Badge>
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedTicket) {
      console.log('Sending message:', newMessage)
      setNewMessage('')
    }
  }

  const handleAssignTicket = (ticketId: string, agentId: string) => {
    console.log('Assigning ticket', ticketId, 'to agent', agentId)
  }

  const selectedTicketData = tickets.find(t => t.id === selectedTicket)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support</h1>
          <p className="text-muted-foreground">
            Manage customer support tickets and inquiries
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResolutionTime}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ticket List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Support Tickets</CardTitle>
                  <CardDescription>
                    View and manage customer support tickets
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedTicket === ticket.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedTicket(ticket.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{ticket.subject}</h3>
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {ticket.user.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {ticket.assignedTo ? `Assigned to ${ticket.assignedTo}` : 'Unassigned'}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={ticket.user.avatar} />
                          <AvatarFallback>{ticket.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Badge variant="outline" className="text-xs">
                          {ticket.messages.length} messages
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Details */}
        <div className="space-y-4">
          {selectedTicketData ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedTicketData.subject}</CardTitle>
                      <CardDescription>Ticket {selectedTicketData.id}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(selectedTicketData.status)}
                      {getPriorityBadge(selectedTicketData.priority)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={selectedTicketData.user.avatar} />
                        <AvatarFallback>{selectedTicketData.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedTicketData.user.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedTicketData.user.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium capitalize">{selectedTicketData.category}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Assigned to:</span>
                        <Select 
                          value={selectedTicketData.assignedTo} 
                          onValueChange={(value) => handleAssignTicket(selectedTicketData.id, value)}
                        >
                          <SelectTrigger className="w-[140px] h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {agents.map(agent => (
                              <SelectItem key={agent.id} value={agent.name}>
                                {agent.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date(selectedTicketData.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last updated:</span>
                        <span>{new Date(selectedTicketData.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Conversation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {selectedTicketData.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.sender === 'admin' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.sender === 'user' && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={selectedTicketData.user.avatar} />
                            <AvatarFallback>{selectedTicketData.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.sender === 'admin'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {message.sender === 'admin' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>AD</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a ticket to view details</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Agents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${
                            agent.status === 'online'
                              ? 'bg-green-500'
                              : agent.status === 'busy'
                              ? 'bg-yellow-500'
                              : 'bg-gray-500'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {agent.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}