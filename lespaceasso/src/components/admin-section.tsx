
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SoireeRoster, type User, type UserRole, type KanbanTask, type KanbanColumn, type Survey, type WelcomeContent, UploadPermission, FileItem, Poll, initialRoster, initialUsersData, initialFiles, kanbanData, initialSurveys, InitialWelcomeContent, initialPolls, initialMessages, initialNotes, initialReports, initialAgendaItems, initialTransactions } from "@/lib/placeholder-data";
import { MoreVertical, Trash2, Edit, UserPlus, CalendarPlus, Vote as VoteIcon, PlusCircle, X, ClipboardList, ListTodo, FileQuestion, Users as UsersIcon, Check, XCircle, MailWarning, UserCheck, UserX, Send, Ban, CalendarClock, RotateCcw, Settings, Upload, Music, Image as ImageIcon, Home, Mail, Phone, Share, UploadCloud, DownloadCloud, Trophy, DatabaseZap, AlertTriangle, FileUp, Download as DownloadIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserProfile, Notification } from "../app/dashboard/layout";
import { getInitials } from "../app/dashboard/layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Simplified Roster Type for Form State
type FormRole = {
    id: string;
    name: string;
    description: string;
    slots: { id: string; date: string; startTime: string; endTime: string; needed: number }[];
};
type FormRoster = {
    id?: string;
    title: string;
    description: string;
    roles: FormRole[];
};

const EMPTY_ROSTER: FormRoster = {
    title: "",
    description: "",
    roles: [{ id: `role-${Date.now()}`, name: "", description: "", slots: [{ id: `slot-${Date.now()}`, date: "", startTime: "18:00", endTime: "19:00", needed: 1 }] }],
};

const EMPTY_SURVEY: Omit<Survey, 'id'> = {
    title: "",
    type: 'qcm-single',
    audience: ['admin', 'bénévole', 'artiste'],
    questions: [{ id: 'q-1', text: "", options: ["", ""] }],
};


interface AdminSectionProps {
  rosters: SoireeRoster[];
  setRosters: React.Dispatch<React.SetStateAction<SoireeRoster[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  tasks: KanbanTask[];
  setTasks: React.Dispatch<React.SetStateAction<KanbanTask[]>>;
  columns: KanbanColumn[];
  setColumns: React.Dispatch<React.SetStateAction<KanbanColumn[]>>;
  userProfile: UserProfile;
  taskToEdit: KanbanTask | null;
  setTaskToEdit: React.Dispatch<React.SetStateAction<KanbanTask | null>>;
  surveys: Survey[];
  setSurveys: React.Dispatch<React.SetStateAction<Survey[]>>;
  welcomeContent: WelcomeContent;
  setWelcomeContent: React.Dispatch<React.SetStateAction<WelcomeContent>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  polls: Poll[];
  setPolls: React.Dispatch<React.SetStateAction<Poll[]>>;
  messages: Record<string, import("/src/lib/placeholder-data").Message[]>;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, import("/src/lib/placeholder-data").Message[]>>>;
  notes: import("/src/lib/placeholder-data").Note[];
  setNotes: React.Dispatch<React.SetStateAction<import("/src/lib/placeholder-data").Note[]>>;
  reports: import("/src/lib/placeholder-data").MeetingReport[];
  setReports: React.Dispatch<React.SetStateAction<import("/src/lib/placeholder-data").MeetingReport[]>>;
  agendaItems: import("/src/lib/placeholder-data").AgendaItem[];
  setAgendaItems: React.Dispatch<React.SetStateAction<import("/src/lib/placeholder-data").AgendaItem[]>>;
  transactions: import("/src/lib/placeholder-data").Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<import("/src/lib/placeholder-data").Transaction[]>>;
}

const FileUploadInput = ({ label, icon: Icon, onFileChange, currentFile, accept, previewUrl }: { label: string, icon: React.ElementType, onFileChange: (file: File | null) => void, currentFile: File | string | null, accept: string, previewUrl?: string }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    let displayUrl = previewUrl;

    if (currentFile instanceof File) {
        displayUrl = URL.createObjectURL(currentFile);
    } else if (typeof currentFile === 'string') {
        displayUrl = currentFile;
    }

    return (
        <div>
            <Label>{label}</Label>
            <div className="flex items-center gap-4 mt-2">
                <div className="w-16 h-16 rounded-lg border flex items-center justify-center bg-muted">
                    {displayUrl ? (
                         <img src={displayUrl} alt="preview" className="object-cover rounded-lg w-full h-full" />
                    ) : (
                        <Icon className="w-8 h-8 text-muted-foreground" />
                    )}
                </div>
                <input type="file" accept={accept} ref={inputRef} className="hidden" onChange={e => onFileChange(e.target.files?.[0] || null)} />
                <div className="flex flex-col gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4"/>
                        Changer
                    </Button>
                    {currentFile && (
                        <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onFileChange(null)}>
                            <Trash2 className="mr-2 h-4 w-4"/>
                            Supprimer
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AdminSection({ 
    rosters, setRosters, 
    users, setUsers, 
    files, setFiles,
    tasks, setTasks, 
    columns, setColumns,
    userProfile, 
    taskToEdit: initialTaskToEdit, setTaskToEdit: setGlobalTaskToEdit, 
    surveys, setSurveys, 
    welcomeContent, setWelcomeContent, 
    notifications, setNotifications, 
    polls, setPolls,
    messages, setMessages,
    notes, setNotes,
    reports, setReports,
    agendaItems, setAgendaItems,
    transactions, setTransactions,
}: AdminSectionProps) {
    const { toast } = useToast();
    
    // User creation/editing state
    const [isUserModalOpen, setUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    // Roster creation/editing state
    const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
    const [currentRoster, setCurrentRoster] = useState<FormRoster>(EMPTY_ROSTER);

    // Task creation/editing state
    const [isTaskModalOpen, setTaskModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<KanbanTask | null>(null);
    const [taskFormData, setTaskFormData] = useState<{content: string; columnId: string; assignedTo: string[], priority: KanbanTask['priority'], status: KanbanTask['status']}>({ content: "", columnId: columns[0]?.id, assignedTo: [], priority: 'Moyenne', status: 'todo' });
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

    // Survey creation state
    const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
    const [newSurvey, setNewSurvey] = useState<Omit<Survey, 'id'>>(EMPTY_SURVEY);
    
    // Ban user state
    const [isBanModalOpen, setBanModalOpen] = useState(false);
    const [userToBan, setUserToBan] = useState<User | null>(null);
    const [banDuration, setBanDuration] = useState('7');

    // Permission state
    const [isPermModalOpen, setPermModalOpen] = useState(false);
    const [userForPerm, setUserForPerm] = useState<User | null>(null);
    const [permType, setPermType] = useState<'upload' | 'download'>('upload');
    const [itemForPerm, setItemForPerm] = useState<FileItem | null>(null);

    // App Settings state
    const [appName, setAppName] = useState("L'Espace Asso");
    const [notifSound, setNotifSound] = useState('default');
    const [notificationEmails, setNotificationEmails] = useState('admin1@example.com, admin2@example.com');
    const [appIcon, setAppIcon] = useState<File | null>(null);
    const [favicon, setFavicon] = useState<File | null>(null);

    // Welcome Page content state
    const [localWelcomeContent, setLocalWelcomeContent] = useState<WelcomeContent>(welcomeContent);
    const [backupFile, setBackupFile] = useState<File | null>(null);
    const restoreFileInputRef = useRef<HTMLInputElement>(null);

    const roleOptions: { id: UserRole, label: string }[] = [
        { id: 'admin', label: "Membre de l'asso" },
        { id: 'bénévole', label: "Bénévole" },
        { id: 'artiste', label: "Artiste" },
        { id: 'invité', label: "Invité" },
    ];
    
    useEffect(() => {
        if (initialTaskToEdit) {
            openTaskModal(initialTaskToEdit);
            setGlobalTaskToEdit(null);
        }
    }, [initialTaskToEdit, setGlobalTaskToEdit]);

    // User Management
    const handleSaveUser = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const roles = formData.getAll('roles') as UserRole[];

        if(userToEdit) {
            setUsers(prev => prev.map(u => u.id === userToEdit.id ? {...u, name, roles} : u));
            toast({ title: "Utilisateur modifié", description: `Les informations de ${name} ont été mises à jour.` });
        } else {
            const newUser: User = { 
                id: `user-${Date.now()}`, 
                name, 
                username: name.toLowerCase().replace(/\s/g, ''),
                avatar: `https://placehold.co/100x100.png?text=${getInitials(name, '')}`,
                roles: roles.length > 0 ? roles : ['invité'],
                status: 'active',
                contributionStatus: 'unpaid',
                contributionDueDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('fr-FR'),
                uploadPermission: 'none',
                downloadPermission: 'none',
            };
            setUsers(prev => [...prev, newUser]);
            toast({ title: "Utilisateur créé", description: `L'utilisateur ${name} a été ajouté.` });
        }
        
        setUserModalOpen(false);
        setUserToEdit(null);
    };
    
    const handleDeleteUser = (id: string) => {
        setUsers(users.filter(u => u.id !== id));
        toast({ title: "Utilisateur supprimé", description: "L'utilisateur a été supprimé.", variant: 'destructive'});
    };

    const openUserModal = (user: User | null) => {
        setUserToEdit(user);
        setUserModalOpen(true);
    };

    const handleUserApproval = (userId: string, approve: boolean) => {
        setUsers(prevUsers => prevUsers.map(u => {
            if (u.id === userId) {
                if (approve) {
                    return { ...u, status: 'active' };
                }
                return { ...u, status: 'rejected' }; // Or simply remove them
            }
            return u;
        }).filter(u => u.status !== 'rejected')); // Remove rejected users from the list

        toast({
            title: `Inscription ${approve ? 'approuvée' : 'refusée'}`,
            description: `L'utilisateur peut maintenant ${approve ? 'se connecter' : 'ne sera pas ajouté'}.`
        });
    };

    const handleResendPassword = (user: User) => {
        console.log(`===== SIMULATION EMAIL =====\nEmail de réinitialisation de mot de passe envoyé à ${user.name} (${user.username}).\n==========================`);
        toast({
            title: "Email de réinitialisation envoyé",
            description: `Un nouveau mot de passe a été envoyé à ${user.name}.`
        });
    };
    
    const handleBanUser = () => {
        if (!userToBan) return;
        
        const now = new Date();
        let bannedUntil: Date | null = null;
        let toastDescription = `L'utilisateur ${userToBan.name} a été banni définitivement.`;

        if (banDuration !== 'permanent') {
            const days = parseInt(banDuration, 10);
            bannedUntil = new Date(now.setDate(now.getDate() + days));
            toastDescription = `L'utilisateur ${userToBan.name} a été banni jusqu'au ${bannedUntil.toLocaleDateString('fr-FR')}.`;
        }
        
        setUsers(prevUsers => prevUsers.map(u => u.id === userToBan.id ? { ...u, status: 'banned', bannedUntil } : u));
        
        toast({
            title: "Utilisateur banni",
            description: toastDescription,
            variant: "destructive"
        });
        
        setBanModalOpen(false);
        setUserToBan(null);
    };
    
    const handleUnbanUser = (userId: string) => {
        setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, status: 'active', bannedUntil: null } : u));
        toast({ title: "Utilisateur réactivé" });
    };

    // Contribution Management
    const handleMarkAsPaid = (userId: string) => {
        setUsers(prevUsers => prevUsers.map(u => 
            u.id === userId 
                ? { ...u, contributionStatus: 'paid', contributionDueDate: 'N/A' } 
                : u
        ));
        toast({ title: "Cotisation enregistrée", description: "Le statut de l'utilisateur a été mis à jour." });
    };

    // Task Management
    const handleSelectAllTasks = (checked: boolean | "indeterminate") => {
        setSelectedTaskIds(checked === true ? tasks.map(t => t.id) : []);
    };
    const handleSelectTask = (taskId: string, checked: boolean) => {
        setSelectedTaskIds(prev => 
            checked ? [...prev, taskId] : prev.filter(id => id !== taskId)
        );
    };
    const handleDeleteSelectedTasks = () => {
        setTasks(tasks.filter(t => !selectedTaskIds.includes(t.id)));
        toast({
            title: `${selectedTaskIds.length} tâche(s) supprimée(s)`,
            variant: 'destructive',
        });
        setSelectedTaskIds([]);
    };
    const openTaskModal = (task: KanbanTask | null) => {
        setTaskToEdit(task);
        if (task) {
            setTaskFormData({ content: task.content, columnId: task.columnId, assignedTo: task.assignedTo, priority: task.priority, status: task.status });
        } else {
            setTaskFormData({ content: "", columnId: columns[0]?.id || '', assignedTo: [], priority: 'Moyenne', status: 'todo' });
        }
        setTaskModalOpen(true);
    };

    const handleSaveTask = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (taskToEdit) {
            setTasks(tasks.map(t => t.id === taskToEdit.id ? { ...t, ...taskFormData } : t));
            toast({ title: "Tâche modifiée", description: "La tâche a été mise à jour." });
        } else {
            const newTask: KanbanTask = {
                id: `task-${Date.now()}`,
                ...taskFormData
            };
            setTasks([...tasks, newTask]);
            toast({ title: "Tâche créée", description: "La nouvelle tâche a été ajoutée au tableau Kanban." });
        }
        setTaskModalOpen(false);
        setTaskToEdit(null);
    };

    const handleDeleteTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
        toast({ title: "Tâche supprimée", variant: 'destructive'});
    };

