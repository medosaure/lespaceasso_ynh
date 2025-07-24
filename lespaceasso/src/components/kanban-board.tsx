
"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";

import { initialUsersData } from "@/lib/placeholder-data";
import type { UserProfile } from "../app/dashboard/layout";
import { KanbanColumn, KanbanTaskCard } from "./kanban-components";
import type { KanbanTask, KanbanColumn as ColumnType, TaskStatus } from "@/lib/placeholder-data";
import { useToast } from "@/hooks/use-toast";

interface KanbanBoardProps {
  userProfile: UserProfile;
  tasks: KanbanTask[];
  setTasks: React.Dispatch<React.SetStateAction<KanbanTask[]>>;
  columns: ColumnType[];
  setColumns: React.Dispatch<React.SetStateAction<ColumnType[]>>;
  onEditTask: (taskId: string) => void;
}

export default function KanbanBoard({ userProfile, tasks, setTasks, columns, setColumns, onEditTask }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const { toast } = useToast();

  const allUsers = { ...initialUsersData, [userProfile.id]: { name: userProfile.name, avatar: userProfile.avatarUrl } };
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    if (active.id === over.id) return;
    
    setTasks((tasks) => {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over.id);
      return arrayMove(tasks, oldIndex, newIndex);
    });
  };
  
  const handleDragOver = (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;
      if (active.id === over.id) return;

      const isActiveATask = active.data.current?.type === "Task";
      const isOverAColumn = over.data.current?.type === "Column";

      if (isActiveATask && isOverAColumn) {
          setTasks(prevTasks => {
              const activeIndex = prevTasks.findIndex(t => t.id === active.id);
              if (prevTasks[activeIndex].columnId !== over.id) {
                prevTasks[activeIndex].columnId = over.id as string;
                return arrayMove(prevTasks, activeIndex, activeIndex);
              }
              return prevTasks;
          });
      }
  }

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
    ));
    toast({
        title: "Statut de la tâche mis à jour !",
        description: `La tâche est maintenant marquée comme "${newStatus}".`,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    toast({ title: "Tâche supprimée", variant: 'destructive'});
  }

  return (
    <DndContext 
        sensors={sensors} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
    >
        <div className="flex gap-6 h-full overflow-x-auto p-1">
        {columns.map((column) => (
            <KanbanColumn 
                key={column.id} 
                column={column}
                tasks={tasks.filter(t => t.columnId === column.id)}
                allUsers={allUsers}
                onStatusChange={handleStatusChange}
                onEditTask={onEditTask}
                onDeleteTask={handleDeleteTask}
            />
        ))}
        </div>
        {typeof document !== 'undefined' && createPortal(
            <DragOverlay>
            {activeTask ? (
                <KanbanTaskCard task={activeTask} allUsers={allUsers} isOverlay />
            ) : null}
            </DragOverlay>,
            document.body
        )}
    </DndContext>
  );
}
