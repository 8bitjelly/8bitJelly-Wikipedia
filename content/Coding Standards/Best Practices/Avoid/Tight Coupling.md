---
title: Tight Coupling
description: Why It’s Bad and How to Avoid It
---

# Tight Coupling Between Scripts

When developing games in **Unity with C#**, it’s tempting to make one script directly control another. For example, Script A directly accesses Script B’s fields or methods to trigger behavior. While this might work in the short term, it creates a **tight coupling** that can cause **fragile code, hidden dependencies, and long-term maintenance problems**.

---

## What Is Tight Coupling?

Tight coupling happens when two scripts are **too dependent on each other’s internal details**.  
This often looks like:

```csharp
public class Player : MonoBehaviour
{
    public Health health;

    private void Update()
    {
        // Player directly manipulates Health's internal logic
        if (Input.GetKeyDown(KeyCode.Space))
        {
            health.currentHealth -= 10;
        }
    }
}

public class Health : MonoBehaviour
{
    public int currentHealth = 100;
}
```
Here, the Player script knows about and manipulates the Health script’s internal variable. If Health changes (e.g., renaming currentHealth or changing how damage is calculated), the Player script immediately breaks.

---

## Why Tight Coupling Is Bad

### 1. Fragile Code
- A small change in one script forces changes in multiple other scripts.
- This slows down iteration and increases the risk of introducing bugs.

---

### 2. Harder to Reuse Components
- A Health script **tightly** bound to a Player script can’t be easily reused on enemies, NPCs, or objects like destructible crates.
- You lose the modularity that makes Unity components powerful.

---

### 3. Circular Dependencies
Tight coupling often leads to circular references:
- Script A depends on Script B
- Script B depends on Script A

This creates spaghetti code that’s difficult to debug and almost impossible to load in isolation.

---

### 4. Breaks Isolation & Testing
- You can’t test Health without also setting up a Player (and vice versa).
- Automated testing or isolated debugging becomes painful.

---

## Best Practices – How to Avoid Tight Coupling

### Use Public Methods Instead of Direct Field Access

Encapsulate behavior inside methods so other scripts don’t care about internal implementation:

```csharp
public class Health : MonoBehaviour
{
    private int currentHealth = 100;

    public void TakeDamage(int amount)
    {
        currentHealth -= amount;
        Debug.Log("Health: " + currentHealth);
    }
}

public class Player : MonoBehaviour
{
    [SerializeField] private Health health;
    
    public void OnJump(InputAction.CallbackContext context)
    {
        if (context.performed)
        {
            Jump();
            health.TakeDamage(10); // Cleaner & safer
        }
    }
}
```
Player only calls `TakeDamage()` without needing to know how Health works internally.

> ⚠️ This solution is not perfect. While using public methods is safer than exposing fields directly, it still means that any other script with a reference can call TakeDamage() whenever it wants. This makes the system more vulnerable to misuse, harder to control, and less secure in large projects.

---

### Use Events for Communication
Decouple scripts by broadcasting events instead of direct method calls:
```csharp
public class Health : MonoBehaviour
{
    public event Action<int> OnDamageTaken;
    private int currentHealth = 100;

    private void TakeDamage(int amount)
    {
        currentHealth -= amount;
        OnDamageTaken?.Invoke(currentHealth);
    }
}

public class UIHealthBar : MonoBehaviour
{
    [SerializeField] private Health health;

    private void OnEnable()
    {
        health.OnDamageTaken += UpdateHealthBar;
    }

    private void OnDisable()
    {
        health.OnDamageTaken -= UpdateHealthBar;
    }

    private void UpdateHealthBar(int newHealth)
    {
        Debug.Log("Update UI to: " + newHealth);
    }
}
```
UIHealthBar listens to Health changes without needing to know its internals.

---

### Use Interfaces for Flexibility
Interfaces allow scripts to work with any class that implements the contract:

```csharp
public interface IDamageable
{
    void TakeDamage(int amount);
}

public class Health : MonoBehaviour, IDamageable
{
    private int currentHealth = 100;

    public void TakeDamage(int amount)
    {
        currentHealth -= amount;
    }
}

public class Enemy : MonoBehaviour
{
    [SerializeField] private MonoBehaviour damageableObject;
    private IDamageable damageable;

    private void Awake()
    {
        damageable = (IDamageable)damageableObject;
    }

    private void Attack()
    {
        damageable.TakeDamage(10);
    }
}
```
Now Enemy doesn’t care if it’s damaging a Player, NPC, or a Crate - as long as it implements IDamageable.

---

### When Tight Coupling Might Be Acceptable
- Prototyping: When you just need to get something working quickly.
- Very small scripts: For throwaway or simple mechanics.
- But for long-term projects, always aim for loose coupling.