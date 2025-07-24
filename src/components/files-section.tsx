
"use client";

import * as React from 'react';
import { useState, useRef, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import {
  File as FileIcon,
  Folder as FolderIcon,
  FileText,
  FileImage,
  MoreVertical,
  PlusCircle,
  Search,
  Share2,
  Download,
  Trash2,
  Edit,
  FileCode,
  FolderPlus,
  FilePlus,
  X,
  LayoutGrid,
  List,
  UploadCloud,
  FileArchive,
  Palette,
  FileAudio,
  FileVideo,
  FileQuestion,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { FileItem, User as UserData } from "@/lib/placeholder-data";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from './ui/label';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import type { UserProfile, Notification } from "../app/dashboard/layout";
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { createPortal } from 'react-dom';

const getInitials = (name: string, username: string) => {
    if (name) {
        return name.split(' ').map(n => n[0]).join('');
    }
    return username ? username.charAt(0).toUpperCase() : '';
}

const FOLDER_COLORS = ['#3B82F6', '#10B981', '#F97316', '#EC4899', '#8B5CF6'];

const FileTypeIcon = ({ item, className }: { item: FileItem; className?: string }) => {
    if (item.type === "folder") {
      const color = item.color || '#A1A1AA';
      return <FolderIcon className={cn("h-6 w-6", className)} style={{ color: color, fill: `${color}33` }} />;
    }

    const extension = item.name.split(".").pop()?.toLowerCase();
    switch (extension) {
        case "pdf": return <FileText className={cn("h-6 w-6 text-red-500", className)} />;
        case "jpg": case "png": case "jpeg": case "gif": return <FileImage className={cn("h-6 w-6 text-blue-500", className)} />;
        case "mp3": case "wav": return <FileAudio className={cn("h-6 w-6 text-orange-400", className)} />;
        case "mp4": case "mov": return <FileVideo className={cn("h-6 w-6 text-purple-500", className)} />;
        case "xlsx": case "csv": return <FileIcon className={cn("h-6 w-6 text-green-600", className)} />;
        case "ai": case "svg": return <FileCode className={cn("h-6 w-6 text-orange-500", className)} />;
        case "zip": case "rar": return <FileArchive className={cn("h-6 w-6 text-yellow-500", className)} />;
        default: return <FileQuestion className={cn("h-6 w-6 text-gray-400", className)} />;
    }
};

const formatSize = (bytes?: number) => {
    if (bytes === undefined) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileItemCard = React.forwardRef<HTMLDivElement, {
  item: FileItem;
  itemCount: number;
  onClick: () => void;
  renderActionsDropdown: (item: FileItem) => React.ReactNode;
  isOverlay?: boolean;
}>(({ item, itemCount, onClick, renderActionsDropdown, isOverlay }, ref) => {
  const isImage = item.type === 'file' && item.url && /\.(jpg|jpeg|png|gif)$/i.test(item.name);
  
  return (
    <Card 
      ref={ref}
      className={cn(
        "overflow-hidden group transition-shadow relative cursor-pointer flex flex-col",
        isOverlay && "ring-2 ring-primary shadow-lg"
      )}
      onClick={!isOverlay ? onClick : undefined}
    >
      <div className="absolute top-1 right-1 z-10">
        {renderActionsDropdown(item)}
      </div>
      <CardHeader className="p-0 flex items-center justify-center bg-secondary aspect-square relative">
        {isImage ? (
          <Image src={item.url!} alt={item.name} layout="fill" className="object-cover" data-ai-hint="file image" />
        ) : (
          <FileTypeIcon item={item} className="h-12 w-12" />
        )}
      </CardHeader>
      <CardContent className="p-3 flex-1">
          <CardTitle className="text-sm font-medium truncate leading-tight">
            {item.name}
          </CardTitle>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between items-center text-xs text-muted-foreground">
        {item.type === 'folder' ? (
          <span>{itemCount} élément(s)</span>
        ) : (
          <span>{formatSize(item.size)}</span>
        )}
      </CardFooter>
    </Card>
  );
});
FileItemCard.displayName = "FileItemCard";


const DraggableFileItem = ({ item, children }: { item: FileItem, children: React.ReactNode }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: item.id,
        data: { item },
    });

    return (
        <div
            ref={setNodeRef}
            style={{ opacity: isDragging ? 0.5 : 1 }}
            {...listeners}
            {...attributes}
        >
            {children}
        </div>
    );
};

const DroppableFolder = ({ item, children }: { item: FileItem, children: React.ReactNode }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: item.id,
        data: { item, type: 'folder' },
    });

    return (
        <div ref={setNodeRef} className={cn("rounded-lg", isOver && "ring-2 ring-primary ring-offset-2 ring-offset-background")}>
            {children}
        </div>
    );
};

