
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/lib/placeholder-data';
import { Checkbox } from '@/components/ui/checkbox';

type User = {
  id: string;
  name: string;
  username: string;
  password?: string;
  roles: UserRole[];
  status: 'active' | 'pending_approval' | 'banned';
  bannedUntil?: Date | null;
};

type View = 'login-signup' | 'forgot-password';

export default function AuthPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [view, setView] = useState<View>('login-signup');

  // State to simulate a user database
  const [users, setUsers] = useState<User[]>([
      { id: 'user-0', name: 'Admin', username: 'admin', password: 'admin', roles: ['admin'], status: 'active' },
      { id: 'user-1', name: 'Artiste Test', username: 'artiste', password: 'artiste', roles: ['artiste'], status: 'active' },
      { id: 'user-med', name: 'Med', username: 'med', password: 'admin', roles: ['admin'], status: 'active' },
  ]);
  
  // Login state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRoles, setSignupRoles] = useState<UserRole[]>([]);


  // Forgot password state
  const [forgotUsername, setForgotUsername] = useState('');


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === loginUsername && u.password === loginPassword);
    
    if (user) {
        if (user.status === 'pending_approval') {
            toast({
                variant: "destructive",
                title: "Compte en attente",
                description: "Votre compte est en attente d'approbation par un administrateur.",
            });
            return;
        }
        if (user.status === 'banned') {
             toast({
                variant: "destructive",
                title: "Compte banni",
                description: `Ce compte est banni${user.bannedUntil ? ` jusqu'au ${user.bannedUntil.toLocaleDateString('fr-FR')}`: ' définitivement'}.`,
            });
            return;
        }
        
      // In a real app, you would store the user session
      // For this demo, we'll pass some info in the query params
      router.push(`/dashboard?name=${user.name || user.username}&role=${user.roles[0]}`); // Pass first role for simplicity
    } else {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Pseudo ou mot de passe incorrect.",
      });
    }
  };

  const handleRoleChange = (role: UserRole, checked: boolean | "indeterminate") => {
    if (checked === "indeterminate") return;
    setSignupRoles(prev => {
        if (checked) {
            return [...prev, role];
        } else {
            return prev.filter(r => r !== role);
        }
    });
  }
  
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some(u => u.username === signupUsername)) {
         toast({
            variant: "destructive",
            title: "Erreur d'inscription",
            description: "Ce pseudo est déjà utilisé.",
        });
        return;
    }
     if (signupRoles.length === 0) {
        toast({
            variant: "destructive",
            title: "Rôle manquant",
            description: "Veuillez sélectionner au moins un rôle.",
        });
        return;
    }
    
    const isFirstAdminSignup = users.filter(u => u.roles.includes('admin')).length === 0;
    const isSigningUpAsAdmin = signupRoles.includes('admin');
    
    // In a real app, you would send this to your backend
    const newUser: User = { 
        id: `user-${Date.now()}`,
        name: signupName, 
        username: signupUsername, 
        password: signupPassword,
        roles: signupRoles,
        status: (isFirstAdminSignup && isSigningUpAsAdmin) ? 'active' : 'pending_approval'
    };
    setUsers([...users, newUser]);
    
    if (isFirstAdminSignup && isSigningUpAsAdmin) {
         toast({
            title: "Compte administrateur créé !",
            description: `Bienvenue ! Vous pouvez maintenant vous connecter.`,
        });
    } else {
        // Simulate sending email to admin
        const adminEmails = "admin@example.com"; // In a real app, get this from settings
        console.log("===== SIMULATION D'EMAIL (Nouvelle inscription) =====");
        console.log(`À: ${adminEmails}`);
        console.log(`Sujet: Nouvelle demande d'inscription`);
        console.log(`Corps: Un nouvel utilisateur s'est inscrit : ${signupName || signupUsername} (${signupUsername}) avec les rôles: ${signupRoles.join(', ')}.`);
        console.log("Veuillez approuver ou refuser son inscription dans le panneau d'administration.");
        console.log("=====================================================");
        
        toast({
            title: "Demande d'inscription envoyée !",
            description: `Votre demande a été envoyée à un administrateur pour validation.`,
        });
    }
    
    // Reset form and switch to login tab
    setSignupName('');
    setSignupUsername('');
    setSignupPassword('');
    setSignupRoles([]);
    
    const loginTabTrigger = document.querySelector('button[data-radix-collection-item][value="login"]') as HTMLButtonElement | null;
    loginTabTrigger?.click();
  }

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const userExists = users.some(u => u.username === forgotUsername);
    if (userExists) {
        toast({
            title: "Email envoyé",
            description: `Si un compte existe pour "${forgotUsername}", un email de réinitialisation a été envoyé.`
        });
        setForgotUsername('');
        setView('login-signup');
    } else {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "Aucun utilisateur trouvé avec ce pseudo."
        });
    }
  };

  const renderContent = () => {
    if (view === 'forgot-password') {
        return (
            <div>
                <Button variant="ghost" size="sm" onClick={() => setView('login-signup')} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Retour
                </Button>
                <form onSubmit={handleForgotPassword}>
                    <div className="grid gap-4">
                        <div className="grid gap-2 text-center">
                             <h2 className="text-2xl font-bold">Mot de passe oublié</h2>
                             <p className="text-muted-foreground">
                                Entrez votre pseudo pour recevoir un lien de réinitialisation.
                             </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="username-forgot">Pseudo</Label>
                            <Input
                                id="username-forgot"
                                type="text"
                                placeholder="Votre pseudo"
                                required
                                value={forgotUsername}
                                onChange={(e) => setForgotUsername(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Envoyer le lien
                        </Button>
                    </div>
                </form>
            </div>
        );
    }

    return (
         <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">S'inscrire</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
                 <form onSubmit={handleLogin} className="pt-4">
                    <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="username-login">Pseudo</Label>
                        <Input
                        id="username-login"
                        type="text"
                        placeholder="Votre pseudo"
                        required
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center">
                        <Label htmlFor="password-login">Mot de passe</Label>
                        <button
                            type="button"
                            onClick={() => setView('forgot-password')}
                            className="ml-auto inline-block text-sm underline"
                        >
                            Mot de passe oublié?
                        </button>
                        </div>
                        <Input 
                        id="password-login" 
                        type="password" 
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Se connecter
                    </Button>
                     <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => router.push('/dashboard?name=Med&role=admin')}
                    >
                        Connexion rapide (Med - Admin)
                    </Button>
                    </div>
                </form>
            </TabsContent>
            <TabsContent value="signup">
                 <form onSubmit={handleSignup} className="pt-4">
                    <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="username-signup">Pseudo</Label>
                        <Input id="username-signup" placeholder="jeand" required value={signupUsername} onChange={e => setSignupUsername(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password-signup">Mot de passe</Label>
                        <Input id="password-signup" type="password" required value={signupPassword} onChange={e => setSignupPassword(e.target.value)} />
                    </div>
                     <div className="grid gap-2">
                        <Label>Je souhaite m'inscrire en tant que :</Label>
                        <p className="text-xs text-muted-foreground">Le choix multiple est possible.</p>
                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="role-admin" onCheckedChange={(checked) => handleRoleChange('admin', checked)} />
                                <Label htmlFor="role-admin" className="font-normal">Admin</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="role-benevole" onCheckedChange={(checked) => handleRoleChange('bénévole', checked)} />
                                <Label htmlFor="role-benevole" className="font-normal">Bénévole</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="role-artiste" onCheckedChange={(checked) => handleRoleChange('artiste', checked)} />
                                <Label htmlFor="role-artiste" className="font-normal">Artiste</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="role-invite" onCheckedChange={(checked) => handleRoleChange('invité', checked)} />
                                <Label htmlFor="role-invite" className="font-normal">Invité (accès limité)</Label>
                            </div>
                        </div>
                     </div>
                     <div className="grid gap-2">
                        <Label htmlFor="name">Nom complet (optionnel)</Label>
                        <Input id="name" placeholder="Jean Dupont" value={signupName} onChange={e => setSignupName(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full">
                        Demander l'inscription
                    </Button>
                    </div>
                </form>
            </TabsContent>
        </Tabs>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        {view === 'login-signup' && (
            <CardHeader className="text-center">
                <div className="flex justify-center items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                        <Palette size={28} />
                    </div>
                    <h1 className="text-2xl font-semibold font-headline text-primary">L'Espace Asso</h1>
                </div>
              <CardDescription>
                Bienvenue sur la plateforme de gestion de votre association.
              </CardDescription>
            </CardHeader>
        )}
        <CardContent>
            {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
