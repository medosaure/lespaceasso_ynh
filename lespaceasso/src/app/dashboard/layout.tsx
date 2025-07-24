
"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  MessageSquare,
  CalendarDays,
  Folder,
  ClipboardList,
  Settings,
  Bell,
  User,
  LogOut,
  Palette,
  Vote,
  Shield,
  Mic2,
  Home,
  Code,
  ListChecks,
  Notebook,
  FileText,
  Trash,
  Menu,
  CalendarClock,
  X,
  UploadCloud,
  Download,
  Search,
  ListTodo,
  CreditCard,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";


import ChatSection from '@/components/chat-section';
import PlanningSection from '@/components/planning-section';
import FilesSection from '@/components/files-section';
import ProjectsSection from '@/components/projects-section';
import VotingSection from '@/components/voting-section';
import AdminSection from '@/components/admin-section';
import ArtistSection from '@/components/artist-section';
import WelcomeSection from '@/components/welcome-section';
import SurveySection from '@/components/survey-section';
import NotepadSection from '@/components/notepad-section';
import ReportsSection from '@/components/reports-section';
import TrashSection from '@/components/trash-section';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import ProfileSettings from '@/components/profile-settings';
import GeneralSettings from '@/components/general-settings';
import { SoireeRoster, User as UserData, UserRole, FileItem, Message, KanbanTask, KanbanColumn, Survey, Note, MeetingReport, initialUsersData, initialRoster, initialMessages, kanbanData, initialFiles, initialSurveys, initialPolls, InitialWelcomeContent, initialNotes, initialReports, Poll, initialAgendaItems, AgendaItem, initialTransactions, Transaction } from '@/lib/placeholder-data';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import MeetingPrepSection from '@/components/meeting-prep-section';
import BudgetSection from '@/components/budget-section';

type View = 'welcome' | 'chat' | 'planning' | 'files' | 'projects' | 'notepad' | 'reports' | 'voting' | 'surveys' | 'admin' | 'artist-space' | 'trash' | 'meeting-prep' | 'budget';

type NotificationType = 'chat' | 'planning' | 'meeting' | 'survey' | 'file' | 'upload_request' | 'download_request';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  description: string;
  channelId?: string; // for chat notifications
  userId?: string; // for upload/download requests
  itemId?: string; // for download requests
}

const NOTIFICATION_CONFIG: Record<NotificationType, { color: string; icon: React.ElementType, view: View, badgeColor: string }> = {
  chat: { color: 'bg-blue-500', icon: MessageSquare, view: 'chat', badgeColor: 'bg-blue-500 text-white' },
  planning: { color: 'bg-red-500', icon: CalendarClock, view: 'planning', badgeColor: 'bg-red-500 text-white' },
  meeting: { color: 'bg-red-500', icon: Vote, view: 'voting', badgeColor: 'bg-red-500 text-white' },
  survey: { color: 'bg-red-500', icon: ListChecks, view: 'surveys', badgeColor: 'bg-red-500 text-white' },
  file: { color: 'bg-yellow-500', icon: Folder, view: 'files', badgeColor: 'bg-yellow-500 text-black' },
  upload_request: { color: 'bg-purple-500', icon: UploadCloud, view: 'admin', badgeColor: 'bg-purple-500 text-white' },
  download_request: { color: 'bg-green-500', icon: Download, view: 'admin', badgeColor: 'bg-green-500 text-white' },
};


export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
}

export const getInitials = (name: string, username: string) => {
    if (name && typeof name === 'string') {
        const initials = name.split(' ').map(n => n[0]).join('');
        if (initials) return initials;
    }
    if (username && typeof username === 'string') {
        return username.charAt(0).toUpperCase();
    }
    return 'U';
}

