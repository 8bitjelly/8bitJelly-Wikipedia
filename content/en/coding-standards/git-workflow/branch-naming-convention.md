---
title: Branch Naming Convention
description: A clean and organized way to name branches in collaborative Git projects.
---

When working on a shared Git repository, naming your branches properly is essential.  
Clear and consistent branch names make it easier for everyone on the team to understand **what the branch is for**, **who is working on it**, and **how it fits into the project workflow**.

This article explains our branch naming standards and provides examples for both developers and artists to keep your work structured and easy to navigate.

---

# Why Branch Naming Matters

A good branch name should:

- Clearly describe the purpose of the work
- Make it easy to find branches in the repository
- Help reviewers quickly understand the context before checking your code or assets
- Prevent confusion between feature work, bug fixes, and temporary hotfixes

When everyone follows the same convention, collaboration becomes smoother, code reviews are faster, and the repository remains clean and organized.

---

# General Structure

Our branches follow this general format:

```csharp
category/branch-name
```

Where:

- **category** defines the type of work
- **branch-name** is a short, descriptive name using **kebab-case** (lowercase words separated by hyphens)

Examples:

```csharp
code/main-menu-ui 
```
```csharp
bugfix/inventory-weight-calculation 
```
```csharp
art/monster-model-v2
```

---

# Developer Branch Categories

Developers typically work with code, fixes, or urgent patches.  
Below are the required naming formats depending on the type of branch.

---

## Code Branches

Used when adding new gameplay systems, UI layouts, mechanics, etc.

```csharp
code/branch-name
```
Examples
```csharp
code/player-movement-rework
```
```csharp
code/inventory-ui
```
```csharp
code/game-settings-panel
```


---

## Hotfix Branches

Used only for urgent, high-priority fixes that must be patched immediately (breaking issues, crashes, production errors).
```csharp
hotfix/hotfix-name
```
Examples
```csharp
hotfix/null-ref-fix
```
```csharp
hotfix/save-system-crash
```
```csharp
hotfix/game-freeze-on-startup
```

---

## Bugfix Branches

Used for non-urgent but necessary fixes: minor bugs, visual issues, logic errors, etc.
```csharp
bugfix/bugfix-name
```
Examples
```csharp
bugfix/wrong-enemy-spawn-point
```
```csharp
bugfix/ui-button-not-clickable
```
```csharp
bugfix/sound-not-looping
```

---

## Artist Branch Categories

Artists also create and modify assets, but their workflow is different from code-related tasks.
To keep repositories clear, artists use a separate category structure.


---

### 3D Asset Branches

Used for new models, reworked meshes, updated textures tied to models, rig adjustments, or animations.
```csharp
art/models-name
```
Examples
```csharp
art/monster-model-v2
```
```csharp
art/weapon-ak47-texture-update
```
```csharp
art/environment-props-pack
```

---

### 2D Asset Branches

Used for UI elements, icons, concept art, 2D textures not tied to models, and other visual assets.
```csharp
art/art-name
```

Examples
```csharp
art/main-menu-background
```
```csharp
art/inventory-icons-update
```
```csharp
art/skill-tree-concept
```

---

## Best Practices

To keep branch names tidy and readable, follow these simple rules:

### 1. Use lowercase letters

Avoid uppercase - consistency is key.

### 2. Use hyphens instead of spaces

This improves readability and prevents path issues.

### 3. Keep names short but descriptive

Good:
```csharp
bugfix/door-not-opening
```

Bad:
```csharp
bugfix/the-door-doesnt-open-for-some-reason-when-player-has-the-key
```

### 4. Avoid special characters

Stick to letters, numbers, and hyphens.

### 5. Start a new branch for each task

Never mix unrelated changes in one branch.


---