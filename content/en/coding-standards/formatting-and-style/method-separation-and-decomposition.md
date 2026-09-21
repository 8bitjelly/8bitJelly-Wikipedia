---
title: Method Separation and Decomposition
description: How to seperate and decompose your methods?
---

When developing games in Unity, it’s easy for methods to grow too large, trying to handle initialization, configuration, logic, and even UI updates all in one place. This quickly makes the code **hard to read, test, and maintain**.

Method separation and decomposition is the practice of **breaking down large methods into smaller, focused methods**, each handling a single responsibility. This improves clarity, keeps your project structured, and helps teams work more efficiently.

---

## Why We Decompose Methods

### Readability
Smaller, well-named methods act as documentation, making code easier to understand at a glance.

---

### Maintainability
Changes can be isolated to specific methods without introducing unintended side effects.

---

### Testability
Smaller methods can be tested independently, reducing bugs.

---

### Reusability
Common tasks can be reused in multiple places instead of duplicating logic.

---

### Collaboration
In a team environment, clear method boundaries make it easier for multiple developers to work on the same class without conflict.

---

## How to Apply Method Separation

### 1. Initialization
Move setup logic (like player stats, game state, or object spawning) into a dedicated method.

```csharp
private void InitializePlayer()
{
    _playerName = "Hero";
    _score = 0;
}
```

---

### 2. Setting Values
If a method needs to assign values or configure settings, put that logic into its own function.

```csharp
private void SetPlayerAttributes(int health, int stamina)
{
    _playerHealth = health;
    _playerStamina = stamina;
}
```

---

### 3. Operations
Keep the core operations focused and independent, making them reusable.

```csharp
private void UpdatePlayerScore(int points)
{
    _score += points;
}
```

---

## Example of Decomposition
### Before (hard to read, does too much)
```csharp
public void StartGame()
{
    _playerName = "Hero";
    _score = 0;
    _playerHealth = 100;
    _playerStamina = 50;
    _score += 10;
    Debug.Log("Game started");
}
```
### After (clear responsibilities, easy to follow)
```csharp
public void StartGame()
{
    InitializePlayer();
    SetPlayerAttributes(100, 50);
    UpdatePlayerScore(10);
    Debug.Log("Game started");
}

private void InitializePlayer()
{
    _playerName = "Hero";
    _score = 0;
}

private void SetPlayerAttributes(int health, int stamina)
{
    _playerHealth = health;
    _playerStamina = stamina;
}

private void UpdatePlayerScore(int points)
{
    _score += points;
}
```

---

## Benefits of Method Decomposition
- **Improved readability:** Each method has a clear, single responsibility.
- **Easier testing:** Small methods can be tested in isolation.
- **Better maintainability:** Fixes and updates are localized.
- **Code reuse:** Common logic can be shared across classes.
- **Scalability:** As projects grow, decomposed methods keep complexity manageable.

---