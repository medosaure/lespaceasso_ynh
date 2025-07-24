
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, PlusCircle, Edit, Trash2, MoreVertical, Play, Pause, SkipForward, RefreshCw, Timer as TimerIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { AgendaItem, User } from '@/lib/placeholder-data';
import type { UserProfile } from '@/app/dashboard/layout';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getInitials } from '@/app/dashboard/layout';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { createPortal } from 'react-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Progress } from './ui/progress';

const priorityConfig: Record<AgendaItem['priority'], { label: string; className: string }> = {
  Haute: { label: 'Haute', className: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30' },
  Moyenne: { label: 'Moyenne', className: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30' },
  Basse: { label: 'Basse', className: 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30' },
};

function SortableItem({ item, usersMap, onEdit, onDelete, isActive }: { item: AgendaItem; usersMap: Record<string, User>; onEdit: (item: AgendaItem) => void; onDelete: (itemId: string) => void, isActive: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const user = usersMap[item.addedBy];

  return (
    <div ref={setNodeRef} style={style} className={cn("flex items-center gap-4 bg-card p-3 rounded-lg border transition-all", isActive && "ring-2 ring-primary shadow-lg")}>
      <div {...attributes} {...listeners} className="cursor-grab p-2">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <p className="font-semibold">{item.title}</p>
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </div>
       <Badge variant="outline" className="w-20 justify-center">{item.duration} min</Badge>
      <Badge variant="outline" className={cn('w-24 justify-center', priorityConfig[item.priority].className)}>
        {priorityConfig[item.priority].label}
      </Badge>
      <div className="flex items-center gap-2">
        {user && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} data-ai-hint="user avatar" />
            <AvatarFallback>{getInitials(user.name, user.username)}</AvatarFallback>
          </Avatar>
        )}
      </div>
       <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => onEdit(item)}><Edit className="mr-2 h-4 w-4" />Modifier</DropdownMenuItem>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={e => e.preventDefault()}><Trash2 className="mr-2 h-4 w-4"/>Supprimer</DropdownMenuItem>
                    </AlertDialogTrigger>
                     <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                            <AlertDialogDescription>Cette action est irréversible et supprimera le sujet "{item.title}".</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(item.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Supprimer</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DropdownMenuContent>
       </DropdownMenu>
    </div>
  );
}

const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function MeetingPrepSection({ items, setItems, userProfile, usersMap }: { items: AgendaItem[], setItems: React.Dispatch<React.SetStateAction<AgendaItem[]>>, userProfile: UserProfile, usersMap: Record<string, User> }) {
  const { toast } = useToast();
  const [activeDndItem, setActiveDndItem] = useState<AgendaItem | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<AgendaItem | null>(null);
  
  // Timer state
  const [timerIsRunning, setTimerIsRunning] = useState(false);
  const [activeTopicIndex, setActiveTopicIndex] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const totalMeetingDuration = useMemo(() => items.reduce((acc, item) => acc + item.duration, 0), [items]);
  const currentTopic = activeTopicIndex !== null ? items[activeTopicIndex] : null;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerIsRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (timerIsRunning && secondsLeft === 0) {
        // Time's up for current topic
        toast({ title: "Temps écoulé !", description: `Le temps pour "${currentTopic?.title}" est terminé.` });
        if (activeTopicIndex !== null && activeTopicIndex < items.length - 1) {
             handleNextTopic();
        } else {
             setTimerIsRunning(false);
        }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerIsRunning, secondsLeft, activeTopicIndex]);

  const handleStartPause = () => {
    if (timerIsRunning) {
        setTimerIsRunning(false);
    } else {
        if (activeTopicIndex === null) {
            if (items.length > 0) {
                setActiveTopicIndex(0);
                setSecondsLeft(items[0].duration * 60);
                setTimerIsRunning(true);
            }
        } else {
            setTimerIsRunning(true);
        }
    }
  };

  const handleNextTopic = () => {
    setTimerIsRunning(false);
    if (activeTopicIndex !== null && activeTopicIndex < items.length - 1) {
        const nextIndex = activeTopicIndex + 1;
        setActiveTopicIndex(nextIndex);
        setSecondsLeft(items[nextIndex].duration * 60);
        setTimerIsRunning(true);
    } else {
        toast({ title: 'Réunion terminée !' });
        setActiveTopicIndex(null);
    }
  };

  const handleReset = () => {
      setTimerIsRunning(false);
      setActiveTopicIndex(null);
      setSecondsLeft(0);
  };


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  function handleDragStart(event: any) {
    const { active } = event;
    setActiveDndItem(items.find(item => item.id === active.id) || null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDndItem(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex(item => item.id === active.id);
        const newIndex = currentItems.findIndex(item => item.id === over.id);
        return arrayMove(currentItems, oldIndex, newIndex);
      });
    }
  }
  
  const handleOpenModal = (item: AgendaItem | null) => {
      setItemToEdit(item);
      setModalOpen(true);
  }

  const handleSaveItem = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const priority = formData.get('priority') as AgendaItem['priority'];
      const duration = parseInt(formData.get('duration') as string, 10) || 5;
      
      if (itemToEdit) {
          setItems(items.map(item => item.id === itemToEdit.id ? {...item, title, description, priority, duration} : item));
          toast({ title: 'Sujet modifié !' });
      } else {
          const newItem: AgendaItem = {
              id: `agenda-${Date.now()}`,
              title,
              description,
              priority,
              status: 'pending',
              addedBy: userProfile.id,
              duration,
          };
          setItems([...items, newItem]);
          toast({ title: 'Sujet ajouté !' });
      }
      setModalOpen(false);
      setItemToEdit(null);
  }
  
  const handleDeleteItem = (itemId: string) => {
      setItems(items.filter(item => item.id !== itemId));
      toast({ title: 'Sujet supprimé', variant: 'destructive' });
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
          <CardHeader>
             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Préparation de l'Ordre du Jour</CardTitle>
                  <CardDescription>
                    Ajoutez et priorisez les sujets. Durée totale estimée : {totalMeetingDuration} minutes.
                  </CardDescription>
                </div>
                <Button onClick={() => handleOpenModal(null)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ajouter un sujet
                </Button>
              </div>
          </CardHeader>
           <CardContent className="space-y-4">
            <Card className="bg-muted/50">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2"><TimerIcon className="h-5 w-5"/> Minuteur de Réunion</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <div className="md:col-span-1 space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Sujet en cours</h4>
                            <p className="text-lg font-semibold truncate">{currentTopic?.title || 'Aucun'}</p>
                        </div>
                        <div className="md:col-span-1 flex flex-col items-center space-y-2">
                             <h4 className="text-sm font-medium text-muted-foreground">Temps restant</h4>
                             <p className="text-5xl font-mono font-bold">{formatTime(secondsLeft)}</p>
                             <Progress value={currentTopic ? ((currentTopic.duration * 60 - secondsLeft) / (currentTopic.duration * 60)) * 100 : 0} className="w-full h-2" />
                        </div>
                        <div className="md:col-span-1 flex justify-center gap-2">
                            <Button variant="outline" size="icon" onClick={handleStartPause}>
                                {timerIsRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                            </Button>
                             <Button variant="outline" size="icon" onClick={handleNextTopic} disabled={activeTopicIndex === null || activeTopicIndex >= items.length - 1}>
                                <SkipForward className="h-5 w-5" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleReset}>
                                <RefreshCw className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <SortableItem key={item.id} item={item} usersMap={usersMap} onEdit={handleOpenModal} onDelete={handleDeleteItem} isActive={index === activeTopicIndex} />
                  ))}
                </div>
              </SortableContext>
              {typeof document !== 'undefined' && createPortal(
                  <DragOverlay>
                  {activeDndItem ? (
                       <div className="flex items-center gap-4 bg-card p-3 rounded-lg border shadow-lg">
                          <div className="p-2"><GripVertical className="h-5 w-5 text-muted-foreground" /></div>
                          <div className="flex-1">
                              <p className="font-semibold">{activeDndItem.title}</p>
                              <p className="text-sm text-muted-foreground">{activeDndItem.description}</p>
                          </div>
                           <Badge variant="outline" className="w-20 justify-center">{activeDndItem.duration} min</Badge>
                          <Badge variant="outline" className={cn('w-24 justify-center', priorityConfig[activeDndItem.priority].className)}>
                              {priorityConfig[activeDndItem.priority].label}
                          </Badge>
                          <div className="flex items-center gap-2">
                              {usersMap[activeDndItem.addedBy] && (
                                  <Avatar className="h-8 w-8"><AvatarImage src={usersMap[activeDndItem.addedBy].avatar} /><AvatarFallback>{getInitials(usersMap[activeDndItem.addedBy].name, usersMap[activeDndItem.addedBy].username)}</AvatarFallback></Avatar>
                              )}
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                      </div>
                  ) : null}
                  </DragOverlay>,
                  document.body
              )}
            </DndContext>
           </CardContent>
      </Card>
      
      <Dialog open={isModalOpen} onOpenChange={(isOpen) => { if (!isOpen) setItemToEdit(null); setModalOpen(isOpen);}}>
        <DialogContent>
          <form onSubmit={handleSaveItem}>
            <DialogHeader>
              <DialogTitle>{itemToEdit ? 'Modifier le sujet' : 'Ajouter un nouveau sujet'}</DialogTitle>
              <DialogDescription>Renseignez les détails du point à aborder.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du sujet</Label>
                <Input id="title" name="title" defaultValue={itemToEdit?.title || ''} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea id="description" name="description" defaultValue={itemToEdit?.description || ''} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="priority">Priorité</Label>
                    <Select name="priority" defaultValue={itemToEdit?.priority || 'Moyenne'}>
                        <SelectTrigger id="priority">
                            <SelectValue placeholder="Choisir une priorité" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Haute">Haute</SelectItem>
                            <SelectItem value="Moyenne">Moyenne</SelectItem>
                            <SelectItem value="Basse">Basse</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="duration">Durée (minutes)</Label>
                    <Input id="duration" name="duration" type="number" min="1" defaultValue={itemToEdit?.duration || 5} required />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Annuler</Button></DialogClose>
              <Button type="submit">{itemToEdit ? 'Enregistrer' : 'Ajouter'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
