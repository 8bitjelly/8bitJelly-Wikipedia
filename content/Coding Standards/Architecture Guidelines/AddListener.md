---
title: AddListener
description: Why we should use AddListener instead of OnClick()
---

# `onClick.AddListener` vs `OnClick()`

When working with Unity UI Buttons, you have two main options for handling clicks:

1. **Assign methods in the Inspector** under the Button’s **On Click()** section.
2. **Subscribe in code** using `button.onClick.AddListener(MyMethod)`.

While both work, **subscribing in code is often the better choice** for larger or more maintainable projects.

---

## Problems With Using Inspector `OnClick()` Events

### Hidden Logic
- The button’s behavior is defined in the Inspector, not the code.
- Makes it harder for new developers (or even your future self) to know what happens when the button is clicked.

---

### Fragile Setup
- If you rename or move a script, Unity may lose the reference in the Inspector.
- Broken links won’t show as compile errors — you only find out at runtime.

---

### Harder to Reuse or Instantiate
- Prefabs with Inspector-wired `OnClick()` may call the wrong methods if reused in different contexts.
- Dynamically instantiated buttons won’t automatically have the correct callbacks.

---

### Difficult Version Control
- Inspector assignments are stored in Unity’s scene/prefab YAML files.
- Code reviewers can’t easily see what’s connected without opening Unity Editor.

---

## Why `onClick.AddListener` in Code is Better

### Clear and Explicit
All button logic is inside the script, so you can see exactly what happens in one place.

```csharp
using UnityEngine;
using UnityEngine.UI;

public class Menu : MonoBehaviour
{
    [SerializeField] private Button playButton;

    private void Awake()
    {
        playButton.onClick.AddListener(OnPlayClicked);
    }

    private void OnPlayClicked()
    {
        Debug.Log("Play button pressed!");
    }

    private void OnDestroy()
    {
        playButton.onClick.RemoveListener(OnPlayClicked);
    }
}
```
- No hidden Inspector wiring.
- Logic is self-documented in the script.

## Safer and More Maintainable
- If you rename or refactor a method, the compiler will catch missing references.
- No silent runtime errors due to broken Inspector links.

## Great for Dynamic UI
- Perfect for buttons created at runtime (e.g., shop items, dialogue choices).
- Each instance can have its own logic without touching the Inspector.

```csharp
for (int i = 0; i < shopItems.Count; i++)
{
    Button button = Instantiate(buttonPrefab, parent);
    int index = i; // capture loop variable
    button.onClick.AddListener(() => BuyItem(index));
}
```

## When Inspector OnClick() Might Be Useful
- Quick prototypes where speed matters more than maintainability.
- Non-programmer workflows where designers/artists want to hook up simple actions without code.

But for production-ready projects, stick with `onClick.AddListener`.