---
title: Over Referencing
description: Why referencing entire scripts for a single variable or function is bad practice
---

When building gameplay systems in Unity, it’s common for scripts to interact with each other.  
However, a frequent mistake-especially among beginners-is **over referencing**: dragging entire scripts into components even when you only need *one* variable or *one* function from them.

While this might seem convenient, it leads to tightly coupled systems, unnecessary dependencies, and code that becomes harder to maintain as your project grows.

This article explains **what over referencing is**, **why it’s harmful**, and **how to replace it with cleaner communication patterns such as delegates and UnityEvents**.

---

# What Is Over Referencing?

Over referencing happens when a script holds a direct reference to another script **just to use one tiny part of it**.

## Example:

```csharp
public class PlayerUI : MonoBehaviour
{
    public PlayerHealth playerHealth; // Referencing the entire script

    private void Update()
    {
        hpBar.fillAmount = playerHealth.currentHealth / playerHealth.maxHealth;
    }
}
```
Here, the UI only needs to know about health changes, yet it keeps a reference to the entire PlayerHealth component.

This creates unnecessary coupling:

- UI depends directly on PlayerHealth

- PlayerHealth must exist in the scene

- Any refactor to PlayerHealth risks breaking the UI

---

## Why Over Referencing Is a Problem

### 1. Tight Coupling Between Systems

If Script A references Script B directly, then Script A cannot function without B.
This makes both scripts harder to move, reuse, or test.

Good architecture reduces dependencies - over referencing increases them.


---

### 2. Harder to Maintain and Scale

As the codebase grows:

- More scripts reference each other
- Every script expects others to exist
- Renaming or refactoring breaks multiple systems

This leads to spaghetti dependencies - everything knows everything.

---

### 3. Poor Testing & Debugging Experience

If a script requires another script to function, you can't test it in isolation.
Mocking becomes harder.

For example, you can't easily test UI updates without spawning a full Player object with health logic.

---

### 4. Increased Risk of Null Reference Exceptions

More references = more risk.

If even one script is missing, disabled, or not assigned in the Inspector, your game breaks.

By using events or delegates, you prevent this because your code only responds when something fires an event.

---

### 5. Violates the Single Responsibility Principle (SRP)

If a script handles:

its own logic AND the logic of referencing another script AND UI updates AND communication ...it’s doing too much.

Events allow cleaner separation of responsibilities.

---

## Better Alternatives: Events & Delegates

Unity provides multiple systems for decoupling scripts:

[`C# Delegates, C# Events, UnityEvent, Action/Func`](/coding-standards/best-practices/events-and-delegates)

---

### Example: Using C# Events Instead of Over Referencing

## Old way (tight coupling)
```csharp
public class PlayerUI : MonoBehaviour
{
    public PlayerHealth playerHealth;

    private void Update()
    {
        hpBar.fillAmount = playerHealth.currentHealth / playerHealth.maxHealth;
    }
}
```
### New way (event-driven and decoupled)

PlayerHealth.cs
```csharp
public class PlayerHealth : MonoBehaviour
{
    public event Action<float> OnHealthChanged;

    public float currentHealth;
    public float maxHealth;

    public void TakeDamage(float value)
    {
        currentHealth -= value;
        OnHealthChanged?.Invoke(currentHealth / maxHealth);
    }
}
```
PlayerUI.cs
```csharp
public class PlayerUI : MonoBehaviour
{
    public PlayerHealth playerHealth;

    private void OnEnable()
    {
        playerHealth.OnHealthChanged += UpdateHPBar;
    }

    private void OnDisable()
    {
        playerHealth.OnHealthChanged -= UpdateHPBar;
    }

    private void UpdateHPBar(float normalizedHealth)
    {
        hpBar.fillAmount = normalizedHealth;
    }
}
```

Benefits:

- UI doesn't check health every frame
- UI doesn't need to know or reference all player stats
- The update happens only when needed
- The scripts communicate cleanly without dependency hell

---

### Example Using UnityEvent (Inspector-friendly)

If you want designers to hook things up without touching code:
```csharp
public class Door : MonoBehaviour
{
    public UnityEvent OnDoorOpened;

    public void Open()
    {
        // Door animation logic...
        OnDoorOpened.Invoke();
    }
}
```
Now any script can listen to the event without referencing the Door script directly.


---

## When You SHOULD Reference a Script

Not all referencing is bad. Reference another script directly if:

- Two systems logically belong together
- A script manages or owns another component
- You need constant access to multiple variables
- The dependency is intentional and stable

---

## Summary

Over referencing creates unnecessary dependencies between scripts, making your project harder to maintain, scale, and debug.

Using delegates, events, or UnityEvents lets you:

- decouple systems
- reduce risk of null exceptions
- improve modularity
- make systems reusable
- keep code cleaner and easier to understand


Good architecture isn’t about connecting everything - it’s about making sure the right things stay disconnected.

---