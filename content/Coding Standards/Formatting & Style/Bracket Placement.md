---
title: Bracket Placement
description: How to set up brackets?
---

# Bracket Placement
Bracket placement defines the **readability and consistency** of your code. In Unity C#, we follow the **[Allman style](https://en.wikipedia.org/wiki/Indentation_style#Allman_style)** (braces on new lines) for clarity and consistency across the project.

---

## General Rules
- **Brackets always on a new line** for classes, methods, properties, and control blocks (`if`, `for`, `while`, etc.).
- **No extra blank lines before or after a bracket**. Keep the braces tightly coupled to the code they belong to.

### Correct:
```csharp
public void MethodName()
{
    // Implementation
}
```

### Incorrect (extra space before opening brace):
```csharp
public void MethodName()

{
    // Implementation
}
```

### Incorrect (extra spaces inside braces):
```csharp
public void MethodName()
{

    // Implementation

}
```

---

## Spacing Between Methods
Keep **one blank line** between methods to improve readability, but avoid unnecessary spacing in other cases:

### Correct (one line between methods):
```csharp
private void MethodA()
{
    // ...
}

private void MethodB()
{
    // ...
}
```

### Incorrect (no spacing between methods):
```csharp
private void MethodA()
{
    // ...
}
private void MethodB()
{
    // ...
}
```

### Incorrect (multiple blank lines between methods):
```csharp
private void MethodA()
{
    // ...
}



private void MethodB()
{
    // ...
}
```

---

## File Boundaries
Do not add blank lines at the beginning or end of a file.
Your file should start with using directives or a namespace, and end directly after the last closing brace.

### Correct:
```csharp
using Unity;

public class Example
{
    private void Method()
    {
        // ...
    }
}
```

### Incorrect (extra line at the end):
```csharp
using Unity;

public class Example
{
    private void Method()
    {
        // ...
    }
    
}
```

---

## Why This Matters
- Improves code readability and scanning speed.
- Prevents **style conflicts** in version control.
- Keeps code clean and professional across the entire Unity project.

---