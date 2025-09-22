'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '@/components/layout/admin-layout';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Shield, 
  Star, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Bitcoin,
  UserPlus,
  UserCheck,
  UserX,
  MoreHorizontal
} from 'lucide-react';

// Mock data pour les utilisateurs
const mockUsers = [
  {
    id: 1,
    username: 'johndoe',
    email: 'john@example.com',
    avatar: '/avatars/user1.png',
    isSeller: true,
    isVerified: true,
    twoFactorEnabled: true,
    status: 'active',
    createdAt: '2024-01-15',
    lastLogin: '2024-01-20',
    totalOrders: 12,
    totalSpent: '2.5 BTC',
    rating: 4.8,
    sellerRating: 4.9,
    bitcoinAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    location: 'France',
    phone: '+33 1 23 45 67 89'
  },
  {
    id: 2,
    username: 'alice_smith',
    email: 'alice@example.com',
    avatar: '/avatars/user2.png',
    isSeller: false,
    isVerified: true,
    twoFactorEnabled: false,
    status: 'active',
    createdAt: '2024-01-10',
    lastLogin: '2024-01-19',
    totalOrders: 8,
    totalSpent: '1.2 BTC',
    rating: 4.5,
    sellerRating: null,
    bitcoinAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    location: 'Canada',
    phone: '+1 234 567 8900'
  },
  {
    id: 3,
    username: 'crypto_expert',
    email: 'expert@crypto.com',
    avatar: '/avatars/user3.png',
    isSeller: true,
    isVerified: true,
    twoFactorEnabled: true,
    status: 'active',
    createdAt: '2024-01-05',
    lastLogin: '2024-01-20',
    totalOrders: 3,
    totalSpent: '0.8 BTC',
    rating: 4.9,
    sellerRating: 5.0,
    bitcoinAddress: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
    location: 'Germany',
    phone: '+49 123 456 7890'
  },
  {
    id: 4,
    username: 'bob_wilson',
    email: 'bob@example.com',
    avatar: '/avatars/user4.png',
    isSeller: false,
    isVerified: false,
    twoFactorEnabled: false,
    status: 'pending',
    createdAt: '2024-01-18',
    lastLogin: null,
    totalOrders: 0,
    totalSpent: '0 BTC',
    rating: 0,
    sellerRating: null,
    bitcoinAddress: null,
    location: 'USA',
    phone: '+1 987 654 3210'
  },
  {
    id: 5,
    username: 'emma_davis',
    email: 'emma@example.com',
    avatar: '/avatars/user5.png',
    isSeller: true,
    isVerified: true,
    twoFactorEnabled: false,
    status: 'suspended',
    createdAt: '2024-01-08',
    lastLogin: '2024-01-15',
    totalOrders: 15,
    totalSpent: '3.1 BTC',
    rating: 4.7,
    sellerRating: 4.6,
    bitcoinAddress: 'bc1p5d7rjq7g6rdk2yhzks9smlqfpuecpgza40qgdgqqjtp0j5ylq5qsl2n4k',
    location: 'UK',
    phone: '+44 20 7946 0958'
  },
];

function UserStatusBadge({ status }) {
  const statusConfig = {
    active: { label: 'Actif', variant: 'default', icon: CheckCircle },
    pending: { label: 'En attente', variant: 'secondary', icon: Clock },
    suspended: { label: 'Suspendu', variant: 'destructive', icon: XCircle },
    banned: { label: 'Banni', variant: 'destructive', icon: AlertTriangle },
  };

  const config = statusConfig[status] || statusConfig.active;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center space-x-1">
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
}

function UserRoleBadge({ isSeller, isVerified }) {
  if (isSeller && isVerified) {
    return (
      <Badge variant="default" className="bg-green-500">
        <Shield className="h-3 w-3 mr-1" />
        Vendeur vérifié
      </Badge>
    );
  } else if (isSeller) {
    return (
      <Badge variant="outline">
        <Star className="h-3 w-3 mr-1" />
        Vendeur
      </Badge>
    );
  } else if (isVerified) {
    return (
      <Badge variant="secondary">
        <CheckCircle className="h-3 w-3 mr-1" />
        Vérifié
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline">
        <UserX className="h-3 w-3 mr-1" />
        Non vérifié
      </Badge>
    );
  }
}

function UserTableRow({ user, onView, onEdit, onDelete }) {
  return (
    <tr className="hover:bg-muted/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mr-3">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full" />
            ) : (
              <span className="text-sm font-medium">
                {user.username.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="text-sm font-medium">{user.username}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <UserRoleBadge isSeller={user.isSeller} isVerified={user.isVerified} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <UserStatusBadge status={user.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm">
          <div className="font-medium">{user.totalOrders}</div>
          <div className="text-muted-foreground">{user.totalSpent}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm">
          {user.rating > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{user.rating}</span>
            </div>
          )}
          {user.sellerRating > 0 && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>{user.sellerRating}</span>
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-muted-foreground">
          <div>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</div>
          {user.lastLogin && (
            <div className="text-xs">Connexion: {new Date(user.lastLogin).toLocaleDateString('fr-FR')}</div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onView(user)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(user)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  // Filtrage des utilisateurs
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      if (roleFilter === 'seller') {
        filtered = filtered.filter(user => user.isSeller);
      } else if (roleFilter === 'buyer') {
        filtered = filtered.filter(user => !user.isSeller);
      }
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter, roleFilter]);

  const handleViewUser = (user) => {
    setSelectedUser(user);
    // Logique pour afficher les détails de l'utilisateur
    console.log('View user:', user);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    // Logique pour éditer l'utilisateur
    console.log('Edit user:', user);
  };

  const handleDeleteUser = (user) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.username} ?`)) {
      setUsers(users.filter(u => u.id !== user.id));
    }
  };

  const handleExportUsers = () => {
    // Logique pour exporter les utilisateurs
    console.log('Export users');
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    sellers: users.filter(u => u.isSeller).length,
    verified: users.filter(u => u.isVerified).length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
            <p className="text-muted-foreground">
              Gérez tous les utilisateurs et vendeurs de la plateforme
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleExportUsers}>
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un utilisateur
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Actifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">En attente</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserX className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.suspended}</p>
                  <p className="text-xs text-muted-foreground">Suspendus</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.sellers}</p>
                  <p className="text-xs text-muted-foreground">Vendeurs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.verified}</p>
                  <p className="text-xs text-muted-foreground">Vérifiés</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="suspended">Suspendus</SelectItem>
                  <SelectItem value="banned">Bannis</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="seller">Vendeurs</SelectItem>
                  <SelectItem value="buyer">Acheteurs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des utilisateurs</CardTitle>
            <CardDescription>
              {filteredUsers.length} utilisateur(s) trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Commandes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Inscrit le
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <UserTableRow
                      key={user.id}
                      user={user}
                      onView={handleViewUser}
                      onEdit={handleEditUser}
                      onDelete={handleDeleteUser}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Details Modal (placeholder) */}
        {selectedUser && (
          <Card>
            <CardHeader>
              <CardTitle>Détails de l'utilisateur</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Informations personnelles</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Nom d'utilisateur:</span> {selectedUser.username}</div>
                    <div><span className="font-medium">Email:</span> {selectedUser.email}</div>
                    <div><span className="font-medium">Téléphone:</span> {selectedUser.phone}</div>
                    <div><span className="font-medium">Localisation:</span> {selectedUser.location}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Informations Bitcoin</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Adresse Bitcoin:</span></div>
                    <div className="font-mono text-xs bg-muted p-2 rounded">
                      {selectedUser.bitcoinAddress || 'Non définie'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}