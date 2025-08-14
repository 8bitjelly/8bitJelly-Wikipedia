### Implicit and Explicit Variable Declarations

- **Implicit variables (var)** are preferred for readability and convenience. Using var lets the compiler infer the type based on the assigned value. This approach simplifies code, especially when working with complex or long type names:
  ```csharp
  var playerHealth = 100;  // Compiler infers that playerHealth is an int
  var gameObject = new GameObject();  // Compiler infers that gameObject is of type GameObject
  ```
- **Explicit variables**: Use explicit types only when clarity is absolutely necessary, such as when the type is not clear from the assignment.
  ```csharp
  int playerHealth = 100;  // Explicitly declaring the variable type as int
  GameObject gameObject = new GameObject();  // Explicit declaration of GameObject type
  ```
- **Note**: Avoid overusing var when the type isn't obvious, as it can reduce code clarity in such cases.