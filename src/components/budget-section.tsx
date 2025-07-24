
"use client";

import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, ArrowUpCircle, ArrowDownCircle, MoreVertical, Eye, Download, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Transaction, TransactionCategory, TransactionType, User, UserRole } from '@/lib/placeholder-data';
import type { UserProfile } from '@/app/dashboard/layout';

interface BudgetSectionProps {
    userProfile: UserProfile;
    usersMap: Record<string, User>;
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const CATEGORIES: TransactionCategory[] = ['Soirées', 'Matériel', 'Subventions', 'Cotisations', 'Dons', 'Administration', 'Autre'];

const CATEGORY_COLORS: Record<TransactionCategory, string> = {
    'Soirées': 'hsl(var(--chart-1))',
    'Matériel': 'hsl(var(--chart-2))',
    'Subventions': 'hsl(var(--chart-3))',
    'Cotisations': 'hsl(var(--chart-4))',
    'Dons': 'hsl(var(--chart-5))',
    'Administration': 'hsl(var(--primary))',
    'Autre': 'hsl(var(--muted-foreground))',
};

const EMPTY_TRANSACTION: Omit<Transaction, 'id' | 'submittedBy'> = {
    type: 'Dépense',
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    category: 'Autre',
    receiptUrl: null,
};


export default function BudgetSection({ userProfile, usersMap, transactions, setTransactions }: BudgetSectionProps) {
    const { toast } = useToast();
    const [isModalOpen, setModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { totalRevenu, totalDepense, solde } = useMemo(() => {
        const totalRevenu = transactions.filter(t => t.type === 'Revenu').reduce((acc, t) => acc + t.amount, 0);
        const totalDepense = transactions.filter(t => t.type === 'Dépense').reduce((acc, t) => acc + t.amount, 0);
        const solde = totalRevenu - totalDepense;
        return { totalRevenu, totalDepense, solde };
    }, [transactions]);
    
    const expenseByCategory = useMemo(() => {
        const data = transactions
            .filter(t => t.type === 'Dépense')
            .reduce((acc, t) => {
                if (!acc[t.category]) {
                    acc[t.category] = { name: t.category, value: 0, fill: CATEGORY_COLORS[t.category] };
                }
                acc[t.category].value += t.amount;
                return acc;
            }, {} as Record<TransactionCategory, { name: string; value: number; fill: string }>);
        return Object.values(data);
    }, [transactions]);
    
    const chartConfig = Object.fromEntries(
      Object.entries(CATEGORY_COLORS).map(([key, value]) => [key, { label: key, color: value }])
    );

    const handleOpenModal = (transaction: Transaction | null) => {
        setTransactionToEdit(transaction);
        setModalOpen(true);
    };

    const handleSaveTransaction = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const newTransactionData = {
            type: formData.get('type') as TransactionType,
            date: formData.get('date') as string,
            description: formData.get('description') as string,
            amount: parseFloat(formData.get('amount') as string),
            category: formData.get('category') as TransactionCategory,
            submittedBy: userProfile.id,
        };

        if (transactionToEdit) {
            setTransactions(prev => prev.map(t => t.id === transactionToEdit.id ? { ...t, ...newTransactionData } : t));
            toast({ title: 'Transaction modifiée avec succès.' });
        } else {
            const newTransaction: Transaction = {
                ...newTransactionData,
                id: `trans-${Date.now()}`,
            };
            setTransactions(prev => [newTransaction, ...prev]);
            toast({ title: 'Transaction ajoutée avec succès.' });
        }
        setModalOpen(false);
    };
    
    const handleDelete = (id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
        toast({ title: "Transaction supprimée", variant: 'destructive'});
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
                        <ArrowUpCircle className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRevenu.toFixed(2)} €</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Dépenses Totales</CardTitle>
                        <ArrowDownCircle className="h-5 w-5 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalDepense.toFixed(2)} €</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Solde Actuel</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-2xl font-bold", solde >= 0 ? 'text-green-500' : 'text-red-500')}>{solde.toFixed(2)} €</div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-5">
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>Transactions Récentes</CardTitle>
                        <div className="flex items-center gap-2 pt-2">
                            <Button size="sm" onClick={() => handleOpenModal(null)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Ajouter une transaction
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Catégorie</TableHead>
                                    <TableHead className="text-right">Montant</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.slice(0, 5).map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell>
                                            <div className="font-medium">{t.description}</div>
                                            <div className="text-sm text-muted-foreground">{new Date(t.date).toLocaleDateString('fr-FR')}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge style={{ backgroundColor: `${CATEGORY_COLORS[t.category]}33`, color: CATEGORY_COLORS[t.category], borderColor: `${CATEGORY_COLORS[t.category]}66`}} variant="outline">{t.category}</Badge>
                                        </TableCell>
                                        <TableCell className={cn("text-right font-mono", t.type === 'Revenu' ? 'text-green-500' : 'text-red-500')}>
                                            {t.type === 'Revenu' ? '+' : '-'} {t.amount.toFixed(2)} €
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => handleOpenModal(t)}><Edit className="mr-2 h-4 w-4" />Modifier</DropdownMenuItem>
                                                    {t.receiptUrl && <DropdownMenuItem onSelect={() => setPreviewUrl(t.receiptUrl!)}><Eye className="mr-2 h-4 w-4" />Voir le justificatif</DropdownMenuItem>}
                                                    <DropdownMenuItem onSelect={() => handleDelete(t.id)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Supprimer</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Répartition des Dépenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
                            <PieChart>
                                <RechartsTooltip content={<ChartTooltipContent nameKey="value" hideLabel />} />
                                <Pie data={expenseByCategory} dataKey="value" nameKey="name" innerRadius={60}>
                                    {expenseByCategory.map((entry) => (
                                        <Cell key={entry.name} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isModalOpen} onOpenChange={(isOpen) => { if (!isOpen) setTransactionToEdit(null); setModalOpen(isOpen);}}>
                <DialogContent>
                    <form onSubmit={handleSaveTransaction}>
                        <DialogHeader>
                            <DialogTitle>{transactionToEdit ? 'Modifier' : 'Ajouter'} une transaction</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <RadioGroup name="type" defaultValue={transactionToEdit?.type || 'Dépense'} className="grid grid-cols-2 gap-4">
                                <div><RadioGroupItem value="Dépense" id="type-depense" className="peer sr-only" /><Label htmlFor="type-depense" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-red-500 [&:has([data-state=checked])]:border-red-500">Dépense</Label></div>
                                <div><RadioGroupItem value="Revenu" id="type-revenu" className="peer sr-only" /><Label htmlFor="type-revenu" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 [&:has([data-state=checked])]:border-green-500">Revenu</Label></div>
                            </RadioGroup>
                             <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" name="description" defaultValue={transactionToEdit?.description || ''} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Montant (€)</Label>
                                    <Input id="amount" name="amount" type="number" step="0.01" defaultValue={transactionToEdit?.amount || ''} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input id="date" name="date" type="date" defaultValue={transactionToEdit?.date || new Date().toISOString().split('T')[0]} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Catégorie</Label>
                                <Select name="category" defaultValue={transactionToEdit?.category || 'Autre'}>
                                    <SelectTrigger id="category"><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="receipt">Justificatif (optionnel)</Label>
                                <Input id="receipt" type="file" />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="ghost">Annuler</Button></DialogClose>
                            <Button type="submit">{transactionToEdit ? 'Enregistrer' : 'Ajouter'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            
            <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
                <DialogContent className="max-w-xl">
                    <DialogHeader><DialogTitle>Aperçu du justificatif</DialogTitle></DialogHeader>
                    <div className="py-4">{previewUrl && <img src={previewUrl} alt="Justificatif" className="w-full h-auto rounded-md" data-ai-hint="receipt expense" />}</div>
                </DialogContent>
            </Dialog>

        </div>
    );
}

    
