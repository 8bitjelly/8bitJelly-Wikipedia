---
title: Code Comments
description: How to comment your code?
---

# Code Comments in Unity C#
Comments are an important part of writing **clean, maintainable, and team-friendly code**. They should provide context, explain intent, and clarify complex logic. However, they should not state the obvious or duplicate what the code already expresses clearly.

---

## Guidelines for Writing Comments

### 1. Comment Important or Complex Logic
- Use comments when a piece of code might be difficult to understand at first glance.
- Explain **why** something is done, not just **what** is being done.

**Correct:**
```csharp
// Reset health when respawning, but keep armor for balancing purposes
playerHealth = maxHealth;
```

**Incorrect (too obvious):**
```csharp
// Set player health to maxHealth
playerHealth = maxHealth;
```

---

### 2. Use XML Documentation for Methods and Classes
- Use `///` to create documentation comments for methods, classes, and properties.
- This makes your code easier to use with **IntelliSense** and helps other developers understand intent quickly.

**Example:**
```csharp
/// <summary>
/// Calculates the player's score based on the current game state.
/// </summary>
/// <returns>Total player score as an integer.</returns>
public int CalculateScore()
{
    // Implementation
}
```

---

### 3. Avoid Redundant or Obvious Comments
- Don’t repeat what the code already says in plain English.
- Keep comments **meaningful** and **purpose-driven**.

**Correct:**
```csharp
// Increase the player's score by a bonus multiplier
playerScore += baseScore * bonusMultiplier;
```

**Incorrect (code already says this):**
```csharp
// Add baseScore times bonusMultiplier to playerScore
playerScore += baseScore * bonusMultiplier;
```

---

### 4. Use Comments for TODOs and FIXMEs
- Clearly mark work that needs improvement or fixing.
- Use consistent prefixes so they can be easily found across the project.

**Example:**
```csharp
// TODO: Replace hardcoded values with ScriptableObject configuration
// FIXME: This causes a frame drop when too many enemies spawn
```

---

### 5. Keep Comments Updated
- Outdated comments are worse than no comments, because they mislead developers.
- Always update or remove comments if the code changes.

---

## Why Comments Matter
- Improve readability and knowledge sharing within a team.
- Help new developers onboard faster in Unity projects.
- Serve as documentation inside the codebase, reducing the need to dig through external docs.

> Write code that is self-explanatory first. Use comments to explain the why and the intent, not the how.

---