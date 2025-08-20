---
title: Creating Multiple Objects
description: Why you shouldn't overuse Instantiate()
---

# Creating Multiple Objects
In Unity, creating objects at runtime is a core mechanic. Whether it’s bullets, enemies, or particle effects, we often use `Instantiate()` to spawn new `GameObjects`. However, **spawning too many objects without control** can quickly become a serious performance and design issue.

---

## Example – Spawning Bullets Every Frame
```csharp
public class Gun : MonoBehaviour
{
    [SerializeField] private GameObject bulletPrefab;

    public void OnJump(InputAction.CallbackContext context)
    {
        if (context.performed)
        {
            // Spawns a brand-new bullet every frame while space is held
            Instantiate(bulletPrefab, transform.position, transform.rotation);
        }
    }
}
```
This looks fine at first, but if the player holds the fire button:
- You’ll end up with hundreds (or thousands) of bullets in the scene.
- Each bullet has its own `Transform`, `Rigidbody`, `Collider`, etc.
- Unity must simulate and render them all.

---

## Why Creating Too Many Objects Is Bad
### 1. Performance Overhead
- Every `Instantiate()` creates a new GameObject with components.
- Unity must manage these objects in physics, rendering, and memory systems.
- Thousands of objects = lag, stuttering, and frame drops.

---

### 2. Garbage Collection (GC) Pressure
- Destroying objects ([`Destroy(gameObject)`](Destroy())) creates garbage in memory.
- Frequent create/destroy cycles → constant GC allocations and spikes.
- Results in micro-freezes during gameplay.

---

### 3. Scene Clutter
- Having too many active objects makes it harder to debug, profile, and optimize.
- Inspecting the scene in the editor becomes messy.

---

### 4. Unnecessary Complexity
- Many gameplay situations don’t need new objects.
- Example: Instead of spawning a new explosion object every hit, you could reuse a pooled explosion effect.

---

## Best Practices Instead of Constant Instantiation
### Object Pooling
Instead of creating/destroying objects repeatedly, reuse them.

```csharp
using UnityEngine;
using UnityEngine.Pool;

public class BulletPool : MonoBehaviour
{
    [SerializeField] private GameObject bulletPrefab;
    private ObjectPool<GameObject> pool;

    void Awake()
    {
        pool = new ObjectPool<GameObject>(
            createFunc: () => Instantiate(bulletPrefab),
            actionOnGet: obj => obj.SetActive(true),
            actionOnRelease: obj => obj.SetActive(false),
            actionOnDestroy: obj => Destroy(obj),
            collectionCheck: false, defaultCapacity: 20, maxSize: 100
        );
    }

    public GameObject GetBullet(Vector3 position, Quaternion rotation)
    {
        GameObject bullet = pool.Get();
        bullet.transform.SetPositionAndRotation(position, rotation);
        return bullet;
    }

    public void ReleaseBullet(GameObject bullet)
    {
        pool.Release(bullet);
    }
}
```
- Bullets are reused instead of destroyed.
- Greatly reduces GC pressure and performance costs.

---

### Pooling Manually
If you don’t want to use Unity’s ObjectPool, you can make a simple list-based pool:

```csharp
public class SimpleBulletPool : MonoBehaviour
{
    [SerializeField] private GameObject bulletPrefab;
    private List<GameObject> pool = new List<GameObject>();

    public GameObject GetBullet(Vector3 pos, Quaternion rot)
    {
        foreach (var bullet in pool)
        {
            if (!bullet.activeInHierarchy)
            {
                bullet.transform.SetPositionAndRotation(pos, rot);
                bullet.SetActive(true);
                return bullet;
            }
        }

        GameObject newBullet = Instantiate(bulletPrefab, pos, rot);
        pool.Add(newBullet);
        return newBullet;
    }
}
```

---

### Think About Design
- Do you really need hundreds of spawned objects?
- Could the effect be simulated visually without each object being a fully simulated `GameObject`?
