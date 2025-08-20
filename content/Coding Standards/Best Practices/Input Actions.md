---
title: Input Actions
description: Why You Should Use Input Actions Instead of Input.GetKeyDown
---

# Input Actions
When starting out in Unity, many developers use the classic **old Input Manager** with checks like:

```csharp
if (Input.GetKeyDown(KeyCode.Space))
{
    Jump();
}
```
While this works for simple prototypes, it quickly becomes hard to manage, inflexible, and error-prone in larger projects.
Unity’s Input System with Input Actions provides a much more powerful and scalable way to handle player input.

# Input Handling in Unity: `Input.GetKeyDown` vs Input Actions

## Problems With `Input.GetKeyDown`

### 1. Hardcoded Keys
- Every input is tied to a specific key in code.
- Changing controls requires modifying code and recompiling.

### 2. Difficult Rebinding
- Players can’t easily remap controls in-game.
- Adding multiple key options (e.g., “W” or “ArrowUp”) requires extra checks.

### 3. Tightly Coupled Input and Gameplay
- Input is checked directly inside [`Update()`](Avoid/Update()).
- Gameplay logic depends on specific key codes instead of abstract actions.
- Makes testing, refactoring, and scaling harder.

### 4. No Separation of Input and Logic
- The gameplay logic directly depends on the input system.
- Makes testing and code maintenance harder.

### 5. Limited Device Support
- Works well for keyboard/mouse.
- Becomes messy when adding controller, mobile, or touch support.
- You’d need to write separate checks for each input device.

### 6. Constant Polling
- Input checks run **every frame** in [`Update()`](Avoid/Update()).
- Less efficient compared to event-driven approaches.

---

## Why Input Actions Are Better

### 1. Flexibility and Rebinding
- Key bindings are not hardcoded.
- You can expose rebinding to the player at runtime.
- The same action (e.g., “Jump”) can be triggered by different devices.

### 2. Device Independence
- he same Input Action can work on keyboard, gamepad, or mobile.
- No need to rewrite input checks for each platform.

### 3. Cleaner, Decoupled Code
- Input is mapped to actions, not physical keys.
- Your gameplay logic only cares about “Jump was pressed”, not “Spacebar was pressed”.

### 4. Event-Driven Input
- Instead of polling in [`Update()`](Avoid/Update()), you can subscribe to callbacks like `performed`, `canceled`, or `started`.
- More efficient and cleaner code.

---

## Example – Using Input Actions

### Old Way (Coupled and Hardcoded):

```csharp
void Update()
{
    if (Input.GetKeyDown(KeyCode.Space))
    {
        Jump();
    }
}
```

### New Way (Flexible and Decoupled):

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

public class PlayerController : MonoBehaviour
{
    private PlayerInputActions inputActions;

    private void Awake()
    {
        inputActions = new PlayerInputActions();
    }

    private void OnEnable()
    {
        inputActions.Player.Jump.performed += OnJump;
        inputActions.Player.Enable();
    }

    private void OnDisable()
    {
        inputActions.Player.Jump.performed -= OnJump;
        inputActions.Player.Disable();
    }

    private void OnJump(InputAction.CallbackContext context)
    {
        if (context.performed)
        {
            Jump();
        }
    }

    private void Jump()
    {
        Debug.Log("Player Jumped!");
    }
}
```
- `PlayerInputActions` is a generated class from the Input Actions asset.
- Jump can be mapped to Space, A (controller), or Touchscreen tap without code changes.