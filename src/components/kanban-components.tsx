
"use client"

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { PlusCircle, MoreVertical, CheckCircle, Clock, XCircle, Circle, Edit, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";
import React from "react";
import type { TaskStatus } from "@/lib/placeholder-data";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuGroup } from "./ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { getInitials } from "../app/dashboard/layout";

type User = {
    name: string;
    username: string;
    avatar: string;
};

type Task = {
  id: string;
  columnId: string;
  content: string;
  assignedTo: string[];
  status: TaskStatus;
  priority: 'Basse' | 'Moyenne' | 'Haute';
};

type Column = {
  id: string;
  title: string;
};

const statusConfig = {
    todo: { label: 'À faire', icon: Circle, color: 'border-gray-500', iconClass: 'text-gray-500' },
    inprogress: { label: 'En cours', icon: Clock, color: 'border-blue-500', iconClass: 'text-blue-500' },
    done: { label: 'Terminé', icon: CheckCircle, color: 'border-green-500', iconClass: 'text-green-500' },
    wontdo: { label: 'Annulé', icon: XCircle, color: 'border-red-500', iconClass: 'text-red-500' },
};

const priorityConfig = {
    'Basse': { variant: 'outline' as const, label: 'Basse' },
    'Moyenne': { variant: 'secondary' as const, label: 'Moyenne' },
    'Haute': { variant: 'destructive' as const, label: 'Haute' },
};


export const KanbanTaskCard = React.forwardRef<HTMLDivElement, { task: Task; allUsers: Record<string, User>; isOverlay?: boolean; onStatusChange?: (taskId: string, status: TaskStatus) => void; onEdit?: (taskId: string) => void; onDelete?: (taskId: string) => void; }>(({ task, allUsers, isOverlay, onStatusChange, onEdit, onDelete }, ref) => {
    
    const { color } = statusConfig[task.status];
    const { variant, label } = priorityConfig[task.priority];
    const canModify = onStatusChange || onEdit;

    return (
        <Card ref={ref} className={cn("hover:shadow-lg transition-shadow border-l-4", color, isOverlay && "ring-2 ring-primary")}>
            <CardContent className="p-3">
                <div className="flex justify-between items-start">
                    <p className="text-sm font-medium pr-2">{task.content}</p>
                    {canModify && (
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                                <DropdownMenuGroup>
                                    {onEdit && (
                                        <DropdownMenuItem onClick={() => onEdit(task.id)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Modifier</span>
                                        </DropdownMenuItem>
                                    )}
                                    {onDelete && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Supprimer</span>
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                    <AlertDialogDescription>Cette action est irréversible et supprimera la tâche.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => onDelete(task.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </DropdownMenuGroup>
                                {onStatusChange && (
                                    <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        {Object.entries(statusConfig).map(([statusKey, { label, icon: Icon, iconClass }]) => (
                                            <DropdownMenuItem key={statusKey} onClick={() => onStatusChange(task.id, statusKey as TaskStatus)}>
                                                <Icon className={cn("mr-2 h-4 w-4", iconClass)} />
                                                <span>{label}</span>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuGroup>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
                <div className="flex items-center justify-between mt-3">
                    <div className="flex -space-x-2">
                        {task.assignedTo.map((userId) => {
                            const user = allUsers[userId];
                            if(!user) return null;
                            return (
                                <Avatar key={userId} className="h-8 w-8 border-2 border-card">
                                <AvatarImage src={user.avatar} data-ai-hint="user avatar" />
                                <AvatarFallback>
                                    {getInitials(user.name, user.username)}
                                </AvatarFallback>
                                </Avatar>
                            )
                        })}
                    </div>
                    <Badge variant={variant}>{label}</Badge>
                </div>
            </CardContent>
        </Card>
    );
});
KanbanTaskCard.displayName = "KanbanTaskCard";

export const SortableKanbanTaskCard = ({ task, allUsers, onStatusChange, onEditTask, onDeleteTask }: { task: Task; allUsers: Record<string, User>; onStatusChange: (taskId: string, status: TaskStatus) => void; onEditTask: (taskId: string) => void; onDeleteTask: (taskId: string) => void; }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        },
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    if (isDragging) {
        return <div ref={setNodeRef} style={style} className="p-3 rounded-lg bg-card/50 h-[100px] border-2 border-dashed" />;
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <KanbanTaskCard task={task} allUsers={allUsers} onStatusChange={onStatusChange} onEdit={onEditTask} onDelete={onDeleteTask} />
        </div>
    );
};


export const KanbanColumn = ({ column, tasks, allUsers, onStatusChange, onEditTask, onDeleteTask }: { column: Column, tasks: Task[], allUsers: Record<string, User>, onStatusChange: (taskId: string, status: TaskStatus) => void; onEditTask: (taskId: string) => void; onDeleteTask: (taskId: string) => void;}) => {
    const { setNodeRef } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        }
    });

    return (
        <div ref={setNodeRef} className="w-80 flex-shrink-0">
            <Card className="bg-transparent border-none shadow-none">
                <CardHeader className="p-2 mb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-base">{column.title}</h2>
                    <Badge variant="secondary" className="rounded-full">
                        {tasks.length}
                    </Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                    <PlusCircle className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>
                </CardHeader>
                <CardContent className="p-2 space-y-4 h-full">
                    <div className="space-y-4">
                        {tasks.map((task) => (
                            <SortableKanbanTaskCard key={task.id} task={task} allUsers={allUsers} onStatusChange={onStatusChange} onEditTask={onEditTask} onDeleteTask={onDeleteTask} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
