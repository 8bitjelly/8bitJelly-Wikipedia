### Work in progress

Do: Always unsubscribe in OnDisable() or OnDestroy().

Why: Prevents memory leaks and null reference exceptions.

Tip: For global events, consider using WeakReference or UnityEvents for safety.