interface FilesSectionProps {
  userProfile: UserProfile;
  users: UserData[];
  setUsers: React.Dispatch<React.SetStateAction<UserData[]>>;
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  usersMap: Record<string, UserData>;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  initialSearchTerm?: string;
}

type SortKey = 'name_asc' | 'date_desc' | 'size_desc';

export default function FilesSection({ userProfile, users, setUsers, files, setFiles, usersMap, setNotifications, initialSearchTerm = '' }: FilesSectionProps) {
    const { toast } = useToast();
    const [isRenameModalOpen, setRenameModalOpen] = useState(false);
    const [isNewFolderModalOpen, setNewFolderModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
    const [itemToPreview, setItemToPreview] = useState<FileItem | null>(null);
    const [currentPath, setCurrentPath] = useState<string[]>(['Racine']);
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeId, setActiveId] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<SortKey>('name_asc');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
    
    useEffect(() => {
        setSearchTerm(initialSearchTerm);
    }, [initialSearchTerm])
    
    const activeItem = useMemo(() => files.find(f => f.id === activeId), [activeId, files]);

    const currentUserData = useMemo(() => {
        return users.find(u => u.id === userProfile.id);
    }, [users, userProfile.id]);

    const hasUploadPermission = useMemo(() => {
        if (!currentUserData) return false;
        if (currentUserData.uploadPermission === 'allowed') {
            if (currentUserData.uploadPermissionExpiresAt) {
                return new Date(currentUserData.uploadPermissionExpiresAt) > new Date();
            }
            return true; // Permanent access
        }
        return false;
    }, [currentUserData]);
    
    const hasDownloadPermission = useMemo(() => {
        if (!currentUserData) return false;
        if (currentUserData.downloadPermission === 'allowed') {
            if (currentUserData.downloadPermissionExpiresAt) {
                return new Date(currentUserData.downloadPermissionExpiresAt) > new Date();
            }
            return true;
        }
        return false;
    }, [currentUserData]);

    useEffect(() => {
        if (!currentUserData) return;
        if (currentUserData.uploadPermission === 'allowed' && currentUserData.uploadPermissionExpiresAt && new Date(currentUserData.uploadPermissionExpiresAt) <= new Date()) {
            setUsers(prev => prev.map(u => u.id === currentUserData.id ? {...u, uploadPermission: 'none', uploadPermissionExpiresAt: null} : u));
        }
         if (currentUserData.downloadPermission === 'allowed' && currentUserData.downloadPermissionExpiresAt && new Date(currentUserData.downloadPermissionExpiresAt) <= new Date()) {
            setUsers(prev => prev.map(u => u.id === currentUserData.id ? {...u, downloadPermission: 'none', downloadPermissionExpiresAt: null} : u));
        }
    }, [currentUserData, setUsers]);


    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const activeItem = files.find(f => f.id === active.id);
            const overItem = files.find(f => f.id === over.id);

            if (activeItem && overItem && overItem.type === 'folder' && overItem.status === 'active') {
                // Move item into folder
                setFiles(prevFiles => prevFiles.map(f => {
                    if (f.id === active.id) {
                        const newPath = currentPath.length > 1 ? [...currentPath.slice(1), overItem.name].join('/') : overItem.name;
                        return { ...f, folder: newPath, createdAt: new Date() };
                    }
                    return f;
                }));
                toast({ title: "Fichier déplacé", description: `"${activeItem.name}" a été déplacé dans "${overItem.name}".` });
            }
        }
    };

    const handleShare = (e: React.MouseEvent, fileName: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(`https://example.com/share/${fileName}`);
        toast({ title: "Lien copié !", description: `Le lien de partage pour ${fileName} a été copié dans le presse-papiers.` });
    };

    const handleDownload = (e: React.MouseEvent, item: FileItem) => {
        e.stopPropagation();
        if (item.type === 'folder') {
             if (userProfile.role === 'admin' || hasDownloadPermission) {
                // Simulate zip and download
                toast({ title: "Téléchargement simulé", description: `Le dossier "${item.name}" est en cours de compression...` });
             } else {
                 setUsers(prev => prev.map(u => u.id === userProfile.id ? {...u, downloadPermission: 'requested'} : u));
                 const newNotification: Notification = {
                     id: Date.now(),
                     type: 'download_request',
                     title: "Demande d'accès download",
                     description: `${userProfile.name} souhaite télécharger le dossier "${item.name}".`,
                     userId: userProfile.id,
                     itemId: item.id
                 };
                 setNotifications(prev => [newNotification, ...prev]);
                 toast({ title: "Demande de téléchargement envoyée", description: "Votre demande a été envoyée à un administrateur." });
                
                 // Simulate sending email to admin
                const adminEmails = "admin@example.com"; // In a real app, get this from settings
                console.log("===== SIMULATION D'EMAIL (Demande de téléchargement) =====");
                console.log(`À: ${adminEmails}`);
                console.log(`Sujet: Nouvelle demande d'accès au téléchargement`);
                console.log(`Corps: L'utilisateur ${userProfile.name} (${userProfile.username}) a demandé la permission de télécharger le dossier "${item.name}".`);
                console.log("Veuillez approuver ou refuser sa demande dans le panneau d'administration.");
                console.log("==========================================================");
             }
        } else {
            if (!item.url) {
                toast({ title: "Téléchargement impossible", description: "Ce fichier ne peut pas être téléchargé.", variant: "destructive" });
                return;
            }
            const a = document.createElement('a');
            a.href = item.url;
            a.download = item.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            toast({ title: "Téléchargement simulé", description: `${item.name} serait en cours de téléchargement.` });
        }
    };

    const handleRename = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newName = formData.get('newName') as string;
        if (selectedItem && newName) {
            setFiles(files.map(f => f.id === selectedItem.id ? { ...f, name: newName, createdAt: new Date() } : f));
            toast({ title: "Élément renommé", description: `L'élément a été renommé en ${newName}.` });
        }
        setRenameModalOpen(false);
        setSelectedItem(null);
    };

    const handleTrash = (e: React.MouseEvent, fileId: string) => {
        e.stopPropagation();
        setFiles(files.map(f => f.id === fileId ? {...f, status: 'trashed'} : f));
        toast({ title: "Élément déplacé dans la corbeille", variant: "default" });
    };
    
    const handleNewFolder = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const folderName = formData.get('folderName') as string;
      if (folderName) {
        const newFolder: FileItem = {
          id: `folder-${Date.now()}`,
          name: folderName,
          type: 'folder' as 'folder',
          folder: currentPath.length > 1 ? currentPath.slice(1).join('/') : undefined,
          modifiedBy: userProfile.id,
          createdAt: new Date(),
          status: 'active',
          color: FOLDER_COLORS[Math.floor(Math.random() * FOLDER_COLORS.length)],
          size: 0,
        };
        setFiles([newFolder, ...files]);
        toast({ title: "Dossier créé", description: `Le dossier "${folderName}" a été créé.` });
      }
      setNewFolderModalOpen(false);
    }
    
    const handleNewFileClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const newFileItem: FileItem = {
                id: `file-${Date.now()}`,
                name: file.name,
                type: 'file',
                folder: currentPath.length > 1 ? currentPath.slice(1).join('/') : undefined,
                modifiedBy: userProfile.id,
                url: URL.createObjectURL(file), // Store temporary URL
                createdAt: new Date(),
                status: 'active',
                size: file.size,
            };
            setFiles(prevFiles => [newFileItem, ...prevFiles]);
            toast({
                title: 'Fichier ajouté',
                description: `Le fichier "${file.name}" a été ajouté avec succès.`,
            });
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    
    const handleRequestUploadAccess = () => {
        if (!currentUserData) return;
        setUsers(prev => prev.map(u => u.id === currentUserData.id ? {...u, uploadPermission: 'requested'} : u));
        
        const newNotification: Notification = {
            id: Date.now(),
            type: 'upload_request',
            title: "Demande d'accès upload",
            description: `${currentUserData.name} a demandé la permission de téléverser des fichiers.`,
            userId: currentUserData.id,
        };
        setNotifications(prev => [newNotification, ...prev]);

        toast({
            title: "Demande envoyée",
            description: "Votre demande d'accès a été envoyée à un administrateur."
        });

        // Simulate sending email to admin
        const adminEmails = "admin@example.com"; // In a real app, get this from settings
        console.log("===== SIMULATION D'EMAIL (Demande d'upload) =====");
        console.log(`À: ${adminEmails}`);
        console.log(`Sujet: Nouvelle demande d'accès à l'upload`);
        console.log(`Corps: L'utilisateur ${currentUserData.name} (${currentUserData.username}) a demandé la permission de téléverser des fichiers.`);
        console.log("Veuillez approuver ou refuser sa demande dans le panneau d'administration.");
        console.log("==================================================");
    };
    
    const handleItemClick = (item: FileItem) => {
        if (item.type === 'file') {
            setItemToPreview(item);
        } else if (item.type === 'folder') {
            setCurrentPath([...currentPath, item.name]);
        }
    };
    
    const isChatFilesFolder = currentPath.length === 2 && currentPath[1] === "Fichiers du chat";

    const filteredAndSortedFiles = useMemo(() => {
        const filtered = files.filter(file => {
            const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
            const inCurrentPath = (currentPath.length === 1 && !file.folder) || (file.folder && currentPath.slice(1).join('/') === file.folder);

            if (isChatFilesFolder && file.folder === "Fichiers du chat" && file.createdAt) {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                if (file.createdAt < oneWeekAgo) {
                    return false;
                }
            }
            return file.status === 'active' && inCurrentPath && matchesSearch;
        });

        return filtered.sort((a, b) => {
            const aIsFolder = a.type === 'folder';
            const bIsFolder = b.type === 'folder';

            if (aIsFolder !== bIsFolder) {
                return aIsFolder ? -1 : 1;
            }

            switch(sortKey) {
                case 'date_desc':
                    return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
                case 'size_desc':
                    return (b.size ?? 0) - (a.size ?? 0);
                case 'name_asc':
                default:
                    return a.name.localeCompare(b.name);
            }
        });
    }, [files, searchTerm, currentPath, isChatFilesFolder, sortKey]);


    const getFolderItemCount = (folderItem: FileItem) => {
        const basePath = currentPath.length > 1 ? currentPath.slice(1).join('/') : '';
        const folderPath = basePath ? `${basePath}/${folderItem.name}` : folderItem.name;
        return files.filter(f => f.folder === folderPath && f.status === 'active').length;
    };
    
     const renderPreviewContent = () => {
        if (!itemToPreview) return null;

        const extension = itemToPreview.name.split('.').pop()?.toLowerCase();

        if (itemToPreview.url && ['png', 'jpg', 'jpeg', 'gif'].includes(extension || '')) {
            return (
                 <div className="relative w-full h-full">
                    <Image src={itemToPreview.url} alt={`Aperçu de ${itemToPreview.name}`} layout="fill" className="object-contain" data-ai-hint="document image" />
                </div>
            );
        }

        if (extension === 'pdf') {
            return (
                <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-muted-foreground">La prévisualisation PDF n'est pas disponible dans cette démo.</p>
                    </div>
                </div>
            );
        }
        
        return (
             <div className="flex flex-col items-center justify-center h-full text-center text-white">
                <FileTypeIcon item={itemToPreview} className="w-24 h-24" />
                <h3 className="mt-4 text-xl font-semibold">{itemToPreview.name}</h3>
                <p className="text-muted-foreground">Aucun aperçu disponible pour ce type de fichier.</p>
            </div>
        );
    };

    const handleSetFolderColor = (fileId: string, color: string) => {
        setFiles(prevFiles => prevFiles.map(f => f.id === fileId ? {...f, color} : f));
    }
    
    const renderActionsDropdown = (file: FileItem) => (
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={(e) => handleShare(e, file.name)}><Share2 className="mr-2 h-4 w-4" />Partager</DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleDownload(e, file)}>
                    {file.type === 'file' ? <Download className="mr-2 h-4 w-4" /> : <FileArchive className="mr-2 h-4 w-4" />}
                    {file.type === 'file' ? 'Télécharger' : 'Télécharger en .zip'}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setSelectedItem(file); setRenameModalOpen(true); }}><Edit className="mr-2 h-4 w-4" />Renommer</DropdownMenuItem>
                
                {file.type === 'folder' && (
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Palette className="mr-2 h-4 w-4" />
                            <span>Changer la couleur</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                        <DropdownMenuSubContent className="p-1">
                           <div className="flex gap-1">
                            {FOLDER_COLORS.map(color => (
                                <DropdownMenuItem key={color} className="p-0 m-0 w-8 h-8 flex items-center justify-center rounded-md" onSelect={() => handleSetFolderColor(file.id, color)}>
                                    <div className="w-6 h-6 rounded-md" style={{backgroundColor: color}} />
                                </DropdownMenuItem>
                            ))}
                           </div>
                        </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => handleTrash(e, file.id)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Mettre à la corbeille</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
    );
    
    const renderAddButton = () => {
        if (userProfile.role === 'admin' || hasUploadPermission) {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Ajouter
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <Dialog open={isNewFolderModalOpen} onOpenChange={setNewFolderModalOpen}>
                            <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <FolderPlus className="mr-2 h-4 w-4" />Nouveau dossier
                                </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent>
                                <form onSubmit={handleNewFolder}>
                                    <DialogHeader><DialogTitle>Créer un nouveau dossier</DialogTitle></DialogHeader>
                                    <div className="py-4">
                                        <Label htmlFor="folderName">Nom du dossier</Label>
                                        <Input id="folderName" name="folderName" required autoFocus/>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild><Button variant="secondary" type="button">Annuler</Button></DialogClose>
                                        <Button type="submit">Créer</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <DropdownMenuItem onClick={handleNewFileClick}>
                            <FilePlus className="mr-2 h-4 w-4" />Nouveau fichier
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }

        return (
            <Button onClick={handleRequestUploadAccess} disabled={currentUserData?.uploadPermission === 'requested'}>
                <UploadCloud className="mr-2 h-4 w-4" />
                {currentUserData?.uploadPermission === 'requested' ? 'Demande en cours...' : 'Demander l\'accès à l\'upload'}
            </Button>
        );
    }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
    <div className="p-4 md:p-6 space-y-6 flex flex-col h-[calc(100vh-8rem)]">
       <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <Breadcrumb>
            <BreadcrumbList>
              {currentPath.map((item, index) => (
                <React.Fragment key={item + index}>
                  <BreadcrumbItem>
                    {index === currentPath.length - 1 ? (
                      <BreadcrumbPage>{item}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPath(currentPath.slice(0, index + 1)); }}>
                        {item}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < currentPath.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[150px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Rechercher..." 
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Trier
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Trier par</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}>
                    <DropdownMenuRadioItem value="name_asc">Nom</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="date_desc">Date de modification</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="size_desc">Taille</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
           <div className="flex items-center rounded-md bg-secondary p-1">
            <Button
              variant={viewMode === 'grid' ? 'ghost' : 'ghost'}
              size="icon"
              className={cn("h-8 w-8", viewMode === 'grid' ? 'bg-background shadow-sm' : '')}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
               variant={viewMode === 'list' ? 'ghost' : 'ghost'}
              size="icon"
              className={cn("h-8 w-8", viewMode === 'list' ? 'bg-background shadow-sm' : '')}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          {renderAddButton()}
        </div>
      </header>
      
      <main className="flex-1 overflow-auto">
        {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredAndSortedFiles.map((file) => {
                    const itemCount = file.type === 'folder' ? getFolderItemCount(file) : 0;
                    
                    const card = (
                        <FileItemCard
                            item={file}
                            itemCount={itemCount}
                            onClick={() => handleItemClick(file)}
                            renderActionsDropdown={renderActionsDropdown}
                        />
                    );

                    if (file.type === 'folder' && file.status === 'active') {
                        return <DroppableFolder key={file.id} item={file}><DraggableFileItem item={file}>{card}</DraggableFileItem></DroppableFolder>;
                    }
                    return <DraggableFileItem key={file.id} item={file}>{card}</DraggableFileItem>;
                })}
            </div>
        ) : (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50%]">Nom</TableHead>
                        <TableHead>Taille / Contenu</TableHead>
                        <TableHead>Dernière modification</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredAndSortedFiles.map(file => {
                        const itemCount = file.type === 'folder' ? getFolderItemCount(file) : 0;
                        return (
                            <TableRow key={file.id} className="cursor-pointer" onClick={() => handleItemClick(file)}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <FileTypeIcon item={file} />
                                        <span>{file.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {file.type === 'folder' 
                                        ? `${itemCount} élément(s)`
                                        : formatSize(file.size)
                                    }
                                </TableCell>
                                <TableCell className="text-muted-foreground">{file.createdAt?.toLocaleDateString('fr-FR')}</TableCell>
                                <TableCell className="text-right">
                                    {renderActionsDropdown(file)}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        )}
      </main>

      {typeof document !== 'undefined' && createPortal(
        <DragOverlay>
          {activeItem ? (
            <FileItemCard
              item={activeItem}
              itemCount={activeItem.type === 'folder' ? getFolderItemCount(activeItem) : 0}
              onClick={() => {}}
              renderActionsDropdown={renderActionsDropdown}
              isOverlay
            />
          ) : null}
        </DragOverlay>,
        document.body
      )}
      
       <Dialog open={!!itemToPreview} onOpenChange={() => setItemToPreview(null)}>
        <DialogContent 
            className="max-w-4xl max-h-[80vh] h-full w-full p-0 flex flex-col bg-transparent border-0 shadow-none"
            onClick={() => setItemToPreview(null)}
        >
            <DialogHeader>
              <DialogTitle className="sr-only">Aperçu du fichier</DialogTitle>
              <DialogDescription className="sr-only">
                  Affiche l'aperçu du fichier sélectionné.
                  {itemToPreview?.name && ` Nom du fichier : ${itemToPreview.name}`}
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 flex-1 min-h-0 flex items-center justify-center">
              {renderPreviewContent()}
            </div>
             <DialogClose asChild>
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 z-20 text-white bg-black/20 hover:bg-black/40 hover:text-white">
                  <X className="h-5 w-5" />
                  <span className="sr-only">Fermer</span>
              </Button>
            </DialogClose>
        </DialogContent>
      </Dialog>
      <Dialog open={isRenameModalOpen} onOpenChange={(isOpen) => { if (!isOpen) setSelectedItem(null); setRenameModalOpen(isOpen); }}>
          <DialogContent>
              <form onSubmit={handleRename}>
                  <DialogHeader><DialogTitle>Renommer {selectedItem?.type === 'folder' ? 'le dossier' : 'le fichier'}</DialogTitle></DialogHeader>
                  <div className="py-4">
                      <Label htmlFor="newName">Nouveau nom</Label>
                      <Input id="newName" name="newName" defaultValue={selectedItem?.name} required autoFocus />
                  </div>
                  <DialogFooter>
                      <DialogClose asChild><Button variant="secondary" type="button" onClick={() => setSelectedItem(null)}>Annuler</Button></DialogClose>
                      <Button type="submit">Renommer</Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    </div>
    </DndContext>
  );
}
