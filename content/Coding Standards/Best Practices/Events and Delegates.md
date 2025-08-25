---
title: Events
description: ???
---

# Events and Delegates in Unity

Events and delegates are powerful features in C# that allow scripts to **communicate without being tightly coupled**. Instead of one script directly calling another, you can broadcast messages (events) that other scripts can subscribe to.

This makes your code **more modular, flexible, and reusable** — which is especially valuable in game development, where systems often evolve and change over time.

---

## Example: Using Events for Level Management

```csharp
using System;
using UnityEngine;

public class LevelManager : MonoBehaviour
{
    private void OnEnable()
    {
        LevelManagerEvents.GetLevelConfig += GetCurrentLevelConfig;
        LevelManagerEvents.LoadNextLevel += LoadNextLevel;
        LevelManagerEvents.GetLastLevelPlayed += GetLastLevelPlayed;
        LevelManagerEvents.SaveLastLevel += SaveLastLevel;
    }

    private void OnDisable()
    {
        LevelManagerEvents.GetLevelConfig -= GetCurrentLevelConfig;
        LevelManagerEvents.LoadNextLevel -= LoadNextLevel;
        LevelManagerEvents.GetLastLevelPlayed -= GetLastLevelPlayed;
        LevelManagerEvents.SaveLastLevel -= SaveLastLevel;
    }

    private LevelConfig GetCurrentLevelConfig()
    {
        // Return current level data
        return new LevelConfig();
    }

    private void LoadNextLevel()
    {
        Debug.Log("Loading next level...");
    }

    private string GetLastLevelPlayed()
    {
        return "Level_05";
    }

    private void SaveLastLevel()
    {
        Debug.Log("Saving last level...");
    }
}

public static class LevelManagerEvents
{
    public static Func<LevelConfig> GetLevelConfig;
    public static Action LoadNextLevel;
    public static Func<string> GetLastLevelPlayed;
    public static Action SaveLastLevel;
}
```

---

## Why Use Events?

### Loose Coupling
The LevelManager doesn’t need to know which scripts are listening — it just broadcasts events. Other systems (UI, Audio, Save System) can respond independently.

### Scalability
New features can be added without modifying existing scripts. For example, adding a sound effect when the level loads only requires subscribing to LoadNextLevel.

### Cleaner Code
Removes direct references between classes, which helps avoid spaghetti code and makes maintenance easier.

---

## Best Practices 

### Always Unsubscribe in `OnDisable()`
- Prevents memory leaks (objects stay in memory because they’re still subscribed).
- Prevents null reference exceptions when events fire on destroyed objects.

```csharp
private void OnDisable()
{
    LevelManagerEvents.LoadNextLevel -= LoadNextLevel;
}
```

---

## Use Action and Func for Simplicity
- `Action` = method with no return value.
- `Func<T>` = method that returns a value.

This makes event signatures clear and consistent.

---

## When to Use Events in Unity?
- `Player Health Updates` → Notify UI, sound, and effects without hard dependencies.
- `Game State Changes` → Broadcast transitions (Menu → Gameplay → Pause).
- `Achievements / Analytics` → Trigger systems that react to gameplay events.
- `Input Handling` → Centralize input logic and broadcast it to interested scripts.

---