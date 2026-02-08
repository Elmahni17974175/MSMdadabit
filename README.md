# msmdadabit

**msmdadabit** est une extension MakeCode pour **micro:bit** dédiée au robot **DaDa:bit (Hiwonder)**,  
conçue pour l’apprentissage progressif de la **robotique**, du **suivi de ligne** et de l’**intelligence artificielle embarquée** avec **WonderCam**.

Cette extension est pensée pour un usage **pédagogique**, clair et structuré, sans logique cachée ni boucles automatiques.

---

## 🎯 Objectifs pédagogiques

- Comprendre le **fonctionnement des capteurs de ligne (S1–S4)**
- Mettre en œuvre un **algorithme de suivi de ligne robuste**
- Utiliser la **vision artificielle (WonderCam)** pour détecter des couleurs
- Concevoir une **mission robotique complète** :  
  détecter → approcher → attraper → livrer → déposer
- Travailler avec une **logique par étapes (phases)**

---

## 🤖 Matériel requis

- micro:bit V2
- Robot **DaDa:bit** (Hiwonder)
- **WonderCam** montée sur le robot
- Servos :
  - 4 × servos 360° (déplacement)
  - 1 × servo 270° (bras)
  - 1 × servo 270° (pince)

---

## 📦 Dépendances

L’extension repose uniquement sur :

- `dadabit` (Hiwonder)  
  > ⚠️ WonderCam est chargée automatiquement via DaDa:bit

Aucune autre extension n’est nécessaire.

---

## 🧩 Blocs disponibles

### 🔹 Init
- Initialiser DaDa:bit + WonderCam
- Positionner le bras en position de départ

### 🔹 Capteurs
- Mettre à jour les capteurs de ligne
- Lire l’état de S1 à S4
- Détecter la zone de destination (S1–S4 sur noir)

### 🔹 Suivi de ligne
- Arrêter le robot
- Suivi de ligne général (ligne noire sur fond clair)

### 🔹 Vision (WonderCam)
- Mettre à jour la caméra
- Vérifier si une couleur ID est détectée et centrée
- Lire la position verticale (Y) de l’objet

### 🔹 Bras
- Attraper un objet
- Déposer un objet

### 🔹 Mission
- Gérer la phase :
  - `0` → reconnaissance
  - `1` → livraison
- Approcher et attraper un objet couleur ID de façon stable

---

## 🧠 Principe de fonctionnement

La mission du robot repose sur une **machine à états simple** :

| Phase | Rôle |
|-----|-----|
| 0 | Recherche et reconnaissance de l’objet |
| 1 | Livraison et dépôt |

Le passage d’une phase à l’autre est **contrôlé par les blocs**, ce qui rend la logique :
- lisible
- modulaire
- idéale pour l’enseignement

---

## 🧪 Exemple d’utilisation (logique)

Dans la boucle principale :

1. Mettre à jour la caméra
2. Mettre à jour les capteurs de ligne
3. Suivre la ligne
4. Si couleur détectée et stable → approcher & attraper
5. Si destination atteinte → déposer

👉 **Aucune boucle cachée** dans l’extension.

---

## 🎓 Public cible

- Collège / Lycée
- Clubs de robotique
- Compétitions éducatives
- Initiation à l’IA embarquée
- Projets STEM / STEAM

---

## 📜 Licence

MIT – libre d’utilisation, modification et diffusion à des fins éducatives.

---

## ✨ Auteur

Développé par **MSM Medias**  
Extension conçue pour un apprentissage clair, progressif et professionnel de la robotique éducative.
