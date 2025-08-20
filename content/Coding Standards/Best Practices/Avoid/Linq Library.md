---
title: Linq Library
description: Why we don't use Linq Library?
---

# Why You Should Avoid LINQ in Unity

C# provides the **LINQ (Language Integrated Query)** library, which is powerful and expressive for querying collections. While LINQ is great for business apps and editor tooling, it is **not recommended for runtime gameplay code in Unity**. LINQ introduces hidden performance costs, memory allocations, and readability issues in real-time environments where every millisecond matters.

---

## Problems with LINQ in Unity

### 1. Hidden Garbage Allocations
Most LINQ operations (`Where`, `Select`, `OrderBy`, etc.) create **temporary enumerators, closures, or lists** behind the scenes. These allocations are small but happen every time the query runs. In a game loop, these accumulate and trigger **Garbage Collection (GC) spikes**.

Example:
```csharp
var bossEnemies = enemies.Where(e => e.Health > 150).ToList();
```

- Allocates enumerators.
- Allocates a new list.
- Creates lambda closures.

In tight loops (like per-frame queries), this adds up quickly.

---

### 2. Performance Overhead
LINQ queries are not free. They add an abstraction layer:

- Iterates through the collection multiple times (depending on operators).
- Delegates and lambdas add extra method calls.
- Slower than a manual loop.

For games, where performance is critical, this extra overhead matters.

---

### 3. Harder Debugging
LINQ expressions look compact, but they can be harder to debug:
- Step-through debugging jumps into compiler-generated code.
- Stack traces become messy with anonymous methods.
- Errors may not clearly map back to your logic.

---

### 4. Not Scalable for Large Data
On small collections, LINQ may seem fine. But with hundreds or thousands of game objects (e.g., bullets, enemies, pathfinding nodes):
- LINQ queries allocate and iterate unnecessarily.
- Frame time increases.
- GC pressure rises.

This makes scaling to larger levels or mobile hardware much harder.

---

## Bad vs. Good Examples

### Bad: Using LINQ for Filtering

```csharp
// Finds all enemies with health below 50
var weakEnemies = enemies.Where(e => e.Health < 50).ToList();
```

Problems:
- Allocates a new list every time.
- Creates a lambda closure.
- Iterates more than necessary.

---

### Good: Manual Loop

```csharp
List<Enemy> weakEnemies = new List<Enemy>();

foreach (var enemy in enemies)
{
    if (enemy.Health < 50)
    {
        weakEnemies.Add(enemy);
    }
}
```

Advantages:
- No hidden allocations.
- One clear pass through the collection.
- Easier to profile and debug.

---

## When LINQ is Acceptable
There are cases where LINQ can still be useful:
- Editor tools and scripts where performance isn’t critical.
- One-time setup code (e.g., scene initialization).
- Debugging utilities where readability matters more than efficiency.

> ⚠️ But never use LINQ inside [`Update()`](Update()), FixedUpdate(), coroutines, or tight gameplay loops.

---

## Alternatives to LINQ in Unity
- Manual loops (for or foreach) → Faster, more predictable.
- Caching references → Don’t repeatedly search through objects.
- [Object pools](http://localhost:3000/Coding%20Standards/Best%20Practices/Object%20Pooling) / managers → Keep organized lists of active objects instead of filtering at runtime.
- Events / delegates → Notify interested scripts instead of querying all objects.

---