    const handleAssignedUserChange = (userId: string, checked: boolean) => {
        setTaskFormData(prev => {
            const newAssignedTo = checked 
                ? [...prev.assignedTo, userId]
                : prev.assignedTo.filter(id => id !== userId);
            return { ...prev, assignedTo: newAssignedTo };
        });
    };

    // Roster Management
    const handleRosterChange = <T extends keyof FormRoster>(field: T, value: FormRoster[T]) => {
        setCurrentRoster(prev => ({ ...prev, [field]: value }));
    };

    const handleRoleChange = (roleIndex: number, field: keyof FormRole, value: string) => {
        const updatedRoles = [...currentRoster.roles];
        updatedRoles[roleIndex] = { ...updatedRoles[roleIndex], [field]: value };
        handleRosterChange('roles', updatedRoles);
    };

    const handleSlotChange = (roleIndex: number, slotIndex: number, field: keyof FormRole['slots'][0], value: string | number) => {
        const updatedRoles = [...currentRoster.roles];
        const updatedSlots = [...updatedRoles[roleIndex].slots];
        updatedSlots[slotIndex] = { ...updatedSlots[slotIndex], [field]: value };
        updatedRoles[roleIndex] = { ...updatedRoles[roleIndex], slots: updatedSlots };
        handleRosterChange('roles', updatedRoles);
    };

    const addRole = () => {
        const newRole: FormRole = { id: `role-${Date.now()}`, name: "", description: "", slots: [{ id: `slot-${Date.now()}`, date: "", startTime: "18:00", endTime: "19:00", needed: 1 }] };
        handleRosterChange('roles', [...currentRoster.roles, newRole]);
    };

    const removeRole = (roleIndex: number) => {
        handleRosterChange('roles', currentRoster.roles.filter((_, i) => i !== roleIndex));
    };

    const addSlot = (roleIndex: number) => {
        const newSlot = { id: `slot-${Date.now()}`, date: "", startTime: "18:00", endTime: "19:00", needed: 1 };
        const updatedRoles = [...currentRoster.roles];
        updatedRoles[roleIndex].slots.push(newSlot);
        handleRosterChange('roles', updatedRoles);
    };

    const removeSlot = (roleIndex: number, slotIndex: number) => {
        const updatedRoles = [...currentRoster.roles];
        updatedRoles[roleIndex].slots = updatedRoles[roleIndex].slots.filter((_, i) => i !== slotIndex);
        handleRosterChange('roles', updatedRoles);
    };

