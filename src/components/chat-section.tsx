
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { allChannels, initialUsersData, FileItem, Message as MessageType, LinkPreview, User as UserData, Channel as ChannelType } from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";
import { Search, Send, Users, User, Smile, MoreHorizontal, Pencil, Trash2, Lock, Paperclip, File as FileIcon, Video, Music, Check, CheckCheck, Link as LinkIcon, X, PlusCircle, MoreVertical, Edit, FileImage } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile, Notification } from "../app/dashboard/layout";
import { getInitials } from "../app/dashboard/layout";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChatSectionProps {
  userProfile: UserProfile;
  messages: Record<string, MessageType[]>;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, MessageType[]>>>;
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const URL_REGEX = /https?:\/\/[^\s/$.?#].[^\s]*/g;


export default function ChatSection({ userProfile, messages, setMessages, setFiles, notifications, setNotifications }: ChatSectionProps) {
  const { toast } = useToast();
  const [messageInput, setMessageInput] = useState("");
  const [activeChannelId, setActiveChannelId] = useState('g-1');
  const [editingMessage, setEditingMessage] = useState<{ id: string; text: string } | null>(null);
  const [previewingMedia, setPreviewingMedia] = useState<{type: 'image' | 'video', url: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isNewDmModalOpen, setNewDmModalOpen] = useState(false);
  const [isChannelModalOpen, setChannelModalOpen] = useState(false);
  const [channelToEdit, setChannelToEdit] = useState<ChannelType | null>(null);
  const [localChannels, setLocalChannels] = useState<ChannelType[]>(allChannels);
  const [gifSearchTerm, setGifSearchTerm] = useState("");
  const [gifResults, setGifResults] = useState<any[]>([]);
  const [isGifPopoverOpen, setGifPopoverOpen] = useState(false);

  
  const currentUser = { name: userProfile.name, username: userProfile.username, avatar: userProfile.avatarUrl, id: userProfile.id, status: 'active' };
  
  const publicChannels = localChannels.filter(c => !c.adminOnly && c.type === 'group');
  const adminChannels = localChannels.filter(c => c.adminOnly && c.type === 'group');
  const directMessages = localChannels.filter(c => c.type === 'dm');

  const activeChannel = localChannels.find(c => c.id === activeChannelId) || localChannels[0];
  const activeChannelMessages = messages[activeChannelId] || [];

  const chatNotifications = useMemo(() => {
    return notifications.filter(n => n.type === 'chat');
  }, [notifications]);

  const unreadCounts = useMemo(() => {
    return chatNotifications.reduce((acc, notif) => {
        if (notif.channelId) {
            acc[notif.channelId] = (acc[notif.channelId] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);
  }, [chatNotifications]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChannelMessages, activeChannelId]);

  const handleChannelSelect = (channelId: string) => {
    setActiveChannelId(channelId);
    // Clear notifications for this channel
    if (unreadCounts[channelId]) {
        setNotifications(prev => prev.filter(n => n.channelId !== channelId));
    }
  };


  const handleSendMessage = async () => {
    if (messageInput.trim() === "" || !activeChannelId) return;

    const newMessage: MessageType = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      text: messageInput,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      status: 'sent',
    };
    
    setMessages(prev => ({
        ...prev,
        [activeChannelId]: [...(prev[activeChannelId] || []), newMessage]
    }));
    
    setTimeout(() => {
        setMessages(prev => ({ ...prev, [activeChannelId]: prev[activeChannelId].map(m => m.id === newMessage.id ? {...m, status: 'delivered'} : m) }));
    }, 500);
     setTimeout(() => {
        setMessages(prev => ({ ...prev, [activeChannelId]: prev[activeChannelId].map(m => m.id === newMessage.id ? {...m, status: 'read'} : m) }));
    }, 2000);

    setMessageInput("");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 1 * 1024 * 1024 * 1024; // 1 GB
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "Fichier trop volumineux", description: "La taille du fichier ne doit pas dépasser 1 Go.", variant: "destructive" });
      return;
    }

    const fileURL = URL.createObjectURL(file);
    let fileType: MessageType['type'] = 'file';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';
    else if (file.type.startsWith('audio/')) fileType = 'audio';

    const newMessage: MessageType = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      text: `Fichier partagé : ${file.name}`,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      type: fileType,
      url: fileURL,
      fileName: file.name,
      status: 'sent',
    };

     setMessages(prev => ({
        ...prev,
        [activeChannelId]: [...(prev[activeChannelId] || []), newMessage]
    }));
    
    const newFileItem: FileItem = {
      id: `file-chat-${Date.now()}`,
      name: file.name,
      type: 'file',
      folder: "Fichiers du chat",
      modifiedBy: userProfile.id,
      url: fileURL,
      createdAt: new Date(),
      status: 'active',
    };
    setFiles(prevFiles => [newFileItem, ...prevFiles]);

    toast({ title: "Fichier partagé", description: `${file.name} a été ajouté dans "Fichiers > Fichiers du chat".` });
    
    if(fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleSendGif = (gif: any) => {
    if (!activeChannelId) return;

    const newMessage: MessageType = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      text: `GIF: ${gif.title}`,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      type: 'image', // Treat GIFs as images for rendering
      url: gif.images.fixed_height.url,
      fileName: `${gif.id}.gif`,
      status: 'sent',
    };
    
    setMessages(prev => ({
        ...prev,
        [activeChannelId]: [...(prev[activeChannelId] || []), newMessage]
    }));

    setGifPopoverOpen(false);
    setGifSearchTerm("");
    setGifResults([]);
  };

  const handleEditMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingMessage || !activeChannelId) return;
    
    const newText = (e.currentTarget.elements.namedItem('editedMessage') as HTMLTextAreaElement).value;
    if (newText) {
        setMessages(prev => ({ ...prev, [activeChannelId]: prev[activeChannelId].map(msg => msg.id === editingMessage.id ? { ...msg, text: newText } : msg) }));
    }
    setEditingMessage(null);
  };

  const handleDeleteMessage = (id: string) => {
    if (activeChannelId) {
      setMessages(prev => ({ ...prev, [activeChannelId]: prev[activeChannelId].filter(msg => msg.id !== id) }));
    }
  };
  
  const handleStartNewDm = (user: UserData) => {
    const channelId = [currentUser.id, user.id].sort().join('-');
    const existingChannel = localChannels.find(c => c.id === channelId);

    if (!existingChannel) {
        const newChannel: ChannelType = {
            id: channelId,
            name: user.name,
            type: 'dm' as const,
            adminOnly: false,
            description: `Message privé avec ${user.name}`
        };
        setLocalChannels(prev => [...prev, newChannel]);
    }
    
    handleChannelSelect(channelId);
    setNewDmModalOpen(false);
  }

  const handleDeleteConversation = (channelId: string) => {
      setLocalChannels(prev => prev.filter(c => c.id !== channelId));
      setMessages(prev => {
          const newMessages = {...prev};
          delete newMessages[channelId];
          return newMessages;
      });

      if (activeChannelId === channelId) {
          handleChannelSelect('g-1');
      }

      toast({
          title: "Conversation supprimée",
          description: "La conversation a été supprimée définitivement.",
          variant: "destructive"
      });
  };
  
  const handleSaveChannel = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const description = formData.get('description') as string;
      const adminOnly = formData.get('adminOnly') === 'on';

      if(channelToEdit) {
          setLocalChannels(prev => prev.map(c => c.id === channelToEdit.id ? {...c, name, description, adminOnly} : c));
          toast({ title: "Canal modifié", description: `Le canal "${name}" a été mis à jour.`});
      } else {
          const newChannel: ChannelType = {
              id: `g-${Date.now()}`,
              name,
              description,
              adminOnly,
              type: 'group'
          };
          setLocalChannels(prev => [...prev, newChannel]);
          setMessages(prev => ({...prev, [newChannel.id]: [] }));
          handleChannelSelect(newChannel.id);
          toast({ title: "Canal créé", description: `Le canal "${name}" a été créé.`});
      }
      setChannelModalOpen(false);
      setChannelToEdit(null);
  };
  
  const handleDeleteChannel = (channelId: string) => {
      setLocalChannels(prev => prev.filter(c => c.id !== channelId));
      setMessages(prev => {
          const newMessages = {...prev};
          delete newMessages[channelId];
          return newMessages;
      });
      if (activeChannelId === channelId) {
          handleChannelSelect('g-1');
      }
      toast({ title: "Canal supprimé", description: "Le canal de discussion a été supprimé.", variant: "destructive" });
  };
  
  const openChannelModal = (channel: ChannelType | null) => {
      setChannelToEdit(channel);
      setChannelModalOpen(true);
  };

  const renderMessageContent = (msg: MessageType) => {
    switch (msg.type) {
      case 'image':
        return (
          <Image
            src={msg.url!}
            alt={msg.fileName || 'Image partagée'}
            width={250}
            height={180}
            className="rounded-lg object-cover max-w-xs cursor-pointer"
            data-ai-hint="shared image"
            onClick={() => setPreviewingMedia({type: 'image', url: msg.url!})}
          />
        );
      case 'video':
        return (
          <div className="relative w-full max-w-xs cursor-pointer" onClick={() => setPreviewingMedia({type: 'video', url: msg.url!})}>
            <video src={msg.url} className="rounded-lg" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Video className="h-10 w-10 text-white" />
            </div>
          </div>
        );
      case 'audio':
        return (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-background/30 w-[280px]">
                <Music className="h-5 w-5 text-foreground/80 flex-shrink-0" />
                <audio src={msg.url} controls className="w-full h-10" />
            </div>
        );
      case 'file':
        return (
          <a href={msg.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md border p-2 bg-background/30 hover:bg-background/50">
            <FileIcon className="h-5 w-5 text-muted-foreground"/>
            <span className="text-sm font-medium">{msg.fileName}</span>
          </a>
        )
      default:
        return (
          <div className="space-y-2">
            <p className="text-sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.text}</p>
          </div>
        );
    }
  };

  // --- GIF & Emoji Additions ---
  const EMOJI_CATEGORIES = {
    "Smileys & People": ["😀", "😂", "😍", "🤔", "😊", "🥳", "😎", "😭", "😡", "🙏", "👍", "👎", "👋", "❤️"],
    "Animals & Nature": ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🌿", "🌸", "☀️", "🌙"],
    "Food & Drink": ["🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🌽", "🥕", "🧄", "🧅", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🌭", "🍔", "🍟", "🍕", "🥪", "🥙", "🧆", "🌮", "🌯", "🥗", "🥘", "🥫", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟", "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡", "🍧", "🍨", "🍦", "🥧", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪", "🌰", "🥜", "🍯", "🥛", "🍼", "☕", "🍵", "🧃", "🥤", "🍶", "🍺", "🍻", "🥂", "🍷", "🥃", "🍸", "🍹", "🧉", "🍾", "🧊", "🥄", "🍴", "🍽️", "🥣", "🥡", "🥢", "🧂"],
    "Activities": ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱", "🏓", "🏸", "🥅", "🏒", "🏑", "🏏", "⛳", "🏹", "🎣", "🥊", "🥋", "🎽", "🛹", "🛷", "⛸️", "🥌", "🎿", "⛷️", "🏂", "🏋️‍♀️", "🏋️‍♂️", "🤼‍♀️", "‍♂️", "🤸‍♀️", "🤸‍♂️", "🤺", "𤾾‍♀️", "𤾾‍♂️", "🏌️‍♀️", "🏌️‍♂️", "🏇", "🧘‍♀️", "🧘‍♂️", "🏄‍♀️", "🏄‍♂️", "🏊‍♀️", "🏊‍♂️", "🤽‍♀️", "🤽‍♂️", "🚣‍♀️", "🚣‍♂️", "🧗‍♀️", "🧗‍♂️", "🚵‍♀️", "🚵‍♂️", "🚴‍♀️", "🚴‍♂️", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "🏵️", "🎗️", "🎫", "🎟️", "🎪", "🤹‍♀️", "🤹‍♂️", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼", "🎹", "🥁", "🎷", "🎺", "🎸", "🪕", "🎻", "🎲", "♟️", "🎯", "🎳", "🎮", "🎰"],
    "Objects": ["💻", "📱", "⌚", "📷", "💡", "🎉", "🎁", "🔥", "🚀"]
  };
  
  const searchGifs = async (term: string) => {
    if (!term) {
        setGifResults([]);
        return;
    }
    // This is a simulation. In a real app, you'd use a Giphy API key.
    // NEVER expose API keys on the client-side. This should be a server-side call.
    try {
        const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=pLURtK4i5iO4yA4V2A8SAlYgA22dLPSQ&q=${encodeURIComponent(term)}&limit=12`);
        const { data } = await response.json();
        setGifResults(data);
    } catch (error) {
        console.error("Failed to fetch GIFs:", error);
        toast({ title: "Erreur GIF", description: "Impossible de charger les GIFs.", variant: "destructive" });
    }
  };
  
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
        searchGifs(gifSearchTerm);
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [gifSearchTerm]);


  const allUsersMap = [currentUser, ...initialUsersData].reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {} as Record<string, (typeof currentUser & {username?: string}) | (typeof initialUsersData)[0]>);


  return (
    <>
    <div className="flex h-full">
      <div className="w-1/4 min-w-[250px] bg-card border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Messagerie</h2>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." className="pl-8" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
             <div className="flex items-center justify-between mt-4 px-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase">Canaux Publics</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openChannelModal(null)}>
                    <PlusCircle className="h-4 w-4" />
                </Button>
            </div>
            <div className="mt-1 space-y-1">
              {publicChannels.map((channel) => (
                  <Button key={channel.id} variant={activeChannelId === channel.id ? "secondary" : "ghost"} className="w-full justify-start gap-2 relative" onClick={() => handleChannelSelect(channel.id)}>
                    <Users className="h-4 w-4" /> 
                    <span className="flex-1 text-left truncate">{channel.name}</span>
                    {!!unreadCounts[channel.id] && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    )}
                  </Button>
                ))}
            </div>
            {userProfile.role === 'admin' && (
              <>
                <div className="flex items-center justify-between mt-4 px-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase">Canaux Admins</h3>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openChannelModal(null)}>
                        <PlusCircle className="h-4 w-4" />
                    </Button>
                </div>
                <div className="mt-1 space-y-1">
                  {adminChannels.map((channel) => (
                      <Button key={channel.id} variant={activeChannelId === channel.id ? "secondary" : "ghost"} className="w-full justify-start gap-2 relative" onClick={() => handleChannelSelect(channel.id)}>
                        <Lock className="h-4 w-4" /> 
                        <span className="flex-1 text-left truncate">{channel.name}</span>
                        {!!unreadCounts[channel.id] && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </Button>
                    ))}
                </div>
              </>
            )}
            <div className="flex items-center justify-between mt-4 px-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase">Messages Privés</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setNewDmModalOpen(true)}>
                    <PlusCircle className="h-4 w-4" />
                </Button>
            </div>
            <div className="mt-1 space-y-1">
              {directMessages.map((channel) => {
                  const dmPartnerId = channel.id.split('-').find(id => id !== currentUser.id);
                  const user = allUsersMap[dmPartnerId || ''];
                  if (!user) return null;
                  return (
                    <div key={channel.id} className="relative group">
                        <Button variant={activeChannelId === channel.id ? "secondary" : "ghost"} className="w-full justify-start gap-2 h-auto py-2 pr-8" onClick={() => handleChannelSelect(channel.id)}>
                             <div className="relative">
                                <Avatar className="h-8 w-8">
                                   <AvatarImage src={user.avatar} data-ai-hint="user avatar" />
                                   <AvatarFallback>{getInitials(user.name, user.username)}</AvatarFallback>
                                </Avatar>
                                {user.status === 'active' && (
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />
                                )}
                             </div>
                             <span className="flex-1 text-left truncate">{user.name}</span>
                            {!!unreadCounts[channel.id] && (
                                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                            )}
                        </Button>
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Supprimer la conversation ?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Cette action est irréversible et supprimera définitivement tous les messages échangés avec {user.name}.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteConversation(channel.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Supprimer</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </ScrollArea>
      </div>
      <div className="flex-1 flex flex-col bg-background/50">
        <div className="p-4 border-b flex items-center justify-between gap-4 bg-card">
          <div className="flex items-center gap-4">
              <Avatar><AvatarFallback>{getInitials(activeChannel.name, '')}</AvatarFallback></Avatar>
              <div>
                <h3 className="font-semibold">{activeChannel.name}</h3>
                <p className="text-sm text-muted-foreground">{activeChannel.description}</p>
              </div>
          </div>
          {userProfile.role === 'admin' && activeChannel.type === 'group' && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5"/></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => openChannelModal(activeChannel)}>
                        <Edit className="mr-2 h-4 w-4" /> Modifier le canal
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={e => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4" /> Supprimer le canal
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer le canal "{activeChannel.name}"?</AlertDialogTitle>
                                <AlertDialogDescription>Cette action est irréversible. Tous les messages de ce canal seront définitivement perdus.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteChannel(activeChannel.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {activeChannelMessages.map((msg) => {
              const user = allUsersMap[msg.userId];
              const isCurrentUser = msg.userId === currentUser.id;
              const MessageStatus = () => {
                const icon = msg.status === 'read' ? <CheckCheck className="h-4 w-4" /> : <Check className="h-4 w-4" />;
                if (msg.status === 'sent' || msg.status === 'delivered' || msg.status === 'read') {
                  return icon;
                }
                return null;
              };

              return (
                <div key={msg.id} className={cn("flex items-end gap-2 group", isCurrentUser ? "justify-end" : "justify-start")}>
                  {!isCurrentUser && user && (
                    <Avatar className="h-9 w-9">
                       <AvatarImage src={user.avatar} data-ai-hint="user avatar" />
                       <AvatarFallback>{getInitials(user.name, user.username)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("flex items-center gap-1", isCurrentUser ? "flex-row-reverse" : "")}>
                    {isCurrentUser && (
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {msg.type === 'text' && (<DropdownMenuItem onSelect={() => setEditingMessage({ id: msg.id, text: msg.text })}><Pencil className="mr-2 h-4 w-4" /> Modifier</DropdownMenuItem>)}
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}><Trash2 className="mr-2 h-4 w-4" /> Supprimer</DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><DialogTitle>Voulez-vous vraiment supprimer ce message ?</DialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteMessage(msg.id)}>Supprimer</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                     <div className={cn("max-w-md p-3 rounded-lg border", isCurrentUser ? "bg-user-message text-user-message-foreground" : "bg-card")}>
                        {!isCurrentUser && user && <p className="text-xs font-semibold mb-1 text-primary">{user.name}</p>}
                        {renderMessageContent(msg)}
                        <div className="flex items-center justify-end gap-1 text-xs mt-1 opacity-70">
                          <span>{msg.timestamp}</span>
                          {isCurrentUser && <MessageStatus />}
                        </div>
                      </div>
                  </div>
                   {isCurrentUser && user && (
                    <Avatar className="h-9 w-9"><AvatarImage src={user.avatar} data-ai-hint="user avatar" /><AvatarFallback>{getInitials(user.name, user.username)}</AvatarFallback></Avatar>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-card">
          <div className="relative">
            <Input placeholder="Écrire un message..." className="pr-40" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}/>
             <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,video/*,audio/*,application/pdf" />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                 <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Joindre un fichier" onClick={() => fileInputRef.current?.click()}><Paperclip className="h-4 w-4" /></Button>
                
                <Popover open={isGifPopoverOpen} onOpenChange={setGifPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 font-bold" aria-label="Ajouter un GIF">GIF</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="p-2">
                        <Input 
                            placeholder="Rechercher des GIFs..." 
                            value={gifSearchTerm}
                            onChange={(e) => setGifSearchTerm(e.target.value)}
                        />
                    </div>
                    <ScrollArea className="h-72">
                        <div className="grid grid-cols-2 gap-1 p-2">
                            {gifResults.map(gif => (
                                <button key={gif.id} onClick={() => handleSendGif(gif)} className="focus:outline-none focus:ring-2 focus:ring-primary rounded-md overflow-hidden">
                                    <Image src={gif.images.fixed_width.url} width={gif.images.fixed_width.width} height={gif.images.fixed_width.height} alt={gif.title} className="w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Ajouter un emoji"><Smile className="h-4 w-4" /></Button></PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="end">
                        <Tabs defaultValue={Object.keys(EMOJI_CATEGORIES)[0]} className="w-full">
                            <TabsList className="w-full justify-start rounded-b-none px-2 h-auto">
                                {Object.keys(EMOJI_CATEGORIES).map(category => (
                                    <TabsTrigger key={category} value={category} className="text-xs px-2 py-1.5">{category}</TabsTrigger>
                                ))}
                            </TabsList>
                            <ScrollArea className="h-56">
                            {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
                                <TabsContent key={category} value={category}>
                                    <div className="grid grid-cols-8 gap-1 p-2">
                                        {emojis.map(emoji => (
                                            <Button key={emoji} variant="ghost" size="icon" className="text-xl" onClick={() => setMessageInput(messageInput + emoji)}>{emoji}</Button>
                                        ))}
                                    </div>
                                </TabsContent>
                            ))}
                            </ScrollArea>
                        </Tabs>
                    </PopoverContent>
                </Popover>
                <Button size="icon" className="h-8 w-8" aria-label="Envoyer" onClick={handleSendMessage}><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <Dialog open={isNewDmModalOpen} onOpenChange={setNewDmModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Nouveau message privé</DialogTitle>
                <DialogDescription>Sélectionnez un utilisateur pour démarrer une conversation.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-96">
                <div className="py-4 space-y-2">
                    {initialUsersData.filter(u => u.id !== currentUser.id).map(user => (
                        <Button key={user.id} variant="ghost" className="w-full justify-start gap-3 h-auto py-2" onClick={() => handleStartNewDm(user)}>
                            <div className="relative">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={user.avatar} data-ai-hint="user avatar" />
                                    <AvatarFallback>{getInitials(user.name, user.username)}</AvatarFallback>
                                </Avatar>
                                {user.status === 'active' && (
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />
                                )}
                            </div>
                            <div className="text-left">
                               <p className="font-semibold">{user.name}</p>
                               <p className="text-xs text-muted-foreground">@{user.username}</p>
                            </div>
                        </Button>
                    ))}
                </div>
            </ScrollArea>
        </DialogContent>
    </Dialog>

    <Dialog open={!!editingMessage} onOpenChange={(isOpen) => !isOpen && setEditingMessage(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier le message</DialogTitle></DialogHeader>
          <form onSubmit={handleEditMessage}>
            <div className="py-4"><Label htmlFor="editedMessage" className="sr-only">Message</Label><Textarea id="editedMessage" name="editedMessage" defaultValue={editingMessage?.text} className="min-h-[100px]" autoFocus/></div>
            <DialogFooter><DialogClose asChild><Button type="button" variant="secondary">Annuler</Button></DialogClose><Button type="submit">Enregistrer</Button></DialogFooter>
          </form>
        </DialogContent>
    </Dialog>
    <Dialog open={!!previewingMedia} onOpenChange={() => setPreviewingMedia(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] h-full w-full p-0 flex flex-col bg-transparent border-0 shadow-none">
            <DialogHeader><DialogTitle className="sr-only">Aperçu du média</DialogTitle></DialogHeader>
            <div className="p-4 flex-1 min-h-0 flex items-center justify-center">
                {previewingMedia?.type === 'image' && <Image src={previewingMedia.url} alt="Aperçu de l'image" layout="fill" className="object-contain" data-ai-hint="media preview" />}
                {previewingMedia?.type === 'video' && <video src={previewingMedia.url} controls autoPlay className="max-w-full max-h-full" />}
            </div>
            <DialogClose asChild><Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 z-20 text-white bg-black/20 hover:bg-black/40 hover:text-white"><X className="h-5 w-5" /><span className="sr-only">Fermer</span></Button></DialogClose>
        </DialogContent>
    </Dialog>
    <Dialog open={isChannelModalOpen} onOpenChange={setChannelModalOpen}>
        <DialogContent>
            <form onSubmit={handleSaveChannel}>
                <DialogHeader>
                    <DialogTitle>{channelToEdit ? 'Modifier le canal' : 'Créer un nouveau canal'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nom du canal</Label>
                        <Input id="name" name="name" defaultValue={channelToEdit?.name || ''} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" defaultValue={channelToEdit?.description || ''} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="adminOnly" name="adminOnly" defaultChecked={channelToEdit?.adminOnly || false} />
                        <Label htmlFor="adminOnly">Canal réservé aux administrateurs</Label>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Annuler</Button></DialogClose>
                    <Button type="submit">{channelToEdit ? 'Enregistrer' : 'Créer'}</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
    </>
  );
}