const initialNotifications: Notification[] = [
  { id: 1, type: 'chat', title: 'Nouveau message', description: 'Aline a posté dans #Général.', channelId: 'g-1' },
  { id: 2, type: 'planning', title: "Rappel d'événement", description: 'La Soirée Thématique 80s commence dans 2 heures.' },
  { id: 3, type: 'meeting', title: 'Vote terminé', description: 'Le vote pour la réunion "Projet Oasis" est terminé.' },
  { id: 4, type: 'file', title: 'Nouveau fichier', description: 'Un nouveau document a été ajouté dans "Rapports".' },
  { id: 5, type: 'chat', title: 'Nouveau message', description: 'Benoit a répondu dans #Bureau.', channelId: 'g-2' },
  { id: 6, type: 'upload_request', title: "Demande d'accès", description: "Artiste Invité a demandé l'accès à l'upload.", userId: '5' },
];


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [userProfile, setUserProfile] = useState<UserProfile>({
        id: 'currentUser',
        name: "Jean Dupont",
        username: "jeand",
        email: "jean.dupont@example.com",
        avatarUrl: "https://placehold.co/100x100.png",
        role: 'admin',
    });
    
    useEffect(() => {
        const name = searchParams.get('name');
        const role = searchParams.get('role') as UserRole;
        if (name && role) {
            const initialRole = role || 'admin';
            const username = name.toLowerCase().split(' ').join('') || name;
            setUserProfile(prev => ({ ...prev, name, username, role: initialRole }));
        }
    }, [searchParams]);
  
    const [rosters, setRosters] = useState<SoireeRoster[]>([initialRoster]);
    const [files, setFiles] = useState<FileItem[]>(initialFiles);
    const [messages, setMessages] = useState<Record<string, Message[]>>(initialMessages);
    const [users, setUsers] = useState<UserData[]>(initialUsersData);
    const [surveys, setSurveys] = useState<Survey[]>(initialSurveys);
    const [polls, setPolls] = useState<Poll[]>(initialPolls);
    const [tasks, setTasks] = useState<KanbanTask[]>(kanbanData.tasks);
    const [columns, setColumns] = useState<KanbanColumn[]>(kanbanData.columns);
    const [taskToEdit, setTaskToEdit] = useState<KanbanTask | null>(null);
    const [welcomeContent, setWelcomeContent] = useState(InitialWelcomeContent);
    const [notes, setNotes] = useState<Note[]>(initialNotes);
    const [reports, setReports] = useState<MeetingReport[]>(initialReports);
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [isPopoverOpen, setPopoverOpen] = useState(false);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [initialFileSearch, setInitialFileSearch] = useState('');
    
    const [activeView, setActiveView] = useState<View>('welcome');
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [agendaItems, setAgendaItems] = useState<AgendaItem[]>(initialAgendaItems);
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [hasMounted, setHasMounted] = useState(false);
    const isMobile = useIsMobile();
  
    useEffect(() => {
      setHasMounted(true);
      const savedState = Cookies.get('sidebar_state');
      if (savedState !== undefined) {
        setSidebarOpen(savedState === 'true');
      } else if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    }, []);

    useEffect(() => {
      const down = (e: KeyboardEvent) => {
        if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          setSearchOpen((open) => !open)
        }
      }
      document.addEventListener("keydown", down)
      return () => document.removeEventListener("keydown", down)
    }, [])

    const usersMap = React.useMemo(() => {
        const allUsers = [...users, { id: userProfile.id, name: userProfile.name, username: userProfile.username, avatar: userProfile.avatarUrl, roles: [userProfile.role], contributionStatus: 'paid', contributionDueDate: '', uploadPermission: 'allowed', downloadPermission: 'allowed' }];
        return allUsers.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {} as Record<string, UserData & { avatar: string }>);
    }, [users, userProfile]);

    const availableViewsMap: Record<UserRole, View[]> = {
        admin: ['welcome', 'chat', 'planning', 'surveys', 'voting', 'files', 'projects', 'notepad', 'reports', 'meeting-prep', 'budget', 'trash', 'admin', 'artist-space'],
        bénévole: ['welcome', 'chat', 'planning', 'files'],
        artiste: ['welcome', 'chat', 'artist-space', 'planning', 'files'],
        invité: ['welcome', 'chat'],
    };
  const availableViews = availableViewsMap[userProfile.role] || availableViewsMap['invité'];
  
  useEffect(() => {
    const currentUserData: UserData = {
      id: userProfile.id,
      name: userProfile.name,
      username: userProfile.username,
      avatar: userProfile.avatarUrl,
      roles: [userProfile.role],
      contributionStatus: 'paid',
      contributionDueDate: 'N/A',
      status: 'active',
      uploadPermission: 'allowed',
      downloadPermission: 'allowed',
    };
  
    setUsers(prevUsers => {
      const userExists = prevUsers.some(u => u.id === userProfile.id);
      if (!userExists) {
        return [...prevUsers, currentUserData];
      }
      return prevUsers.map(u => u.id === userProfile.id ? {...u, ...currentUserData} : u);
    });
  }, [userProfile]);


  useEffect(() => {
    if (!availableViews.includes(activeView)) {
      setActiveView(availableViews[0] || 'welcome');
    }
  }, [userProfile.role, activeView, availableViews]);

  const notificationCounts = React.useMemo(() => {
    return notifications.reduce((acc, notif) => {
        const view = NOTIFICATION_CONFIG[notif.type].view;
        acc[view] = (acc[view] || 0) + 1;
        return acc;
    }, {} as Record<View, number>);
  }, [notifications]);

  const handleSidebarOpenChange = (open: boolean) => {
    setSidebarOpen(open);
    Cookies.set('sidebar_state', String(open), { expires: 7 });
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setTaskToEdit(task);
      setActiveView('admin');
    }
  };

  const handleSetView = (view: View) => {
    if (availableViews.includes(view)) {
      setActiveView(view);
      
      const notificationTypesToClear = Object.entries(NOTIFICATION_CONFIG)
          .filter(([, config]) => config.view === view && view !== 'admin')
          .map(([type]) => type as NotificationType);
          
      if (notificationTypesToClear.length > 0) {
          setNotifications(prev => prev.filter(n => !notificationTypesToClear.includes(n.type)));
      }
    }
  };
  
  const handleLogout = () => {
    router.push('/');
  };

  const handleRoleChange = (newRole: UserRole) => {
    setUserProfile(prev => ({ ...prev, role: newRole }));
  };

  const dismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notification: Notification) => {
    const targetView = NOTIFICATION_CONFIG[notification.type].view;
    if (targetView && availableViews.includes(targetView)) {
        setActiveView(targetView);
    }
    if (notification.type !== 'upload_request' && notification.type !== 'download_request') {
        dismissNotification(notification.id);
    }
    setPopoverOpen(false);
  };
  
  const mainNavigationItems = [
    { view: 'welcome', icon: Home, label: 'Accueil' },
    { view: 'chat', icon: MessageSquare, label: 'Chat' },
    { view: 'artist-space', icon: Mic2, label: 'Informations artistes' },
    { view: 'planning', icon: CalendarDays, label: 'Planning' },
    { view: 'surveys', icon: ListChecks, label: 'Sondages' },
    { view: 'voting', icon: Vote, label: 'Vote Réunion' },
    { view: 'files', icon: Folder, label: 'Fichiers' },
    { view: 'projects', icon: ClipboardList, label: 'Projets' },
    { view: 'notepad', icon: Notebook, label: 'Bloc-notes' },
    { view: 'reports', icon: FileText, label: 'Comptes Rendus' },
    { view: 'meeting-prep', icon: ListTodo, label: 'Ordre du Jour' },
    { view: 'budget', icon: CreditCard, label: 'Budget' },
  ].filter(item => availableViews.includes(item.view as View));

  const footerNavigationItems = [
     { view: 'trash', icon: Trash, label: 'Corbeille' },
     { view: 'admin', icon: Shield, label: 'Administration' },
  ].filter(item => availableViews.includes(item.view as View));
  
  const getBadgeColorForView = (view: View): string | null => {
      const configEntry = Object.values(NOTIFICATION_CONFIG).find(config => config.view === view);
      return configEntry ? configEntry.badgeColor : null;
  };

  useEffect(() => {
    if (activeView !== 'notepad') setSelectedNoteId(null);
    if (activeView !== 'reports') setSelectedReportId(null);
  }, [activeView]);

  const onSearchResultSelect = (callback: () => void) => {
    setSearchOpen(false);
    setTimeout(callback, 50);
  }
  
  if (!hasMounted) {
    return null;
  }

  const renderView = () => {
    if (!availableViews.includes(activeView)) {
        return <WelcomeSection userProfile={userProfile} setActiveView={handleSetView} content={welcomeContent} />;
    }

    switch (activeView) {
      case 'welcome':
        return <WelcomeSection userProfile={userProfile} setActiveView={handleSetView} content={welcomeContent} />;
      case 'chat':
        return <ChatSection 
                  userProfile={userProfile} 
                  messages={messages} 
                  setMessages={setMessages} 
                  setFiles={setFiles} 
                  notifications={notifications}
                  setNotifications={setNotifications}
               />;
      case 'planning':
        return <PlanningSection rosters={rosters} setRosters={setRosters} userProfile={userProfile} />;
      case 'files':
        return <FilesSection userProfile={userProfile} users={users} setUsers={setUsers} files={files} setFiles={setFiles} usersMap={usersMap} setNotifications={setNotifications} initialSearchTerm={initialFileSearch} />;
      case 'projects':
        return <ProjectsSection userProfile={userProfile} tasks={tasks} setTasks={setTasks} columns={columns} setColumns={setColumns} onEditTask={handleEditTask} />;
      case 'notepad':
        return <NotepadSection notes={notes} setNotes={setNotes} selectedNoteId={selectedNoteId} setSelectedNoteId={setSelectedNoteId} />;
      case 'reports':
        return <ReportsSection reports={reports} setReports={setReports} selectedReportId={selectedReportId} setSelectedReportId={setSelectedReportId} />;
      case 'meeting-prep':
        return <MeetingPrepSection items={agendaItems} setItems={setAgendaItems} userProfile={userProfile} usersMap={usersMap} />;
      case 'budget':
        return <BudgetSection userProfile={userProfile} usersMap={usersMap} transactions={transactions} setTransactions={setTransactions} />;
      case 'voting':
        return <VotingSection userProfile={userProfile} users={users} polls={polls} setPolls={setPolls} />;
      case 'surveys':
        return <SurveySection userProfile={userProfile} surveys={surveys} setSurveys={setSurveys} />;
      case 'trash':
        return <TrashSection 
                  files={files} setFiles={setFiles}
                  notes={notes} setNotes={setNotes}
                  reports={reports} setReports={setReports}
                  usersMap={usersMap}
               />;
      case 'admin':
        return <AdminSection 
                  rosters={rosters} setRosters={setRosters} 
                  users={users} setUsers={setUsers} 
                  files={files}
                  setFiles={setFiles}
                  tasks={tasks} setTasks={setTasks} 
                  columns={columns} 
                  setColumns={setColumns}
                  userProfile={userProfile}
                  taskToEdit={taskToEdit}
                  setTaskToEdit={setTaskToEdit}
                  surveys={surveys}
                  setSurveys={setSurveys}
                  welcomeContent={welcomeContent}
                  setWelcomeContent={setWelcomeContent}
                  notifications={notifications}
                  setNotifications={setNotifications}
                  polls={polls}
                  setPolls={setPolls}
                  messages={messages}
                  setMessages={setMessages}
                  notes={notes}
                  setNotes={setNotes}
                  reports={reports}
                  setReports={setReports}
                  agendaItems={agendaItems}
                  setAgendaItems={setAgendaItems}
                  transactions={transactions}
                  setTransactions={setTransactions}
               />;
      case 'artist-space':
        return <ArtistSection files={files} setFiles={setFiles} userProfileId={userProfile.id} />;
      default:
        return <WelcomeSection userProfile={userProfile} setActiveView={handleSetView} content={welcomeContent} />;
    }
  };

  const getPageTitle = () => {
    switch (activeView) {
      case 'welcome':
        return `Bienvenue, ${userProfile.name}`;
      case 'chat':
        return 'Chat Interne';
      case 'planning':
        return 'Organisation des Soirées';
      case 'files':
        return 'Gestion de Fichiers';
      case 'projects':
        return 'Suivi de Projets';
      case 'notepad':
        return 'Bloc-notes Collaboratif';
      case 'reports':
        return 'Comptes Rendus de Réunion';
      case 'meeting-prep':
        return 'Préparation de Réunion';
      case 'budget':
        return 'Gestion du Budget';
      case 'voting':
        return 'Vote Réunion';
      case 'surveys':
        return 'Sondages';
      case 'trash':
        return 'Corbeille';
      case 'admin':
        return 'Administration';
      case 'artist-space':
        return 'Informations artistes';
      default:
        return 'Dashboard';
    }
  }

  const roleLabels: Record<UserRole, string> = {
    admin: 'Membre de l\'asso',
    bénévole: 'Bénévole',
    invité: 'Invité',
    artiste: 'Artiste',
  };

  const allRoles: UserRole[] = ['admin', 'bénévole', 'artiste', 'invité'];

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarProvider open={isSidebarOpen} onOpenChange={handleSidebarOpenChange}>
        <Sidebar collapsible="icon" className="bg-sidebar">
           <SidebarHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Palette size={24} />
                </div>
                <h1 className="text-xl font-semibold font-headline group-data-[collapsible=icon]:hidden">L'Espace Asso</h1>
              </div>
          </SidebarHeader>
          <div className="p-2">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 p-2 h-auto bg-sidebar-accent/50 hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground">
                   <Avatar className="h-10 w-10">
                    <AvatarImage src={userProfile.avatarUrl} data-ai-hint="user avatar" alt="User avatar" />
                    <AvatarFallback>{getInitials(userProfile.name, userProfile.username)}</AvatarFallback>
                  </Avatar>
                  <div className="text-left group-data-[collapsible=icon]:hidden">
                      <p className="font-semibold">{userProfile.name}</p>
                      <p className="text-xs text-sidebar-muted-foreground capitalize">{roleLabels[userProfile.role]}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2" side="right" align="start">
                <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setProfileModalOpen(true)}><User className="mr-2 h-4 w-4" /><span>Profil</span></DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSettingsModalOpen(true)}><Settings className="mr-2 h-4 w-4" /><span>Paramètres</span></DropdownMenuItem>
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Code className="mr-2 h-4 w-4" />
                    <span>Mode développeur</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <div className="p-2">
                        <Label htmlFor="role-switcher" className="text-xs px-1 font-semibold">Changer de rôle</Label>
                        <Select value={userProfile.role} onValueChange={handleRoleChange}>
                          <SelectTrigger id="role-switcher" className="w-full mt-1">
                            <SelectValue placeholder="Sélectionner un rôle" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {allRoles.map(role => (
                                <SelectItem key={role} value={role}>{roleLabels[role]}</SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /><span>Déconnexion</span></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <SidebarSeparator/>
          <SidebarContent>
            <SidebarMenu>
               {mainNavigationItems.map(({ view, icon: Icon, label }) => {
                 const notifCount = notificationCounts[view as View];
                 const badgeColor = getBadgeColorForView(view as View);
                 return (
                 <SidebarMenuItem key={view}>
                  <SidebarMenuButton onClick={() => handleSetView(view as View)} isActive={activeView === view} className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground">
                    <div className="relative">
                        <Icon />
                        {notifCount > 0 && badgeColor && (
                            <Badge className={cn("absolute -top-1.5 -right-1.5 h-4 w-4 p-0 flex items-center justify-center text-xs group-data-[collapsible=icon]:-top-0.5 group-data-[collapsible=icon]:-right-0.5 border-2 border-sidebar", badgeColor)}>
                                {notifCount}
                            </Badge>
                        )}
                    </div>
                    <span className="group-data-[collapsible=icon]:hidden">{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
               )})}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
             <SidebarMenu>
                {footerNavigationItems.map(({ view, icon: Icon, label }) => {
                  const notifCount = notificationCounts[view as View];
                  const badgeColor = getBadgeColorForView(view as View);
                  return (
                     <SidebarMenuItem key={view}>
                        <SidebarMenuButton onClick={() => handleSetView(view as View)} isActive={activeView === view} className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground">
                           <div className="relative">
                                <Icon />
                                {notifCount > 0 && badgeColor && (
                                    <Badge className={cn("absolute -top-1.5 -right-1.5 h-4 w-4 p-0 flex items-center justify-center text-xs group-data-[collapsible=icon]:-top-0.5 group-data-[collapsible=icon]:-right-0.5 border-2 border-sidebar", badgeColor)}>
                                        {notifCount}
                                    </Badge>
                                )}
                            </div>
                            <span className="group-data-[collapsible=icon]:hidden">{label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                )})}
             </SidebarMenu>
             <div className="text-center text-xs text-sidebar-muted-foreground p-2 group-data-[collapsible=icon]:hidden">
                v.1.0.0
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b bg-card/80 backdrop-blur-sm h-16 shrink-0">
            <div className="flex items-center gap-4">
               {isMobile ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                       </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64 bg-sidebar text-sidebar-foreground">
                       <DropdownMenuLabel>
                          <div className="flex items-center gap-2">
                             <Avatar className="h-10 w-10">
                              <AvatarImage src={userProfile.avatarUrl} data-ai-hint="user avatar" alt="User avatar" />
                              <AvatarFallback>{getInitials(userProfile.name, userProfile.username)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{userProfile.name}</p>
                                <p className={cn("text-xs capitalize text-sidebar-muted-foreground")}>{roleLabels[userProfile.role]}</p>
                            </div>
                          </div>
                       </DropdownMenuLabel>
                       <DropdownMenuSeparator className="bg-sidebar-border"/>
                        {mainNavigationItems.map(({ view, icon: Icon, label }) => {
                           const notifCount = notificationCounts[view as View];
                           const badgeColor = getBadgeColorForView(view as View);
                           return (
                           <DropdownMenuItem key={view} onSelect={() => handleSetView(view as View)} className={cn("focus:bg-sidebar-accent focus:text-sidebar-accent-foreground", activeView === view ? "bg-sidebar-primary text-sidebar-primary-foreground" : "")}>
                               <Icon className="mr-2 h-4 w-4" />
                               <span className="flex-1">{label}</span>
                               {notifCount > 0 && badgeColor && <Badge className={cn("h-5", badgeColor)}>{notifCount}</Badge>}
                           </DropdownMenuItem>
                        )})}
                       <DropdownMenuSeparator className="bg-sidebar-border"/>
                       {footerNavigationItems.map(({ view, icon: Icon, label }) => {
                          const notifCount = notificationCounts[view as View];
                          const badgeColor = getBadgeColorForView(view as View);
                          return (
                           <DropdownMenuItem key={view} onSelect={() => handleSetView(view as View)} className={cn("focus:bg-sidebar-accent focus:text-sidebar-accent-foreground", activeView === view ? "bg-sidebar-primary text-sidebar-primary-foreground" : "")}>
                               <Icon className="mr-2 h-4 w-4" />
                               <span className="flex-1">{label}</span>
                               {notifCount > 0 && badgeColor && <Badge className={cn("h-5", badgeColor)}>{notifCount}</Badge>}
                           </DropdownMenuItem>
                        )})}
                       <DropdownMenuSeparator className="bg-sidebar-border"/>
                       <DropdownMenuItem onSelect={() => setProfileModalOpen(true)} className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"><User className="mr-2 h-4 w-4" /><span>Profil</span></DropdownMenuItem>
                       <DropdownMenuItem onSelect={() => setSettingsModalOpen(true)} className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"><Settings className="mr-2 h-4 w-4" /><span>Paramètres</span></DropdownMenuItem>
                       <DropdownMenuItem onClick={handleLogout} className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"><LogOut className="mr-2 h-4 w-4" /><span>Déconnexion</span></DropdownMenuItem>
                       <DropdownMenuSeparator className="bg-sidebar-border"/>
                        <div className="text-center text-xs text-sidebar-muted-foreground p-2">
                            v.1.0.0
                        </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
              ) : <SidebarTrigger /> }
            </div>
            
            <div className="flex-1 flex justify-center">
                 <h2 className="text-xl font-bold font-headline text-primary hidden md:block">{getPageTitle()}</h2>
                 <h2 className="text-lg font-bold font-headline text-primary md:hidden">{getPageTitle()}</h2>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
                <Search className="h-5 w-5" />
                <span className="sr-only">Rechercher</span>
              </Button>
              <ThemeToggle />
              <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                          <Bell className="h-5 w-5" />
                          {notifications.length > 0 && (
                            <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                                {notifications.length}
                            </Badge>
                          )}
                          <span className="sr-only">Notifications</span>
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                      <div className="grid gap-4">
                          <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <h4 className="font-medium leading-none">Notifications</h4>
                                <p className="text-sm text-muted-foreground">
                                    Vous avez {notifications.length} notification(s) non lue(s).
                                </p>
                            </div>
                            {notifications.length > 0 && (
                                <Button variant="link" size="sm" className="p-0 h-auto" onClick={clearAllNotifications}>Tout effacer</Button>
                            )}
                          </div>
                          <Separator/>
                          {notifications.length > 0 ? (
                            <div className="space-y-1">
                                {notifications.map(notif => {
                                    const config = NOTIFICATION_CONFIG[notif.type] || {};
                                    return (
                                        <div key={notif.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 group">
                                            <div className="relative">
                                                <div className={cn("w-2.5 h-2.5 mt-1.5 rounded-full", config.color)}/>
                                            </div>
                                            <button className="flex-1 text-left" onClick={() => handleNotificationClick(notif)}>
                                                <p className="font-medium">{notif.title}</p>
                                                <p className="text-sm text-muted-foreground">{notif.description}</p>
                                            </button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0" onClick={(e) => { e.stopPropagation(); dismissNotification(notif.id);}}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )
                                })}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">Aucune nouvelle notification.</p>
                          )}
                      </div>
                  </PopoverContent>
              </Popover>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto">
            {renderView()}
          </div>
        </div>
      </SidebarProvider>

      <Dialog open={isProfileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profil</DialogTitle>
          </DialogHeader>
          <ProfileSettings
            userProfile={userProfile}
            onProfileChange={setUserProfile}
            closeModal={() => setProfileModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isSettingsModalOpen} onOpenChange={setSettingsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paramètres</DialogTitle>
          </DialogHeader>
          <GeneralSettings />
        </DialogContent>
      </Dialog>

      <CommandDialog open={isSearchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Rechercher un fichier, une note..." />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          <CommandGroup heading="Fichiers">
            {files.filter(f => f.status === 'active').map((file) => (
              <CommandItem
                key={`file-${file.id}`}
                value={`fichier ${file.name}`}
                onSelect={() => onSearchResultSelect(() => {
                  setActiveView('files');
                  setInitialFileSearch(file.name);
                })}
              >
                {file.type === 'folder' ? <Folder className="mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}
                <span>{file.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Notes">
            {notes.filter(n => n.status === 'active').map((note) => (
              <CommandItem
                key={`note-${note.id}`}
                value={`note ${note.title}`}
                onSelect={() => onSearchResultSelect(() => {
                    setActiveView('notepad');
                    setSelectedNoteId(note.id);
                })}
              >
                <Notebook className="mr-2 h-4 w-4" />
                <span>{note.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
           <CommandGroup heading="Comptes Rendus">
            {reports.filter(r => r.status === 'active').map((report) => (
              <CommandItem
                key={`report-${report.id}`}
                value={`compte rendu ${report.title}`}
                onSelect={() => onSearchResultSelect(() => {
                    setActiveView('reports');
                    setSelectedReportId(report.id);
                })}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>{report.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

    </div>
  );
}
