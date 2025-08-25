---
title: ScriptableObjects
description: Is there a better solution to store data?
---

# ScriptableObjects in Unity

## What Are ScriptableObjects?

A **ScriptableObject** is a special Unity object type that allows you to store **data** outside of MonoBehaviours and scenes.  
Unlike regular components, they don’t need to be attached to GameObjects and don’t exist in the scene hierarchy.  
They live as **asset files** in your project, making them reusable, shareable, and persistent.

---

## The Problem Without ScriptableObjects

When you store all your data in MonoBehaviours:

- Data is tied to **specific GameObjects**.
- Duplicating prefabs/scenes leads to **duplicate copies of the same data**.
- Testing and balancing values requires entering Play mode, changing them, and then remembering to save changes.
- Cross-scene data sharing becomes messy, often leading to **Singletons** or static variables.

Example (inefficient):

```csharp
public class Enemy : MonoBehaviour
{
    public int health;
    public int damage;
    public float speed;
}
```

If you create 50 different enemies, you must manually configure each prefab’s health, damage, and speed.
Changing a balance value later requires updating every prefab individually.

---

## Why Use ScriptableObjects?
ScriptableObjects let you **separate data** from behavior.

### Example:

```csharp
[CreateAssetMenu(fileName = "EnemyData", menuName = "Game Data/Enemy")]
public class EnemyData : ScriptableObject
{
    public int health;
    public int damage;
    public float speed;
}
```

Now your `Enemy` script can reference a **shared data asset**:

```csharp
public class Enemy : MonoBehaviour
{
    [SerializeField] private EnemyData enemyData;

    private int maxHealth;

    private void Awake()
    {
        maxHealth = enemyData.health;
    }
}
```

---

### 1. Centralized Data
- Balance values (e.g., enemy health, weapon damage, item stats) are defined in one place.
- Updating a `ScriptableObject` updates all objects that use it.

### 2. Cross-Scene Persistence
- Since they live as assets, they can be shared across multiple scenes without extra code.

### 3. Editor-Friendly
- Values can be modified directly in the inspector without entering Play mode or writing extra code.
- Great for designers and non-programmers.

### 4. Reduced Duplication
- Instead of having 100 prefabs with duplicate data, you have one `ScriptableObject` used by all.


### 5. Improved Architecture
- Encourages **data-driven design**
- Gameplay systems can read from data containers rather than hardcoding values

---

## When Should You Use ScriptableObjects?

### Game Balancing
- Weapons, characters, enemies, abilities, items, buffs/debuffs, etc.

### Shared Configuration Data
- Input settings, audio settings, difficulty levels

---

## When Not to Use ScriptableObjects
- They’re best for **data containers**, not complex logic.
- Avoid modifying them directly at runtime unless intended - they persist outside play mode and can overwrite project assets.

---