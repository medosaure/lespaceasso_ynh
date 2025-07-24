# L'Espace Associatif - Projet Firebase Studio

Ceci est une application de gestion pour association créée dans Firebase Studio.

## Déploiement sur YunoHost avec "My Webapp" (Méthode Manuelle)

Ce guide vous explique comment déployer cette application Next.js sur votre serveur YunoHost en transférant manuellement les fichiers.

---

### Étape 1 : Préparer et envoyer les fichiers

1.  Sur votre ordinateur, localisez le dossier qui contient l'ensemble de votre projet (`lespaceasso`). C'est ce dossier que vous devez compresser. **Ne compressez pas les sous-dossiers individuellement.**

2.  **Vérifiez que ce dossier contient bien les fichiers et dossiers suivants à sa racine** (cette liste n'est pas exhaustive mais contient les éléments principaux) :
    -   Dossier `src`
    -   Dossier `public`
    -   Dossier `yunohost` (très important, il contient `manifest.json`)
    -   Fichier `package.json`
    -   Fichier `next.config.ts`
    -   Fichier `tailwind.config.ts`
    -   Fichier `README.md` (ce fichier)
    -   ... et tous les autres fichiers de configuration.

3.  Compressez le dossier `lespaceasso` dans une archive (par exemple : `lespaceasso.tar.gz`).
4.  Connectez-vous à votre serveur YunoHost en **SFTP** (avec un client comme FileZilla) ou en **FTP**.
5.  Uploadez votre archive `lespaceasso.tar.gz` dans un dossier temporaire sur votre serveur, par exemple `/tmp`.

### Étape 2 : Installer depuis le serveur

1.  Connectez-vous à votre serveur en **SSH**.
2.  Naviguez jusqu'au dossier où vous avez uploadé l'archive :
    ```bash
    cd /tmp
    ```
3.  Décompressez l'archive. Cela créera un nouveau dossier nommé `lespaceasso`.
    ```bash
    tar -xvf lespaceasso.tar.gz
    ```
4.  Lancez l'installation en pointant vers le dossier que vous venez de décompresser :
    ```bash
    # Le nom du dossier doit correspondre à l'ID dans le manifest.json
    sudo yunohost app install /tmp/lespaceasso
    ```
5.  Suivez les instructions de YunoHost pour choisir le domaine, le chemin, etc.

---

### Étape 3 : Créer le premier compte Administrateur (après installation)

La logique est simple : le tout premier compte à s'inscrire avec le rôle "Admin" sera **automatiquement approuvé** et deviendra l'administrateur principal.

1.  Rendez-vous sur l'URL de votre application (`https://votre.domaine.tld`).
2.  Cliquez sur l'onglet **"S'inscrire"**.
3.  Remplissez le formulaire :
    -   Choisissez un **pseudo** et un **mot de passe**.
    -   **Cochez la case "Admin"**. C'est l'étape la plus importante.
    -   Cliquez sur **"Demander l'inscription"**.

Votre compte sera créé et vous pourrez vous connecter immédiatement avec les identifiants choisis. Les inscriptions suivantes (même celles demandant le rôle admin) devront être approuvées manuellement par un administrateur depuis le panneau d'administration.
