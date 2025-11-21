---
title: Switch Statements
description: Why you shouldn't use else if?
---


## The Problem With Long `if` Chains

A lot of beginner code looks like this:

```csharp
private void HandleInput(string action)
{
    if (action == "Jump")
    {
        Jump();
    }
    else if (action == "Shoot")
    {
        Shoot();
    }
    else if (action == "Reload")
    {
        Reload();
    }
    else if (action == "Crouch")
    {
        Crouch();
    }
    else
    {
        Debug.Log("Unknown action: " + action);
    }
}
```

While it works, there are some issues:

---

### Hard to Read
- The more conditions you add, the messier it looks.
- Nested conditions make code harder to scan and understand.

### Less Efficient
- Each condition is evaluated one by one until it finds a match.
- With many conditions, this becomes less performant than a switch.

### Error-Prone
- Easy to miss an else or write overlapping conditions.
- Harder to spot bugs in long chains.

---

## The switch Alternative
Using `switch` makes the same logic cleaner and more structured:

```csharp
void HandleInput(string action)
{
    switch (action)
    {
        case "Jump":
            Jump();
            break;
        case "Shoot":
            Shoot();
            break;
        case "Reload":
            Reload();
            break;
        case "Crouch":
            Crouch();
            break;
        default:
            Debug.Log("Unknown action: " + action);
            break;
    }
}
```

---

## Benefits of Using switch

### 1. Clarity
- Each case is clearly separated and easy to follow.
- Much easier to extend later (add more cases without making a giant if-else chain).

### 2. Performance
- In many cases, the compiler optimizes `switch` better than `if`/`else`.
- Especially true with enums and integers.

### 3. Maintainability
- Easier to refactor
- Cases are self-contained, reducing the risk of missing an `else`

### 4. Better for Enums
- If you use an enum for states or actions, `switch` is the natural fit.
- Unity code often benefits from `enums` (e.g., player states, AI states).

Example with an enum:

```csharp
public enum PlayerAction { Jump, Shoot, Reload, Crouch }

void HandleInput(PlayerAction action)
{
    switch (action)
    {
        case PlayerAction.Jump:
            Jump();
            break;
        case PlayerAction.Shoot:
            Shoot();
            break;
        case PlayerAction.Reload:
            Reload();
            break;
        case PlayerAction.Crouch:
            Crouch();
            break;
        default:
            Debug.Log("Unhandled action: " + action);
            break;
    }
}
```

---

## When to Use switch
- When handling multiple discrete options (inputs, states, AI behaviors, etc.).
- When working with enums or integer values (cleaner and more efficient).
- When readability matters - which is always in team projects.