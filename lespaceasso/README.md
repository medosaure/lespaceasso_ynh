# L'Espace Associatif - Projet Firebase Studio

Ceci est une application de gestion pour association créée dans Firebase Studio.

## Déploiement sur YunoHost avec Git

Cette méthode est la plus recommandée car elle facilite les mises à jour.

### Étape 1 : Envoyer le projet sur GitHub

Si vous avez déjà envoyé votre projet sur GitHub, assurez-vous qu'il est à jour avec les dernières modifications. Si ce n'est pas le cas, ou si vous repartez de zéro, voici les commandes à lancer depuis le dossier du projet sur votre ordinateur.

1.  **Se placer dans le bon dossier**
    Ouvrez un terminal (comme PowerShell ou CMD sur Windows, ou Terminal sur macOS/Linux) et naviguez jusqu'au dossier `lespaceasso` que vous avez téléchargé.

2.  **Initialiser Git (si nécessaire)**
    Si c'est la première fois que vous envoyez ce dossier, tapez :
    ```bash
    git init
    ```

3.  **Lier à votre dépôt GitHub**
    Si c'est la première fois, liez votre dossier local à votre dépôt distant :
    ```bash
    git remote add origin https://github.com/medosaure/lespaceasso_ynh.git
    ```
    Si la commande retourne une erreur "remote origin already exists", ce n'est pas grave, vous pouvez l'ignorer.

4.  **Ajouter tous les fichiers**
    Cette commande est cruciale. Elle prépare tous les fichiers (nouveaux et modifiés) pour l'envoi. Le `.` signifie "tout".
    ```bash
    git add .
    ```

5.  **Créer un "enregistrement" (commit)**
    Ceci sauvegarde vos changements avec un message descriptif.
    ```bash
    git commit -m "Mise à jour de l'application"
    ```

6.  **Envoyer sur GitHub**
    Cette commande transfère vos fichiers vers votre dépôt GitHub.
    ```bash
    git push -u origin main
    ```
    Si vous rencontrez une erreur "Updates were rejected", cela signifie que le dépôt en ligne a des changements que vous n'avez pas. Si vous êtes certain que votre version locale est la bonne, vous pouvez forcer l'envoi avec :
    ```bash
    git push -f origin main
    ```

### Étape 2 : Installer sur YunoHost

1.  Connectez-vous à votre interface web d'administration YunoHost.
2.  Allez dans "Applications" > "Installer".
3.  Cherchez l'application "My Webapp" (ou "Ma Webapp").
4.  Dans le champ "URL du dépôt Git", collez le lien de votre dépôt GitHub : `https://github.com/medosaure/lespaceasso_ynh.git`
5.  Choisissez le domaine et le chemin où vous souhaitez l'installer.
6.  Cliquez sur "Installer".

L'installation peut prendre plusieurs minutes, le temps que YunoHost télécharge le projet, installe les dépendances avec `npm install`, et lance l'application.

### Étape 3 : Premier compte Administrateur

Le tout premier compte inscrit avec le rôle "Admin" sera automatiquement approuvé et deviendra l'administrateur principal.

1.  Rendez-vous sur l'URL de votre application.
2.  Cliquez sur "S'inscrire".
3.  Remplissez le formulaire, en cochant bien la case **"Admin"**.
4.  Connectez-vous.
