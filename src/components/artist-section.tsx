
"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, FileText, Image as ImageIcon, X, Send, Edit, Eye } from "lucide-react";
import Image from 'next/image';
import type { FileItem } from '@/lib/placeholder-data';

type FormState = {
    artistName: string;
    email: string;
    phone: string;
    socials: string;
    presentation: string;
    photos: File[];
    techRider: File | null;
    hospitalityRider: File | null;
    pressKit: File | null;
    specialRequests: string;
};

const INITIAL_FORM_STATE: FormState = {
    artistName: '',
    email: '',
    phone: '',
    socials: '',
    presentation: '',
    photos: [],
    techRider: null,
    hospitalityRider: null,
    pressKit: null,
    specialRequests: '',
};

interface ArtistSectionProps {
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  userProfileId: string;
}

const FilePreview = ({ file, onRemove }: { file: File, onRemove: () => void }) => {
  return (
    <div className="relative group flex items-center gap-3 p-2 border rounded-md bg-secondary/50">
      {file.type.startsWith('image/') ? (
        <Image src={URL.createObjectURL(file)} alt={file.name} width={40} height={40} className="rounded-md object-cover w-10 h-10" data-ai-hint="artist image" />
      ) : (
        <div className="flex items-center justify-center w-10 h-10 bg-secondary rounded-md">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 truncate">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
      </div>
      <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-50 group-hover:opacity-100" onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

const FileInput = ({
  id,
  label,
  accept,
  icon: Icon,
  onFileSelect,
  multiple = false,
  disabled = false,
}: {
  id: string;
  label: string;
  accept: string;
  icon: React.ElementType;
  onFileSelect: (files: FileList | null) => void;
  multiple?: boolean;
  disabled?: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files);
    // Reset input value to allow re-uploading the same file
    if(e.target) e.target.value = '';
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <input
        type="file"
        id={id}
        ref={inputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
        multiple={multiple}
        disabled={disabled}
      />
      <Button type="button" variant="outline" className="w-full" onClick={() => inputRef.current?.click()} disabled={disabled}>
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </div>
  );
};


const FormView = ({ formData, setFormData, setView }: { formData: FormState, setFormData: React.Dispatch<React.SetStateAction<FormState>>, setView: (view: 'form' | 'preview') => void }) => {
    const { toast } = useToast();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (name: keyof FormState, file: File | null) => {
        setFormData(prev => ({ ...prev, [name]: file }));
    };

    const handlePhotosSelect = (fileList: FileList | null) => {
        if (fileList) {
          const newPhotos = Array.from(fileList);
          if (formData.photos.length + newPhotos.length > 3) {
            toast({
              variant: "destructive",
              title: "Limite atteinte",
              description: "Vous ne pouvez téléverser que 3 photos au maximum.",
            });
            return;
          }
          setFormData(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
        }
    };

    const removePhoto = (index: number) => {
        setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
    };

    const validateAndPreview = (e: React.FormEvent) => {
        e.preventDefault();
        
        const requiredFields: (keyof FormState)[] = ['artistName', 'email', 'phone', 'presentation'];
        const missingFields = requiredFields.filter(field => !formData[field as keyof Omit<FormState, 'photos'>]);

        if (missingFields.length > 0) {
             toast({
                variant: "destructive",
                title: "Champs manquants",
                description: `Veuillez remplir les champs obligatoires : ${missingFields.join(', ')}`,
            });
            return;
        }

        if (formData.photos.length === 0) {
             toast({
                variant: "destructive",
                title: "Photo manquante",
                description: "Veuillez ajouter au moins une photo ou un logo.",
            });
            return;
        }
        
        setView('preview');
    };

    return (
        <form onSubmit={validateAndPreview} className="space-y-8">
            <section className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Informations Générales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="artistName">Nom de l'artiste / du projet <span className="text-destructive">*</span></Label>
                        <Input id="artistName" name="artistName" value={formData.artistName} onChange={handleInputChange} placeholder="Ex: Les Colibris" required />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="presentation">Présentation de l'artiste / du projet <span className="text-destructive">*</span></Label>
                    <Textarea id="presentation" name="presentation" value={formData.presentation} onChange={handleInputChange} placeholder="Décrivez votre projet, votre style, votre histoire..." rows={5} required />
                </div>
            </section>

             <section className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Coordonnées</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="email">Email de contact <span className="text-destructive">*</span></Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="contact@exemple.com" required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone <span className="text-destructive">*</span></Label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="06 12 34 56 78" required />
                </div>
              </div>
               <div className="space-y-2">
                    <Label htmlFor="socials">Réseaux Sociaux</Label>
                    <Input id="socials" name="socials" value={formData.socials} onChange={handleInputChange} placeholder="Lien Instagram, Facebook, etc." />
                </div>
            </section>

            <section className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Photo ou Logo <span className="text-destructive">*</span> (1 obligatoire, 3 max.)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.photos.map((file, index) => (
                        <FilePreview key={index} file={file} onRemove={() => removePhoto(index)} />
                    ))}
                </div>
                <FileInput
                    id="photos"
                    label="Ajouter des photos"
                    accept="image/*"
                    icon={ImageIcon}
                    onFileSelect={handlePhotosSelect}
                    multiple
                    disabled={formData.photos.length >= 3}
                />
            </section>

            <section className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Documents Techniques (PDF uniquement)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <FileInput id="techRider" label="Fiche Technique" accept=".pdf" icon={FileText} onFileSelect={(files) => files && handleFileChange('techRider', files[0])} />
                        {formData.techRider && <FilePreview file={formData.techRider} onRemove={() => handleFileChange('techRider', null)} />}
                    </div>
                    <div className="space-y-2">
                        <FileInput id="hospitalityRider" label="Rider" accept=".pdf" icon={FileText} onFileSelect={(files) => files && handleFileChange('hospitalityRider', files[0])} />
                        {formData.hospitalityRider && <FilePreview file={formData.hospitalityRider} onRemove={() => handleFileChange('hospitalityRider', null)} />}
                    </div>
                    <div className="space-y-2">
                        <FileInput id="pressKit" label="Dossier de Presse" accept=".pdf" icon={FileText} onFileSelect={(files) => files && handleFileChange('pressKit', files[0])} />
                        {formData.pressKit && <FilePreview file={formData.pressKit} onRemove={() => handleFileChange('pressKit', null)} />}
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Demandes Particulières</h3>
                <div className="space-y-2">
                    <Label htmlFor="specialRequests">Avez-vous des besoins spécifiques ?</Label>
                    <Textarea id="specialRequests" name="specialRequests" value={formData.specialRequests} onChange={handleInputChange} placeholder="Allergies, matériel spécifique à prévoir, etc." rows={4} />
                </div>
            </section>
            
            <div className="text-sm text-muted-foreground">
                <span className="text-destructive">*</span> Champs obligatoires
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" size="lg">
                    <Eye className="mr-2 h-4 w-4" />
                    Prévisualiser le dossier
                </Button>
            </div>
        </form>
    );
};

const PreviewView = ({ formData, setView, handleFinalSubmit }: { formData: FormState, setView: (view: 'form' | 'preview') => void, handleFinalSubmit: () => Promise<void> }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async () => {
        setIsSubmitting(true);
        await handleFinalSubmit();
        setIsSubmitting(false);
    }

    const PreviewItem = ({ label, value }: { label: string, value: React.ReactNode }) => {
        if (!value) return null;
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                <dt className="font-semibold text-muted-foreground">{label}</dt>
                <dd className="sm:col-span-2 text-foreground">{value}</dd>
            </div>
        )
    };

    const renderFile = (file: File | null) => {
        if (!file) return <span className="text-muted-foreground">Non fourni</span>;
        return <p>{file.name} ({(file.size / 1024).toFixed(2)} KB)</p>;
    }

    return (
        <div className="space-y-8">
            <h3 className="text-2xl font-semibold border-b pb-2">Récapitulatif de votre dossier</h3>

            <dl className="space-y-4">
                <PreviewItem label="Nom de l'artiste/projet" value={formData.artistName} />
                <PreviewItem label="Email" value={formData.email} />
                <PreviewItem label="Téléphone" value={formData.phone} />
                <PreviewItem label="Réseaux Sociaux" value={formData.socials && <a href={formData.socials} target="_blank" rel="noreferrer" className="text-primary underline">{formData.socials}</a>} />
                <PreviewItem label="Présentation" value={<p className="whitespace-pre-wrap">{formData.presentation}</p>} />

                <div>
                  <dt className="font-semibold text-muted-foreground mb-2">Photos</dt>
                  <dd>
                     {formData.photos.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                             {formData.photos.map((photo, index) => (
                                <Image key={index} src={URL.createObjectURL(photo)} alt={`Photo ${index + 1}`} width={200} height={200} className="rounded-md object-cover aspect-square" data-ai-hint="artist image" />
                            ))}
                        </div>
                     ) : <p className="text-muted-foreground">Aucune photo fournie</p>}
                  </dd>
                </div>

                 <PreviewItem label="Fiche Technique" value={renderFile(formData.techRider)} />
                 <PreviewItem label="Rider" value={renderFile(formData.hospitalityRider)} />
                 <PreviewItem label="Dossier de Presse" value={renderFile(formData.pressKit)} />

                 <PreviewItem label="Demandes particulières" value={<p className="whitespace-pre-wrap">{formData.specialRequests}</p>} />
            </dl>

             <div className="flex justify-between items-center pt-4">
                <Button variant="outline" size="lg" onClick={() => setView('form')} disabled={isSubmitting}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                </Button>
                <Button size="lg" onClick={onSubmit} disabled={isSubmitting}>
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Envoi en cours..." : "Soumettre mon dossier"}
                </Button>
            </div>
        </div>
    )
};


export default function ArtistSection({ files, setFiles, userProfileId }: ArtistSectionProps) {
    const [view, setView] = useState<'form' | 'preview'>('form');
    const [formData, setFormData] = useState<FormState>(INITIAL_FORM_STATE);
    const { toast } = useToast();

    const handleFinalSubmit = async () => {
        const { artistName, photos, techRider, hospitalityRider, pressKit, ...textData } = formData;
        
        const artistFolderName = artistName.trim();
        // Check if a folder for this artist already exists to avoid duplicates
        const artistFolderExists = files.some(f => f.type === 'folder' && f.name === artistFolderName);

        const newFiles: FileItem[] = [];
        if (!artistFolderExists) {
            const artistFolder: FileItem = {
                id: `folder-artist-${Date.now()}`,
                name: artistFolderName,
                type: 'folder',
                modifiedBy: userProfileId,
                createdAt: new Date(),
                status: 'active',
            };
            newFiles.push(artistFolder);
        }
        
        const submittedFileNames: string[] = [];

        // Create summary file
        const summaryContent = `
Nom: ${artistName}
Email: ${textData.email}
Téléphone: ${textData.phone}
Réseaux: ${textData.socials || 'Non fourni'}

Présentation:
${textData.presentation}

Demandes particulières:
${textData.specialRequests || 'Aucune'}
        `.trim();
        
        const summaryFile = new Blob([summaryContent], { type: 'text/plain' });
        const summaryFileItem: FileItem = {
            id: `file-summary-${Date.now()}`,
            name: 'résumé.txt',
            type: 'file',
            folder: artistFolderName,
            modifiedBy: userProfileId,
            url: URL.createObjectURL(summaryFile),
            createdAt: new Date(),
            status: 'active',
        };
        newFiles.push(summaryFileItem);
        submittedFileNames.push(summaryFileItem.name);


        // Process uploaded files
        const allFilesToUpload = [...photos, techRider, hospitalityRider, pressKit].filter(Boolean) as File[];
        allFilesToUpload.forEach(file => {
            const fileItem: FileItem = {
                id: `file-${file.name}-${Date.now()}`,
                name: file.name,
                type: 'file',
                folder: artistFolderName,
                modifiedBy: userProfileId,
                url: URL.createObjectURL(file), // Important for preview
                createdAt: new Date(),
                status: 'active',
            };
            newFiles.push(fileItem);
            submittedFileNames.push(file.name);
        });

        // Update global files state
        setFiles(prevFiles => [...prevFiles, ...newFiles]);

        // SIMULATE sending email notification
        console.log("==================== SIMULATION D'ENVOI D'EMAIL (SOUMISSION ARTISTE) ====================");
        console.log(`Notification envoyée à l'admin pour l'artiste : ${artistName}`);
        console.log("Fichiers soumis:", submittedFileNames.join(', '));
        console.log("========================================================================================");

        toast({
            title: "Dossier Soumis !",
            description: "Merci, nous avons bien reçu vos informations. Nous vous recontacterons bientôt."
        });


        // Reset form state and view
        setFormData(INITIAL_FORM_STATE);
        setView('form');
    };

    return (
        <div className="p-4 md:p-6">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Informations Artistes</CardTitle>
                    <CardDescription>
                        {view === 'form'
                            ? "Veuillez remplir ce formulaire avec toutes les informations nécessaires pour votre venue."
                            : "Veuillez vérifier les informations de votre dossier avant de le soumettre."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {view === 'form' ? (
                        <FormView formData={formData} setFormData={setFormData} setView={setView} />
                    ) : (
                        <PreviewView formData={formData} setView={setView} handleFinalSubmit={handleFinalSubmit} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
