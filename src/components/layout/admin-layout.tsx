'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Bitcoin, 
  Headphones, 
  BarChart3, 
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Home,
  TrendingUp,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Shield
} from 'lucide-react';

const adminNavigation = [
  { 
    name: 'Tableau de bord', 
    href: '/admin', 
    icon: LayoutDashboard,
    description: 'Vue d\'ensemble et statistiques'
  },
  { 
    name: 'Utilisateurs', 
    href: '/admin/users', 
    icon: Users,
    description: 'Gestion des utilisateurs et vendeurs',
    badge: '0'
  },
  { 
    name: 'Produits', 
    href: '/admin/products', 
    icon: Package,
    description: 'Gestion des produits et catégories',
    badge: '12'
  },
  { 
    name: 'Commandes', 
    href: '/admin/orders', 
    icon: ShoppingCart,
    description: 'Suivi des commandes et expéditions',
    badge: '5'
  },
  { 
    name: 'Paiements', 
    href: '/admin/payments', 
    icon: Bitcoin,
    description: 'Transactions Bitcoin et escrows',
    badge: '2'
  },
  { 
    name: 'Support', 
    href: '/admin/support', 
    icon: Headphones,
    description: 'Tickets et assistance client',
    badge: '3'
  },
  { 
    name: 'Analytics', 
    href: '/admin/analytics', 
    icon: BarChart3,
    description: 'Rapports et analyses'
  },
  { 
    name: 'Paramètres', 
    href: '/admin/settings', 
    icon: Settings,
    description: 'Configuration système'
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout, loading } = useAdminAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !admin && typeof window !== 'undefined') {
      router.push('/admin/login');
    }
  }, [admin, loading, router]);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-6">Please log in to access the admin dashboard.</p>
          <a
            href="/admin/login"
            className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            Admin Login
          </a>
        </div>
      </div>
    );
  }

  const notifications = [
    {
      id: 1,
      title: 'Nouvelle commande',
      message: 'Commande #1234 de 0.5 BTC',
      time: 'Il y a 5 minutes',
      type: 'order',
      read: false
    },
    {
      id: 2,
      title: 'Paiement confirmé',
      message: 'Transaction tx123... confirmée',
      time: 'Il y a 12 minutes',
      type: 'payment',
      read: false
    },
    {
      id: 3,
      title: 'Nouveau ticket support',
      message: 'Ticket #5678 ouvert',
      time: 'Il y a 25 minutes',
      type: 'support',
      read: true
    },
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Bitcoin className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">CryptoShop</h1>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-orange-500/10 text-orange-500 border-r-2 border-orange-500"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  )}
                  title={item.description}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{item.name}</span>
                      {item.badge && parseInt(item.badge) > 0 && (
                        <Badge 
                          variant={isActive ? "default" : "secondary"} 
                          className={cn(
                            "ml-2 flex-shrink-0",
                            isActive ? "bg-orange-500 hover:bg-orange-600" : "bg-slate-700"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 group-hover:text-slate-400 truncate">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="mt-8 mb-4">
            <div className="border-t border-slate-800"></div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions Rapides
              </p>
            </div>
            <Link
              href="/market"
              className="flex items-center px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              <Home className="mr-3 h-4 w-4" />
              Voir le site
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              <Settings className="mr-3 h-4 w-4" />
              Paramètres
            </Link>
          </div>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={admin?.avatar || "/avatars/admin.png"} alt={admin?.username || "Admin"} />
              <AvatarFallback className="bg-orange-500 text-white">
                {admin?.username?.substring(0, 2).toUpperCase() || "AD"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {admin?.username || "Admin User"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {admin?.email || "admin@cryptoshop.com"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Breadcrumb */}
              <nav className="hidden md:flex items-center space-x-2 text-sm">
                <Link href="/admin" className="text-muted-foreground hover:text-foreground">
                  Admin
                </Link>
                <span className="text-muted-foreground">/</span>
                <span className="font-medium">
                  {adminNavigation.find(item => item.href === pathname)?.name || 'Tableau de bord'}
                </span>
              </nav>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="pl-10 pr-4 py-2 w-64 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </div>

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-5">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-background border rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors",
                            !notification.read && "bg-blue-50/50"
                          )}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={cn(
                              "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                              notification.type === 'order' && "bg-blue-500",
                              notification.type === 'payment' && "bg-green-500",
                              notification.type === 'support' && "bg-orange-500"
                            )} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{notification.title}</p>
                              <p className="text-xs text-muted-foreground">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4">
                      <Button variant="outline" size="sm" className="w-full">
                        Voir toutes les notifications
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={admin?.avatar || "/avatars/admin.png"} alt={admin?.username || "Admin"} />
                    <AvatarFallback className="bg-orange-500 text-white">
                      {admin?.username?.substring(0, 2).toUpperCase() || "AD"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium">
                    {admin?.username || "Admin"}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {/* User Menu Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b">
                      <p className="font-medium">{admin?.username || "Admin User"}</p>
                      <p className="text-sm text-muted-foreground">
                        {admin?.email || "admin@cryptoshop.com"}
                      </p>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/admin/settings"
                        className="flex items-center px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Paramètres
                      </Link>
                      <Link
                        href="/"
                        className="flex items-center px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                      >
                        <Home className="mr-2 h-4 w-4" />
                        Voir le site
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}