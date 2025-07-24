# L'Espace Associatif - Projet Firebase Studio

Ceci est une application de gestion pour association créée dans Firebase Studio.

## Déploiement sur YunoHost avec "My Webapp"

Ce guide vous explique comment déployer cette application Next.js sur votre serveur YunoHost. Deux méthodes sont proposées : l'une, recommandée, utilisant Git pour faciliter les mises à jour, et l'autre, manuelle, par simple transfert de fichiers.

---

### Méthode 1 : Installation via Git (Recommandé)

Cette méthode est la plus simple pour l'installation et surtout pour les futures mises à jour. Elle est conçue pour fonctionner avec l'interface web d'administration de YunoHost.

#### Prérequis

1.  Un serveur YunoHost fonctionnel.
2.  **Avoir poussé le code de cette application sur un dépôt Git.**
    - **Important :** Pour que YunoHost reconnaisse votre application via Git, le nom de votre dépôt GitHub doit se terminer par `_ynh`. Par exemple : `lespaceasso_ynh`. L'ID dans le fichier `manifest.json` devra alors correspondre (`"id": "lespaceasso_ynh"`).

##### Comment mettre le projet sur GitHub ?

L'interface web de GitHub ne permet pas de téléverser des dossiers. Pour envoyer l'intégralité du projet (avec ses dossiers `src`, `public`, `yunohost`...), vous devez utiliser les commandes Git depuis votre ordinateur.

1.  **Installez Git** sur votre ordinateur si ce n'est pas déjà fait.
2.  **Créez un nouveau dépôt vide** sur GitHub.com.
3.  **Ouvrez un terminal** (ou une invite de commande) dans le dossier de votre projet (`lespaceasso`).
4.  **Exécutez les commandes suivantes** en remplaçant l'URL par celle de votre dépôt :

    ```bash
    # Initialise Git dans votre dossier
    git init

    # Ajoute tous les fichiers et dossiers pour le suivi
    git add .

    # Crée un "instantané" (commit) de votre projet
    git commit -m "Premier commit"

    # Lie votre dossier local au dépôt GitHub distant
    git remote add origin https://github.com/votre-utilisateur/votre-depot_ynh.git

    # Renomme la branche principale en "main" (pratique standard)
    git branch -M main

    # Envoie votre projet sur GitHub
    git push -u origin main
    ```

Une fois ces commandes exécutées, votre projet sera sur GitHub avec tous ses dossiers, prêt pour l'installation sur YunoHost.

#### Étape 1 : Installer depuis l'interface web de YunoHost

1.  Connectez-vous à l'interface d'administration de votre serveur YunoHost.
2.  Allez dans `Applications` > `Installer`.
3.  Tout en bas de la page, dans la section "Installer une application personnalisée", collez l'URL de votre dépôt Git dans le champ prévu à cet effet.
4.  Cliquez sur `Installer`.

YunoHost va alors vous poser quelques questions pour la configuration :
- **Domaine ou sous-domaine pour l'application** : `votre.domaine.tld`
- **Chemin pour l'application** : `/` (ou un autre chemin si vous préférez)
- **Cet utilisateur doit-il être un administrateur ?** : Choisissez un utilisateur YunoHost qui aura les droits sur le dossier de l'application. **Attention, cela ne crée pas de compte dans l'application elle-même.**

---

### Méthode 2 : Installation Manuelle (sans Git)

Cette méthode ne nécessite pas de dépôt Git mais rend les mises à jour plus complexes et requiert l'utilisation du SSH pour une seule commande.

#### Étape 1 : Préparer et envoyer les fichiers

1.  Sur votre ordinateur, localisez le dossier qui contient l'ensemble de votre projet (`lespaceasso`). C'est ce dossier que vous devez compresser. **Ne compressez pas les sous-dossiers individuellement.**

2.  **Vérifiez que ce dossier contient bien les fichiers et dossiers suivants à sa racine** (cette liste n'est pas exhaustive mais contient les éléments principaux) :
    -   Dossier `src`
    -   Dossier `public`
    -   Dossier `yunohost` (très important)
    -   Fichier `package.json`
    -   Fichier `next.config.ts`
    -   Fichier `tailwind.config.ts`
    -   Fichier `README.md` (ce fichier)
    -   ... et tous les autres fichiers de configuration.

3.  Compressez ce dossier dans une archive (ex: `lespaceasso.tar.gz`).
4.  Connectez-vous à votre serveur YunoHost en **SFTP** (avec un client comme FileZilla) ou en **FTP**.
5.  Uploadez votre archive `lespaceasso.tar.gz` dans un dossier temporaire sur votre serveur, par exemple `/tmp`.

#### Étape 2 : Installer depuis le serveur

1.  Connectez-vous à votre serveur en **SSH**.
2.  Naviguez jusqu'au dossier où vous avez uploadé l'archive :
    ```bash
    cd /tmp
    ```
3.  Décompressez l'archive. Cela créera un nouveau dossier.
    ```bash
    # Cette commande crée un dossier nommé 'lespaceasso'
    tar -xvf lespaceasso.tar.gz
    ```
4.  Lancez l'installation en pointant vers le dossier que vous venez de décompresser :
    ```bash
    # La commande pointe vers le dossier créé à l'étape 3
    sudo yunohost app install /tmp/lespaceasso
    ```
5.  Suivez les mêmes instructions de configuration que pour la méthode Git.

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

### Étape 4 : Mettre à jour l'application

Si vous avez utilisé la **méthode Git**, la mise à jour est très simple. Après avoir poussé vos modifications sur votre dépôt :

```bash
# Connectez-vous en SSH
ssh admin@votre.domaine.tld

# Lancez la mise à jour
# Remplacez 'lespaceasso_ynh' par l'ID de votre application si différent
sudo yunohost app upgrade lespaceasso_ynh -u https://github.com/votre-utilisateur/votre-depot_ynh.git
```
Si vous avez utilisé la méthode manuelle, vous devrez réitérer le processus d'upload/décompression et utiliser la commande `upgrade`.