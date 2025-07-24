
"use client"

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function GeneralSettings() {
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast({ title: "Paramètres enregistrés", description: "Vos préférences ont été mises à jour." });
    }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
        <div className="space-y-2">
            <Label htmlFor="language">Langue</Label>
            <Select defaultValue="fr">
                <SelectTrigger id="language">
                    <SelectValue placeholder="Sélectionner une langue" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <Separator/>
         <div className="space-y-4">
             <Label>Notifications</Label>
             <div className="flex items-center justify-between">
                <Label htmlFor="notif-messages" className="font-normal text-muted-foreground">Nouveaux messages dans le chat</Label>
                <Switch id="notif-messages" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="notif-events" className="font-normal text-muted-foreground">Rappels d'événements</Label>
                <Switch id="notif-events" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="notif-polls" className="font-normal text-muted-foreground">Mises à jour des sondages</Label>
                <Switch id="notif-polls" />
            </div>
         </div>
      <div className="flex justify-end pt-4">
        <Button type="submit">Enregistrer les modifications</Button>
      </div>
    </form>
  );
}
