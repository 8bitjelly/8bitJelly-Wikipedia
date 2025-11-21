---
title: Method Declaration
description: How to declare methods in C#?
---

# Method Declaration
Clear and consistent method naming is critical for readability, maintainability, and teamwork in game development. A well-named method immediately communicates **what it does**, **what it returns**, and **how it should be used**.
This guide outlines common conventions for naming methods in Unity C# projects.

---

## General Principles
- **Use PascalCase** for method names.  
  Example: `GetPlayerHealth()`, not `getplayerhealth()` or `get_Player_Health()`.
- **Method names should be verbs or verb phrases** - they describe an action.
- **The name should reflect the return type and intent**. A developer should know what to expect without reading the method body.

---

## Common Naming Patterns

### 1. Getter Methods (Retrieve Values)
Use the **`Get…()`** prefix for methods that return a value.
- `GetPlayerSettings()`
- `GetCurrentLevelConfig()`
- `GetEnemyCount()`

### 2. Setter Methods (Assign Values)
Use the **`Set…()`** prefix for methods that assign or update a value.
- `SetQuestStatus(QuestStatus status)`
- `SetPlayerHealth(int amount)`

> ⚠️ Tip: Avoid making unnecessary setters. Use them only when external modification is intended.

### 3. Boolean Methods (Checks & Conditions)
Boolean-returning methods should clearly express a **yes/no** question:
- `IsHUDVisible()`
- `HasCollectedItem(string itemId)`
- `AreRequirementsFulfilled()`
- `TrySetPlayerName(string name)` (returns `true` if successful, `false` otherwise)
- `CheckIfAlive()`

### 4. Calculations
Use the **`Calculate…()`** prefix when the method performs a calculation and returns a result.
- `CalculateDamageOutput()`
- `CalculatePlayerBonusCards()`
- `CalculateExperienceRequired(int level)`

### 5. Try Methods (Safe Attempts)
Use the **`Try…()`** prefix when the method attempts an action and may fail gracefully without throwing exceptions.  
These methods usually return a `bool` and use `out` parameters.
- `TryGetPlayerById(int id, out Player player)`
- `TryLoadLevel(string levelName, out LevelConfig config)`

---

## Why This Matters

### Readability
Anyone reading your code understands what a method does without opening it.

### Consistency
Reduces confusion across the project when multiple developers work together.

### Maintainability
Easier to refactor or replace methods when their purpose is clear.

### Self-documenting
Less reliance on external documentation if naming is explicit.

---