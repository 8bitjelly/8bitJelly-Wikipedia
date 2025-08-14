## Variable Organization

- **Separate variables based on type and usage.** Organize your variables logically, ensuring clarity and ease of understanding.

- **Private serialized fields** are grouped together:
  ```csharp
  [SerializeField] private GameObject experiencePanel;
  [SerializeField] private Slider experienceBar;
  ```
- **Private variables** are also grouped together:
  ```csharp
  private string _playerName;
  private float _score;
  ```
- **Further separation** for clarity. If a script has multiple responsibilities, separate variables accordingly within each responsibility.

- **No separation is needed** if variables are closely related, even if they differ slightly in type:
  ```csharp
  [SerializeField] private GameObject object;
  private Animator _objectAnimator;
  ```