    const handleSaveRoster = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const firstDate = currentRoster.roles?.[0]?.slots?.[0]?.date;

        const newRoster: SoireeRoster = {
            id: currentRoster.id || `roster-${Date.now()}`,
            title: currentRoster.title,
            description: currentRoster.description,
            date: firstDate ? new Date(firstDate) : new Date(), // This could be derived from the slots
            roles: currentRoster.roles.map(role => ({
                id: role.id,
                name: role.name,
                description: role.description,
                slots: role.slots.map(slot => ({
                    id: slot.id,
                    time: `${slot.startTime}-${slot.endTime}`, 
                    date: slot.date,
                    needed: Number(slot.needed),
                    assigned: [], // New rosters start empty
                }))
            }))
        };
        
        if (currentRoster.id) {
            setRosters(rosters.map(r => r.id === currentRoster.id ? newRoster : r));
            toast({ title: "Planning modifié", description: `Le planning "${newRoster.title}" a été mis à jour.` });
        } else {
            setRosters([...rosters, newRoster]);
            toast({ title: "Planning créé", description: `Le planning "${newRoster.title}" a été créé.` });
        }
        
        setIsRosterModalOpen(false);
    };
    
    const handleDeleteRoster = (id: string) => {
        setRosters(rosters.filter(r => r.id !== id));
        toast({ title: "Planning supprimé", description: `Le planning a été supprimé.`, variant: 'destructive'});
    };
    
    const handleEditRoster = (roster: SoireeRoster) => {
        const formRoster: FormRoster = {
            id: roster.id,
            title: roster.title,
            description: roster.description,
            roles: roster.roles.map(role => ({
                id: role.id,
                name: role.name,
                description: role.description,
                slots: roster.slots.map(slot => ({
                    id: slot.id,
                    date: slot.date,
                    startTime: slot.time.split('-')[0],
                    endTime: slot.time.split('-')[1],
                    needed: slot.needed
                }))
            }))
        };
        setCurrentRoster(formRoster);
        setIsRosterModalOpen(true);
    };

    // Survey Management
    const handleSurveyChange = (field: keyof Omit<Survey, 'id'>, value: any) => {
        setNewSurvey(prev => ({ ...prev, [field]: value }));
    };
    
    const handleAudienceChange = (role: UserRole, checked: boolean) => {
        setNewSurvey(prev => {
            const currentAudience = prev.audience;
            const newAudience = checked
                ? [...currentAudience, role]
                : currentAudience.filter(r => r !== role);
            return { ...prev, audience: newAudience };
        });
    };

    const handleQuestionChange = (qIndex: number, text: string) => {
        const updatedQuestions = [...newSurvey.questions];
        updatedQuestions[qIndex].text = text;
        handleSurveyChange('questions', updatedQuestions);
    };

    const handleOptionChange = (qIndex: number, oIndex: number, text: string) => {
        const updatedQuestions = [...newSurvey.questions];
        if (updatedQuestions[qIndex].options) {
            updatedQuestions[qIndex].options![oIndex] = text;
            handleSurveyChange('questions', updatedQuestions);
        }
    };

    const addQuestion = () => {
        const newQ = { id: `q-${Date.now()}`, text: "", options: newSurvey.type.startsWith('qcm') ? ["", ""] : undefined };
        handleSurveyChange('questions', [...newSurvey.questions, newQ]);
    };

    const removeQuestion = (qIndex: number) => {
        handleSurveyChange('questions', newSurvey.questions.filter((_, i) => i !== qIndex));
    };

    const addOption = (qIndex: number) => {
        const updatedQuestions = [...newSurvey.questions];
        if (updatedQuestions[qIndex].options) {
            updatedQuestions[qIndex].options!.push("");
            handleSurveyChange('questions', updatedQuestions);
        }
    };
    
    const removeOption = (qIndex: number, oIndex: number) => {
        const updatedQuestions = [...newSurvey.questions];
        if (updatedQuestions[qIndex].options) {
            updatedQuestions[qIndex].options = updatedQuestions[qIndex].options!.filter((_, i) => i !== oIndex);
            handleSurveyChange('questions', updatedQuestions);
        }
    };
    
    const handleSaveSurvey = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newSurvey.audience.length === 0) {
            toast({
                title: "Audience requise",
                description: "Veuillez sélectionner au moins un rôle pour ce sondage.",
                variant: "destructive"
            });
            return;
        }

        const finalSurvey: Survey = {
            ...newSurvey,
            id: `survey-${Date.now()}`
        };
        setSurveys(prev => [...prev, finalSurvey]);
        toast({ title: "Sondage créé", description: `Le sondage "${finalSurvey.title}" est maintenant disponible.`});
        setIsSurveyModalOpen(false);
        setNewSurvey(EMPTY_SURVEY);
    };

    const handleDeleteSurvey = (id: string) => {
        setSurveys(surveys.filter(s => s.id !== id));
        toast({ title: "Sondage supprimé", variant: 'destructive'});
    };

    // App Settings Management
    const handleSaveAppSettings = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // In a real app, you'd handle file uploads and save settings
        console.log({ appName, notifSound, appIcon, favicon, notificationEmails });
        toast({
            title: "Paramètres de l'application enregistrés",
            description: "Les modifications ont été prises en compte (simulation).",
        });
    }
    
    const handleWelcomeContentChange = (field: keyof WelcomeContent, value: any, index?: number) => {
        setLocalWelcomeContent(prev => {
            if (field === 'bannerImages' && index !== undefined) {
                const newImages = [...prev.bannerImages];
                newImages[index] = value;
                return { ...prev, bannerImages: newImages };
            }
            if (field === 'socials' && index !== undefined) {
                const newSocials = [...prev.socials];
                newSocials[index] = { ...newSocials[index], ...value };
                return { ...prev, socials: newSocials };
            }
            return { ...prev, [field]: value };
        });
    };

    const handleSaveWelcomeContent = (e: React.FormEvent) => {
        e.preventDefault();
        setWelcomeContent(localWelcomeContent);
        toast({ title: "Contenu de la page d'accueil mis à jour !" });
    };

    // Permission Management
    const handleSetPermission = (duration: string) => {
        if (!userForPerm) return;

        let expiresAt: Date | null = null;
        let toastMessage = `L'accès a été accordé à ${userForPerm.name}.`;

        if (duration === 'permanent') {
            // No expiration
        } else if (duration.endsWith('h')) {
            const hours = parseInt(duration.replace('h', ''));
            expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
            toastMessage = `Accès accordé à ${userForPerm.name} pour ${hours} heure(s).`;
        } else if (duration.endsWith('d')) {
            const days = parseInt(duration.replace('d', ''));
            expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
            toastMessage = `Accès accordé à ${userForPerm.name} pour ${days} jour(s).`;
        }
        
        const permField = permType === 'upload' ? 'uploadPermission' : 'downloadPermission';
        const expiryField = permType === 'upload' ? 'uploadPermissionExpiresAt' : 'downloadPermissionExpiresAt';

        setUsers(prev => prev.map(u => 
            u.id === userForPerm.id 
            ? { ...u, [permField]: 'allowed', [expiryField]: expiresAt }
            : u
        ));

        // Remove the processed notification
        if(permType === 'upload') {
            setNotifications(prev => prev.filter(n => n.userId !== userForPerm.id || n.type !== 'upload_request'));
        } else if (permType === 'download') {
            setNotifications(prev => prev.filter(n => n.userId !== userForPerm.id || n.itemId !== itemForPerm?.id || n.type !== 'download_request'));
        }
        
        toast({ title: `Permission de ${permType === 'upload' ? "téléversement" : "téléchargement"} modifiée`, description: toastMessage });
        setPermModalOpen(false);
        setUserForPerm(null);
        setItemForPerm(null);
    };
    
    const handleRevokePermission = () => {
        if (!userForPerm) return;
        const permField = permType === 'upload' ? 'uploadPermission' : 'downloadPermission';
        const expiryField = permType === 'upload' ? 'uploadPermissionExpiresAt' : 'downloadPermissionExpiresAt';

        setUsers(prev => prev.map(u => 
            u.id === userForPerm.id 
            ? { ...u, [permField]: 'none', [expiryField]: null }
            : u
        ));
        toast({ title: "Permission révoquée", description: `L'accès a été révoqué pour ${userForPerm.name}.`});
        setPermModalOpen(false);
        setUserForPerm(null);
        setItemForPerm(null);
    };

    const handleDenyRequest = () => {
        if (!userForPerm) return;

        const permField = permType === 'upload' ? 'uploadPermission' : 'downloadPermission';
        
        setUsers(prev => prev.map(u => 
            u.id === userForPerm.id 
            ? { ...u, [permField]: 'none' }
            : u
        ));

        if(permType === 'upload') {
            setNotifications(prev => prev.filter(n => n.userId !== userForPerm.id || n.type !== 'upload_request'));
        } else if (permType === 'download') {
            setNotifications(prev => prev.filter(n => n.userId !== userForPerm.id || n.itemId !== itemForPerm?.id || n.type !== 'download_request'));
        }

        toast({ title: "Demande refusée" });
        setPermModalOpen(false);
        setUserForPerm(null);
        setItemForPerm(null);
    }

    const openPermModal = (user: User, type: 'upload' | 'download', item?: FileItem) => {
        setUserForPerm(user);
        setPermType(type);
        if (item) setItemForPerm(item);
        setPermModalOpen(true);
    }
    
    const uploadRequests = notifications.filter(n => n.type === 'upload_request');
    const downloadRequests = notifications.filter(n => n.type === 'download_request');

    const handleFullReset = () => {
        setRosters([initialRoster]);
        setUsers(initialUsersData);
        setFiles(initialFiles);
        setTasks(kanbanData.tasks);
        setColumns(kanbanData.columns);
        setSurveys(initialSurveys);
        setWelcomeContent(InitialWelcomeContent);
        setPolls(initialPolls);
        setMessages(initialMessages);
        setNotes(initialNotes);
        setReports(initialReports);
        setAgendaItems(initialAgendaItems);
        setTransactions(initialTransactions);
        setNotifications([]);
        toast({ title: "Données réinitialisées !", description: "L'application a été réinitialisée à son état initial." });
    };

    const handleExportData = () => {
        const dataToExport = {
            users: users.map(u => ({...u, bannedUntil: u.bannedUntil?.toISOString() || null, uploadPermissionExpiresAt: u.uploadPermissionExpiresAt?.toISOString() || null, downloadPermissionExpiresAt: u.downloadPermissionExpiresAt?.toISOString() || null })),
            rosters: rosters.map(r => ({...r, date: r.date.toISOString()})),
            files: files.map(f => ({...f, createdAt: f.createdAt.toISOString()})),
            tasks,
            columns,
            surveys,
            welcomeContent: { ...welcomeContent, bannerImages: welcomeContent.bannerImages.map(img => (typeof img === 'string' ? img : '')) }, // Cannot serialize File object
            polls: polls.map(p => ({ ...p, dates: p.dates.map(d => ({ ...d, date: d.date.toISOString() })) })), // Serialize dates
            messages,
            notes: notes.map(n => ({...n, createdAt: n.createdAt.toISOString(), modifiedAt: n.modifiedAt.toISOString()})),
            reports: reports.map(r => ({...r, date: r.date.toString()})),
            agendaItems,
            transactions,
            notifications,
        };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        toast({ title: "Exportation réussie", description: "Le fichier de sauvegarde a été téléchargé." });
    };
    
    const handleRestoreData = () => {
        if (!backupFile) {
            toast({ variant: "destructive", title: "Aucun fichier", description: "Veuillez sélectionner un fichier de sauvegarde." });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("Le fichier est invalide.");
                const data = JSON.parse(text);

                // Add extensive validation here if needed
                
                setUsers(data.users?.map((u:any) => ({...u, bannedUntil: u.bannedUntil ? new Date(u.bannedUntil) : null, uploadPermissionExpiresAt: u.uploadPermissionExpiresAt ? new Date(u.uploadPermissionExpiresAt) : null, downloadPermissionExpiresAt: u.downloadPermissionExpiresAt ? new Date(u.downloadPermissionExpiresAt) : null})) || []);
                setRosters(data.rosters?.map((r:any) => ({...r, date: new Date(r.date)})) || []);
                setFiles(data.files?.map((f:any) => ({...f, createdAt: new Date(f.createdAt)})) || []);
                setTasks(data.tasks || []);
                setColumns(data.columns || []);
                setSurveys(data.surveys || []);
                setWelcomeContent(data.welcomeContent || InitialWelcomeContent);
                setPolls(data.polls?.map((p: any) => ({ ...p, dates: p.dates.map((d: any) => ({ ...d, date: new Date(d.date) })) })) || []);
                setMessages(data.messages || {});
                setNotes(data.notes?.map((n:any) => ({...n, createdAt: new Date(n.createdAt), modifiedAt: new Date(n.modifiedAt)})) || []);
                setReports(data.reports?.map((r:any) => ({...r, date: r.date })) || []);
                setAgendaItems(data.agendaItems || []);
                setTransactions(data.transactions || []);
                setNotifications(data.notifications || []);

                toast({ title: "Restauration réussie", description: "Les données de l'application ont été restaurées." });
                setBackupFile(null);
                if (restoreFileInputRef.current) restoreFileInputRef.current.value = "";

            } catch (error) {
                console.error("Restore error:", error);
                toast({ variant: "destructive", title: "Erreur de restauration", description: "Le fichier de sauvegarde est corrompu ou invalide." });
            }
        };
        reader.readAsText(backupFile);
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Panneau d'administration</CardTitle>
              <CardDescription>
                Gérez les utilisateurs, les plannings, les projets et les sondages de votre association.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="users" className="w-full">
                <TabsList className="w-full h-auto flex-wrap justify-start">
                  <TabsTrigger value="welcome">Accueil</TabsTrigger>
                  <TabsTrigger value="users">Utilisateurs</TabsTrigger>
                  <TabsTrigger value="approvals">Approbations</TabsTrigger>
                  <TabsTrigger value="requests">
                      Demandes
                      {(uploadRequests.length + downloadRequests.length) > 0 && <Badge className="ml-2 bg-purple-500">{uploadRequests.length + downloadRequests.length}</Badge>}
                  </TabsTrigger>
                  <TabsTrigger value="contributions">Cotisations</TabsTrigger>
                  <TabsTrigger value="plannings">Plannings</TabsTrigger>
                  <TabsTrigger value="date_polls">Sondages de dates</TabsTrigger>
                  <TabsTrigger value="projects">Projets</TabsTrigger>
                  <TabsTrigger value="surveys">Sondages</TabsTrigger>
                  <TabsTrigger value="settings">Paramètres</TabsTrigger>
                  <TabsTrigger value="data">Données</TabsTrigger>
                </TabsList>
                
                <TabsContent value="welcome" className="mt-4">
                  <Card>
                    <CardHeader>
                        <CardTitle>Gestion de la Page d'Accueil</CardTitle>
                        <CardDescription>Modifiez les informations affichées sur la page d'accueil.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveWelcomeContent} className="space-y-8">
                            <div className="space-y-2">
                                <Label htmlFor="latest-news">Dernières infos</Label>
                                <Textarea 
                                    id="latest-news" 
                                    rows={5}
                                    value={localWelcomeContent.latestNews}
                                    onChange={(e) => handleWelcomeContentChange('latestNews', e.target.value)}
                                    placeholder="Annoncez les dernières nouvelles de l'association ici..."
                                />
                            </div>
                            
                            <Separator />

                            <div className="space-y-4">
                                <Label>Images de la bannière</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {localWelcomeContent.bannerImages.map((img, index) => (
                                         <FileUploadInput 
                                            key={index}
                                            label={`Image ${index + 1}`}
                                            icon={ImageIcon}
                                            onFileChange={(file) => handleWelcomeContentChange('bannerImages', file, index)}
                                            currentFile={img}
                                            accept="image/*"
                                        />
                                    ))}
                                </div>
                            </div>

                            <Separator />
                            
                            <div className="space-y-4">
                                <Label>Informations de contact</Label>
                                <div className="space-y-2">
                                    <Label htmlFor="contact-email" className="text-sm font-normal">Email</Label>
                                    <Input 
                                        id="contact-email" 
                                        type="email"
                                        value={localWelcomeContent.contact.email}
                                        onChange={(e) => handleWelcomeContentChange('contact', {...localWelcomeContent.contact, email: e.target.value})}
                                        placeholder="contact@asso.com"
                                    />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="contact-phone" className="text-sm font-normal">Téléphone</Label>
                                    <Input 
                                        id="contact-phone" 
                                        type="tel"
                                        value={localWelcomeContent.contact.phone}
                                        onChange={(e) => handleWelcomeContentChange('contact', {...localWelcomeContent.contact, phone: e.target.value})}
                                        placeholder="01 23 45 67 89"
                                    />
                                </div>
                            </div>
                            
                             <Separator />

                            <div className="space-y-4">
                                <Label>Réseaux sociaux</Label>
                                {localWelcomeContent.socials.map((social, index) => (
                                     <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <div className="space-y-2">
                                             <Label htmlFor={`social-name-${index}`} className="text-sm font-normal">Nom du réseau</Label>
                                             <Input 
                                                id={`social-name-${index}`} 
                                                value={social.name}
                                                onChange={(e) => handleWelcomeContentChange('socials', { name: e.target.value }, index)}
                                                placeholder="Ex: Facebook"
                                             />
                                         </div>
                                         <div className="space-y-2">
                                            <Label htmlFor={`social-url-${index}`} className="text-sm font-normal">URL</Label>
                                            <Input 
                                                id={`social-url-${index}`} 
                                                value={social.url}
                                                onChange={(e) => handleWelcomeContentChange('socials', { url: e.target.value }, index)}
                                                placeholder="https://facebook.com/votrepage"
                                            />
                                         </div>
                                     </div>
                                ))}
                            </div>


                            <div className="flex justify-end pt-4">
                                <Button type="submit">Enregistrer les modifications</Button>
                            </div>
                        </form>
                    </CardContent>
                  </Card>
                </TabsContent>
    
                <TabsContent value="users" className="mt-4">
                  <Card>
                    <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle>Gestion des utilisateurs</CardTitle>
                            <CardDescription>Modifiez, bannissez ou supprimez des utilisateurs.</CardDescription>
                        </div>
                        <Button onClick={() => openUserModal(null)}><UserPlus className="mr-2 h-4 w-4" />Créer un utilisateur</Button>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>Rôles</TableHead>
                                <TableHead>Accès</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.filter(u => u.status !== 'pending_approval' && u.id !== userProfile.id).map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name || user.username}</TableCell>
                                    <TableCell className="capitalize">
                                        <div className="flex gap-1">
                                            {user.roles && user.roles.map(r => <Badge key={r} variant="secondary">{r}</Badge>)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1.5">
                                        <Badge variant={user.uploadPermission === 'allowed' ? 'default' : user.uploadPermission === 'requested' ? 'outline' : 'secondary'} className={cn('w-fit', user.uploadPermission === 'requested' && 'border-purple-500 text-purple-500')}>
                                            <UploadCloud className="mr-1.5 h-3 w-3" />
                                            {user.uploadPermission === 'allowed' ? 'Upload' : user.uploadPermission === 'requested' ? 'Demandé' : 'Aucun'}
                                        </Badge>
                                        <Badge variant={user.downloadPermission === 'allowed' ? 'default' : user.downloadPermission === 'requested' ? 'outline' : 'secondary'} className={cn('w-fit', user.downloadPermission === 'requested' && 'border-green-500 text-green-500')}>
                                            <DownloadCloud className="mr-1.5 h-3 w-3" />
                                            {user.downloadPermission === 'allowed' ? 'Download' : user.downloadPermission === 'requested' ? 'Demandé' : 'Aucun'}
                                        </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>{user.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openUserModal(user)}>
                                                    <Edit className="mr-2 h-4 w-4" />Modifier
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openPermModal(user, 'upload')}>
                                                    <UploadCloud className="mr-2 h-4 w-4" />Gérer l'upload
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openPermModal(user, 'download')}>
                                                    <DownloadCloud className="mr-2 h-4 w-4" />Gérer le download
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleResendPassword(user)}>
                                                    <Send className="mr-2 h-4 w-4" />Renvoyer le mot de passe
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />

                                                {user.status === 'banned' ? (
                                                     <DropdownMenuItem onClick={() => handleUnbanUser(user.id)}>
                                                        <RotateCcw className="mr-2 h-4 w-4" />Réactiver
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onSelect={() => { setUserToBan(user); setBanModalOpen(true); }}>
                                                        <Ban className="mr-2 h-4 w-4" />Bannir
                                                    </DropdownMenuItem>
                                                )}
                                            
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive" disabled={user.id === userProfile.id}>
                                                            <Trash2 className="mr-2 h-4 w-4" />Supprimer
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                            <AlertDialogDescription>Cette action est irréversible et supprimera l'utilisateur {user.name}.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                 <TabsContent value="approvals" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Approbations en attente</CardTitle>
                            <CardDescription>Validez ou refusez les nouvelles inscriptions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Pseudo</TableHead>
                                        <TableHead>Rôles demandés</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.filter(u => u.status === 'pending_approval').map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name || user.username}</TableCell>
                                            <TableCell>{user.username}</TableCell>
                                            <TableCell className="capitalize">
                                                 <div className="flex gap-1">
                                                    {user.roles && user.roles.map(r => <Badge key={r} variant="outline">{r}</Badge>)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="icon" onClick={() => handleUserApproval(user.id, false)}><XCircle className="h-4 w-4"/></Button>
                                                <Button size="icon" onClick={() => handleUserApproval(user.id, true)}><Check className="h-4 w-4"/></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {users.filter(u => u.status === 'pending_approval').length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">Aucune inscription en attente.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="requests" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Demandes d'accès</CardTitle>
                            <CardDescription>Gérez les demandes d'accès pour téléverser ou télécharger des fichiers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <h3 className="text-md font-semibold mb-2">Accès Upload</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Utilisateur</TableHead>
                                        <TableHead>Date de la demande</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {uploadRequests.length > 0 ? (
                                        uploadRequests.map((notif) => {
                                            const user = users.find(u => u.id === notif.userId);
                                            if (!user) return null;
                                            return (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{new Date().toLocaleDateString('fr-FR')}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button onClick={() => openPermModal(user, 'upload')}>
                                                        Gérer la demande
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                            )
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                Aucune demande en attente.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                           <h3 className="text-md font-semibold mt-6 mb-2">Accès Download</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Utilisateur</TableHead>
                                        <TableHead>Dossier demandé</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {downloadRequests.length > 0 ? (
                                        downloadRequests.map((notif) => {
                                            const user = users.find(u => u.id === notif.userId);
                                            const item = files.find(f => f.id === notif.itemId);
                                            if (!user || !item) return null;
                                            return (
                                                <TableRow key={notif.id}>
                                                    <TableCell className="font-medium">{user.name}</TableCell>
                                                    <TableCell className="font-mono">{item.name}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button onClick={() => openPermModal(user, 'download', item)}>
                                                            Gérer la demande
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                Aucune demande en attente.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="contributions" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestion des Cotisations</CardTitle>
                            <CardDescription>Suivez et mettez à jour le statut des cotisations des membres.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Échéance</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.filter(u => u.roles && (u.roles.includes('admin') || u.roles.includes('bénévole'))).map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.contributionStatus === 'paid' ? 'default' : user.contributionStatus === 'late' ? 'destructive' : 'secondary'}>
                                                    {user.contributionStatus === 'paid' ? 'À jour' : user.contributionStatus === 'unpaid' ? 'En attente' : 'En retard'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{user.contributionDueDate}</TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => handleMarkAsPaid(user.id)}
                                                    disabled={user.contributionStatus === 'paid'}
                                                >
                                                    Marquer comme payé
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
    
                <TabsContent value="plannings" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <CardTitle>Gestion des Plannings Bénévoles</CardTitle>
                                <CardDescription>Créez et gérez les tableaux d'inscription pour les événements.</CardDescription>
                            </div>
                            <Dialog open={isRosterModalOpen} onOpenChange={setIsRosterModalOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => { setCurrentRoster(EMPTY_ROSTER); setIsRosterModalOpen(true); }}><CalendarPlus className="mr-2 h-4 w-4" />Créer un planning</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                                    <DialogHeader>
                                        <DialogTitle>{currentRoster.id ? "Modifier" : "Créer"} un planning de bénévoles</DialogTitle>
                                        <DialogDescription>Définissez les rôles et les créneaux pour votre événement.</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleSaveRoster} className="flex-1 overflow-y-auto pr-6 -mr-6 space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="roster-title">Titre du planning</Label>
                                            <Input id="roster-title" value={currentRoster.title} onChange={(e) => handleRosterChange('title', e.target.value)} placeholder="Ex: Soirée Annuelle 2024" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="roster-desc">Description</Label>
                                            <Textarea id="roster-desc" value={currentRoster.description} onChange={(e) => handleRosterChange('description', e.target.value)} placeholder="Courte description de l'événement" />
                                        </div>
    
                                        <div className="space-y-4">
                                            {currentRoster.roles.map((role, roleIndex) => (
                                                <Card key={role.id} className="p-4 bg-muted">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h4 className="font-semibold">Rôle #{roleIndex + 1}</h4>
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeRole(roleIndex)} disabled={currentRoster.roles.length <= 1}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`role-name-${role.id}`}>Nom du Rôle</Label>
                                                            <Input id={`role-name-${role.id}`} value={role.name} onChange={(e) => handleRoleChange(roleIndex, 'name', e.target.value)} placeholder="Ex: Bar" required />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`role-desc-${role.id}`}>Description du Rôle</Label>
                                                            <Input id={`role-desc-${role.id}`} value={role.description} onChange={(e) => handleRoleChange(roleIndex, 'description', e.target.value)} placeholder="Servir les boissons" />
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 space-y-3">
                                                        <Label>Créneaux Horaires</Label>
                                                        {role.slots.map((slot, slotIndex) => (
                                                            <div key={slot.id} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 p-2 rounded-md border bg-background">
                                                                <div className="grid gap-1.5 flex-1">
                                                                    <Label htmlFor={`slot-date-${slot.id}`} className="text-xs">Date</Label>
                                                                    <Input id={`slot-date-${slot.id}`} type="date" value={slot.date} onChange={(e) => handleSlotChange(roleIndex, slotIndex, 'date', e.target.value)} required/>
                                                                </div>
                                                                <div className="grid gap-1.5">
                                                                    <Label htmlFor={`slot-start-${slot.id}`} className="text-xs">Début</Label>
                                                                    <Input id={`slot-start-${slot.id}`} type="time" step="3600" value={slot.startTime} onChange={(e) => handleSlotChange(roleIndex, slotIndex, 'startTime', e.target.value)} required/>
                                                                </div>
                                                                 <div className="grid gap-1.5">
                                                                    <Label htmlFor={`slot-end-${slot.id}`} className="text-xs">Fin</Label>
                                                                    <Input id={`slot-end-${slot.id}`} type="time" step="3600" value={slot.endTime} onChange={(e) => handleSlotChange(roleIndex, slotIndex, 'endTime', e.target.value)} required/>
                                                                </div>
                                                                <div className="grid gap-1.5 w-full sm:w-24">
                                                                    <Label htmlFor={`slot-needed-${slot.id}`} className="text-xs">Bénévoles</Label>
                                                                    <Input id={`slot-needed-${slot.id}`} type="number" min="1" value={slot.needed} onChange={(e) => handleSlotChange(roleIndex, slotIndex, 'needed', parseInt(e.target.value, 10) || 1)} required/>
                                                                </div>
                                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeSlot(roleIndex, slotIndex)} disabled={role.slots.length <= 1}>
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => addSlot(roleIndex)}>
                                                            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un créneau
                                                        </Button>
                                                    </div>
                                                </Card>
                                            ))}
                                            <Button type="button" variant="secondary" className="w-full" onClick={addRole}>
                                                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un rôle
                                            </Button>
                                        </div>
                                        <DialogFooter className="sticky bottom-0 bg-background/95 pt-4">
                                            <DialogClose asChild><Button type="button" variant="secondary">Annuler</Button></DialogClose>
                                            <Button type="submit">{currentRoster.id ? "Enregistrer les modifications" : "Créer le planning"}</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Titre du Planning</TableHead>
                                        <TableHead>Nombre de Rôles</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rosters.map(roster => (
                                        <TableRow key={roster.id}>
                                            <TableCell className="font-medium">{roster.title}</TableCell>
                                            <TableCell>{roster.roles.length}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEditRoster(roster)}>
                                                            <Edit className="mr-2 h-4 w-4" />Modifier
                                                        </DropdownMenuItem>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                                    <Trash2 className="mr-2 h-4 w-4" />Supprimer
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                                    <AlertDialogDescription>Cette action est irréversible et supprimera le planning "{roster.title}".</AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteRoster(roster.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                 
                <TabsContent value="date_polls" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sondages de dates</CardTitle>
                      <CardDescription>Consultez les résultats des sondages de dates pour les réunions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {polls.map(poll => {
                        const allVoters = new Set<string>();
                        poll.dates.forEach(d => {
                            Object.values(d.votes).forEach(voters => voters.forEach(v => allVoters.add(v)));
                        });

                        const stats = poll.dates.map((d, index) => ({
                            index,
                            date: d.date,
                            presentCount: d.votes.present.length,
                            remoteCount: d.votes.remote.length,
                            maybeCount: d.votes.maybe.length,
                            totalAvailable: d.votes.present.length + d.votes.remote.length,
                        }));
                    
                        stats.sort((a, b) => {
                            if (b.presentCount !== a.presentCount) return b.presentCount - a.presentCount;
                            return b.remoteCount - a.remoteCount;
                        });

                        const bestDate = stats[0];

                        return (
                          <div key={poll.id} className="p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg">{poll.title}</h3>
                            <div className="mt-4 p-4 rounded-lg bg-muted border">
                                <div className="flex items-center gap-3 mb-2">
                                    <Trophy className="h-6 w-6 text-primary" />
                                    <h4 className="text-lg font-semibold">Meilleure date</h4>
                                </div>
                                {bestDate && (bestDate.presentCount > 0 || bestDate.remoteCount > 0) ? (
                                    <div className="flex items-center justify-between text-sm py-1">
                                        <span className="font-medium">{new Date(bestDate.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                                        <Badge>{bestDate.presentCount + bestDate.remoteCount} / {allVoters.size} disponible(s)</Badge>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Pas encore de date majoritaire.</p>
                                )}
                            </div>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="projects" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <CardTitle>Gestion des Projets</CardTitle>
                                <CardDescription>Ajoutez, modifiez ou supprimez des tâches du tableau Kanban.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedTaskIds.length > 0 && (
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Supprimer ({selectedTaskIds.length})
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Cette action est irréversible et supprimera {selectedTaskIds.length} tâche(s).
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel onClick={() => setSelectedTaskIds([])}>Annuler</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleDeleteSelectedTasks} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                    Confirmer la suppression
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                                <Button onClick={() => openTaskModal(null)}><ListTodo className="mr-2 h-4 w-4" />Ajouter une tâche</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10">
                                            <Checkbox 
                                                checked={selectedTaskIds.length === tasks.length && tasks.length > 0}
                                                onCheckedChange={handleSelectAllTasks}
                                                aria-label="Tout sélectionner"
                                            />
                                        </TableHead>
                                        <TableHead>Tâche</TableHead>
                                        <TableHead>Colonne</TableHead>
                                        <TableHead>Assigné à</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tasks.map((task) => (
                                        <TableRow key={task.id} data-state={selectedTaskIds.includes(task.id) && "selected"}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedTaskIds.includes(task.id)}
                                                    onCheckedChange={(checked) => handleSelectTask(task.id, !!checked)}
                                                    aria-label={`Sélectionner la tâche ${task.content}`}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium max-w-xs truncate">{task.content}</TableCell>
                                            <TableCell>{columns.find(c => c.id === task.columnId)?.title || 'N/A'}</TableCell>
                                            <TableCell>
                                                <div className="flex -space-x-2">
                                                    {task.assignedTo.map(userId => {
                                                        const user = users.find(u => u.id === userId);
                                                        return user ? (
                                                            <Avatar key={userId} className="h-8 w-8 border-2 border-card">
                                                              <AvatarImage src={user.avatar} data-ai-hint="user avatar" />
                                                              <AvatarFallback>{getInitials(user.name, user.username)}</AvatarFallback>
                                                            </Avatar>
                                                        ) : null;
                                                    })}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openTaskModal(task)}>
                                                            <Edit className="mr-2 h-4 w-4" />Modifier
                                                        </DropdownMenuItem>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                                    <Trash2 className="mr-2 h-4 w-4" />Supprimer
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                                    <AlertDialogDescription>Cette action est irréversible et supprimera la tâche.</AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteTask(task.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
    
                <TabsContent value="surveys" className="mt-4">
                    <Card>
                    <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle>Gestion des Sondages</CardTitle>
                            <CardDescription>Créez et gérez les sondages pour l'association.</CardDescription>
                        </div>
                         <Dialog open={isSurveyModalOpen} onOpenChange={setIsSurveyModalOpen}>
                          <DialogTrigger asChild>
                            <Button onClick={() => { setNewSurvey(EMPTY_SURVEY); setIsSurveyModalOpen(true); }}><FileQuestion className="mr-2 h-4 w-4" />Créer un sondage</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <form onSubmit={handleSaveSurvey}>
                              <DialogHeader>
                                <DialogTitle>Créer un nouveau sondage</DialogTitle>
                                <DialogDescription>
                                  Renseignez les informations pour le nouveau sondage.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-6 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="survey-title">Titre du sondage</Label>
                                  <Input id="survey-title" value={newSurvey.title} onChange={(e) => handleSurveyChange('title', e.target.value)} required />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label>Audience du sondage</Label>
                                    <div className="flex items-center gap-4">
                                        {roleOptions.map(role => (
                                            <div key={role.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`audience-${role.id}`}
                                                    checked={newSurvey.audience.includes(role.id)}
                                                    onCheckedChange={(checked) => handleAudienceChange(role.id, !!checked)}
                                                />
                                                <Label htmlFor={`audience-${role.id}`} className="font-normal">{role.label}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label>Type de sondage</Label>
                                    <RadioGroup
                                        value={newSurvey.type}
                                        onValueChange={(type: Survey['type']) => handleSurveyChange('type', type)}
                                        className="flex gap-4"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="qcm-single" id="type-qcm-single" />
                                            <Label htmlFor="type-qcm-single">QCM (choix unique)</Label>
                                        </div>
                                         <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="qcm-multiple" id="type-qcm-multiple" />
                                            <Label htmlFor="type-qcm-multiple">QCM (choix multiple)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="yesno" id="type-yesno" />
                                            <Label htmlFor="type-yesno">Oui/Non</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                
                                <div className="space-y-4">
                                    <Label>Questions</Label>
                                    {newSurvey.questions.map((q, qIndex) => (
                                        <Card key={q.id} className="p-4 bg-muted">
                                            <div className="flex justify-between items-center mb-2">
                                                <Label htmlFor={`q-text-${q.id}`}>Question {qIndex + 1}</Label>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(qIndex)} disabled={newSurvey.questions.length <= 1}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                            <Textarea id={`q-text-${q.id}`} value={q.text} onChange={(e) => handleQuestionChange(qIndex, e.target.value)} placeholder="Texte de la question" required />
                                            
                                            {newSurvey.type.startsWith('qcm') && (
                                                <div className="mt-4 space-y-2">
                                                    <Label>Options de réponse</Label>
                                                    {q.options?.map((opt, oIndex) => (
                                                        <div key={oIndex} className="flex items-center gap-2">
                                                            <Input value={opt} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} placeholder={`Option ${oIndex + 1}`} required />
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(qIndex, oIndex)} disabled={q.options && q.options.length <= 2}>
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => addOption(qIndex)}>
                                                        <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une option
                                                    </Button>
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                    <Button type="button" variant="secondary" onClick={addQuestion} className="w-full">
                                        <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une question
                                    </Button>
                                </div>
                                
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button type="button" variant="secondary">Annuler</Button>
                                </DialogClose>
                                <Button type="submit">Créer le sondage</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Titre du sondage</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Audience</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {surveys.filter(s => s.type !== 'date').map((survey) => (
                                    <TableRow key={survey.id}>
                                        <TableCell className="font-medium">{survey.title}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{survey.type.toUpperCase()}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {survey.audience.map(role => (
                                                    <Badge key={role} variant="secondary" className="capitalize">{role}</Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem disabled><Edit className="mr-2 h-4 w-4" />Modifier</DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />Supprimer
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle></AlertDialogHeader>
                                                        <AlertDialogDescription>Cette action est irréversible et supprimera le sondage.</AlertDialogDescription>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteSurvey(survey.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                      </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="settings" className="mt-4">
                  <Card>
                    <CardHeader>
                        <CardTitle>Paramètres de l'application</CardTitle>
                        <CardDescription>Personnalisez l'apparence et le comportement général de l'application.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveAppSettings} className="space-y-8">
                            <div className="space-y-4">
                                <Label htmlFor="appName">Nom de l'application</Label>
                                <Input id="appName" value={appName} onChange={(e) => setAppName(e.target.value)} />
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FileUploadInput 
                                    label="Icône de l'application"
                                    icon={ImageIcon}
                                    onFileChange={setAppIcon}
                                    currentFile={appIcon}
                                    accept="image/png, image/jpeg"
                                />
                                <FileUploadInput 
                                    label="Favicon"
                                    icon={ImageIcon}
                                    onFileChange={setFavicon}
                                    currentFile={favicon}
                                    accept="image/x-icon, image/png, image/svg+xml"
                                />
                            </div>
                            
                            <Separator />

                            <div className="space-y-4">
                                <Label htmlFor="notifSound">Son des notifications</Label>
                                <Select value={notifSound} onValueChange={setNotifSound}>
                                    <SelectTrigger id="notifSound" className="w-full md:w-1/2">
                                        <SelectValue placeholder="Choisir un son" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">Défaut (Ting)</SelectItem>
                                        <SelectItem value="discret">Discret (Pop)</SelectItem>
                                        <SelectItem value="alerte">Alerte (Klaxon)</SelectItem>
                                        <SelectItem value="aucun">Aucun</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                             <Separator />

                            <div className="space-y-4">
                                <Label htmlFor="notificationEmails">Emails pour les notifications admin</Label>
                                <p className="text-sm text-muted-foreground">
                                    Les notifications importantes (nouvelles inscriptions, demandes d'accès...) seront envoyées à ces adresses. Séparez les adresses par une virgule.
                                </p>
                                <Textarea 
                                    id="notificationEmails" 
                                    value={notificationEmails} 
                                    onChange={(e) => setNotificationEmails(e.target.value)}
                                    placeholder="admin@example.com, autre.admin@example.com"
                                    rows={3}
                                />
                            </div>
                            
                            <div className="flex justify-end pt-4">
                                <Button type="submit">Enregistrer les paramètres</Button>
                            </div>
                        </form>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="data" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestion des données (Bêta)</CardTitle>
                            <CardDescription>Actions pour gérer les données de l'application pendant la phase de test.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 border rounded-lg space-y-4">
                                <h4 className="font-semibold">Exporter les données</h4>
                                <p className="text-sm text-muted-foreground">Téléchargez une sauvegarde de toutes les données de l'application au format JSON.</p>
                                <Button onClick={handleExportData}>
                                    <DownloadIcon className="mr-2 h-4 w-4" />
                                    Exporter les données
                                </Button>
                            </div>
                            <div className="p-4 border rounded-lg space-y-4">
                                <h4 className="font-semibold">Importer une sauvegarde</h4>
                                <p className="text-sm text-muted-foreground">Restaurez l'application à un état précédent à partir d'un fichier de sauvegarde. Attention, cela écrasera toutes les données actuelles.</p>
                                <div className="flex items-center gap-2">
                                    <Input
                                        ref={restoreFileInputRef}
                                        type="file"
                                        accept=".json"
                                        onChange={(e) => setBackupFile(e.target.files?.[0] || null)}
                                        className="max-w-xs"
                                    />
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button disabled={!backupFile}><FileUp className="mr-2 h-4 w-4" />Restaurer</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Restaurer la sauvegarde ?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Cette action est irréversible. Toutes les données actuelles seront remplacées par le contenu du fichier `{backupFile?.name}`.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleRestoreData} >Confirmer la restauration</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                            <Separator />
                            <Alert variant="destructive" className="max-w-md">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Zone de danger</AlertTitle>
                                <AlertDescription>
                                    L'action ci-dessous est irréversible et effacera toutes les données de l'application pour tous les utilisateurs.
                                </AlertDescription>
                            </Alert>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        <DatabaseZap className="mr-2 h-4 w-4"/>
                                        Réinitialiser toutes les données
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Cette action est irréversible. Toutes les données, y compris les utilisateurs, les messages, les fichiers et les paramètres, seront supprimées et remises à leur état initial.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleFullReset} className="bg-destructive hover:bg-destructive/90">
                                            Je comprends, réinitialiser
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Dialog open={isUserModalOpen} onOpenChange={(isOpen) => { if (!isOpen) setUserToEdit(null); setUserModalOpen(isOpen); }}>
            <DialogContent>
                <form onSubmit={handleSaveUser}>
                    <DialogHeader>
                        <DialogTitle>{userToEdit ? "Modifier l'utilisateur" : "Créer un nouvel utilisateur"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom de l'utilisateur</Label>
                            <Input id="name" name="name" placeholder="Jean Dupont" required defaultValue={userToEdit?.name || ''} />
                        </div>
                         <div className="space-y-2">
                            <Label>Rôles</Label>
                            <div className="flex flex-col space-y-2">
                                {(['admin', 'bénévole', 'artiste', 'invité'] as UserRole[]).map(role => (
                                    <div key={role} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`role-${role}`} 
                                            name="roles"
                                            value={role}
                                            defaultChecked={userToEdit?.roles.includes(role)}
                                        />
                                        <Label htmlFor={`role-${role}`} className="font-normal capitalize">{role}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Annuler</Button></DialogClose>
                        <Button type="submit">{userToEdit ? "Enregistrer" : "Créer"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isBanModalOpen} onOpenChange={setBanModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Bannir {userToBan?.name}</DialogTitle>
                    <DialogDescription>Sélectionnez une durée pour le bannissement ou rendez-le permanent.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="ban-duration">Durée du bannissement</Label>
                    <Select value={banDuration} onValueChange={setBanDuration}>
                        <SelectTrigger id="ban-duration">
                            <SelectValue placeholder="Choisir une durée" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">1 jour</SelectItem>
                            <SelectItem value="7">7 jours</SelectItem>
                            <SelectItem value="30">30 jours</SelectItem>
                            <SelectItem value="permanent">Permanent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="secondary">Annuler</Button></DialogClose>
                    <Button variant="destructive" onClick={handleBanUser}>Confirmer le bannissement</Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
          
           <Dialog open={isPermModalOpen} onOpenChange={setPermModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Gérer l'accès {permType === 'upload' ? 'au téléversement' : 'au téléchargement'}</DialogTitle>
                        <DialogDescription>
                            Gérer la permission pour <strong>{userForPerm?.name}</strong>.
                            {permType === 'download' && itemForPerm && ` Pour le dossier : ${itemForPerm.name}`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        {(userForPerm?.uploadPermission === 'requested' && permType === 'upload') && (
                            <Alert variant="default" className="border-purple-500">
                                <UploadCloud className="h-4 w-4" />
                                <AlertTitle>Demande d'upload en attente</AlertTitle>
                                <AlertDescription>
                                    Cet utilisateur a demandé la permission de téléverser des fichiers.
                                </AlertDescription>
                            </Alert>
                        )}
                         {(userForPerm?.downloadPermission === 'requested' && permType === 'download') && (
                            <Alert variant="default" className="border-green-500">
                                <DownloadCloud className="h-4 w-4" />
                                <AlertTitle>Demande de download en attente</AlertTitle>
                                <AlertDescription>
                                    Cet utilisateur a demandé la permission de télécharger le dossier "{itemForPerm?.name}".
                                </AlertDescription>
                            </Alert>
                        )}
                        <div>
                            <Label>Accorder une permission temporaire</Label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <Button variant="outline" onClick={() => handleSetPermission('1h')}>1 heure</Button>
                                <Button variant="outline" onClick={() => handleSetPermission('24h')}>24 heures</Button>
                                <Button variant="outline" onClick={() => handleSetPermission('7d')}>7 jours</Button>
                                <Button variant="outline" onClick={() => handleSetPermission('permanent')}>Permanent</Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-between">
                        {(userForPerm?.[permType === 'upload' ? 'uploadPermission' : 'downloadPermission'] === 'allowed') ? (
                            <Button variant="destructive" onClick={handleRevokePermission}>Révoquer l'accès</Button>
                        ) : (
                            <Button variant="destructive" onClick={handleDenyRequest}>Refuser la demande</Button>
                        )}
                        <DialogClose asChild><Button variant="secondary">Fermer</Button></DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          
          <Dialog open={isTaskModalOpen} onOpenChange={setTaskModalOpen}>
            <DialogContent className="max-w-lg">
                <form onSubmit={handleSaveTask}>
                    <DialogHeader>
                        <DialogTitle>{taskToEdit ? "Modifier la tâche" : "Créer une nouvelle tâche"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="task-content">Description de la tâche</Label>
                            <Textarea id="task-content" value={taskFormData.content} onChange={(e) => setTaskFormData({...taskFormData, content: e.target.value})} placeholder="Ex: Contacter les partenaires..." required />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="task-column">Colonne</Label>
                                <Select value={taskFormData.columnId} onValueChange={(value) => setTaskFormData({...taskFormData, columnId: value})}>
                                    <SelectTrigger id="task-column">
                                        <SelectValue placeholder="Sélectionner une colonne" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {columns.map(col => (
                                            <SelectItem key={col.id} value={col.id}>{col.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="task-priority">Priorité</Label>
                                <Select value={taskFormData.priority} onValueChange={(value: KanbanTask['priority']) => setTaskFormData({...taskFormData, priority: value})}>
                                    <SelectTrigger id="task-priority">
                                        <SelectValue placeholder="Sélectionner une priorité" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Basse">Basse</SelectItem>
                                        <SelectItem value="Moyenne">Moyenne</SelectItem>
                                        <SelectItem value="Haute">Haute</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                         </div>
                        <div className="space-y-2">
                            <Label>Assigner à</Label>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                               {users.filter(u => u.roles && !u.roles.includes('invité')).map(user => (
                                 <div key={user.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`assign-${user.id}`}
                                        checked={taskFormData.assignedTo.includes(user.id)}
                                        onCheckedChange={(checked) => handleAssignedUserChange(user.id, !!checked)}
                                    />
                                    <Label htmlFor={`assign-${user.id}`} className="font-normal flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={user.avatar} data-ai-hint="user avatar" />
                                            <AvatarFallback>{getInitials(user.name, user.username)}</AvatarFallback>
                                        </Avatar>
                                        {user.name}
                                    </Label>
                                 </div>
                               ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Annuler</Button></DialogClose>
                        <Button type="submit">{taskToEdit ? "Enregistrer" : "Créer la tâche"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        </div>
      );
}
