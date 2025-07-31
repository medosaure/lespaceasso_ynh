# Package YunoHost pour L'Espace Asso

Ce dépôt permet d’installer l’application L’Espace Asso sur un serveur YunoHost.

## Installation

1. Depuis l’interface YunoHost, ajoute l’application avec l’URL de ce dépôt.
2. Le script d’installation va cloner le projet principal depuis GitHub, installer les dépendances et lancer l’application.

## Structure
- `yunohost/manifest.json` : Métadonnées de l’app
- `yunohost/install` : Script d’installation
- `yunohost/remove` : Script de désinstallation
- `yunohost/upgrade` : Script de mise à jour

## Personnalisation
- Adapte le script d’installation pour pointer vers le bon dossier ou dépôt si besoin.
- Ajoute la configuration nginx personnalisée dans le script `install` si nécessaire.

## Dépôt principal
Le code source de l’application est sur :
https://github.com/medosaure/lespaceasso

---

Pour toute question, utilise le forum YunoHost ou ouvre une issue sur ce dépôt.
