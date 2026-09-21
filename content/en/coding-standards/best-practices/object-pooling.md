---
title: Object Pooling
description: Why You Should Use Object Pooling in Unity
headline: Object Pooling in Unity
---

In many Unity games, objects such as bullets, enemies, or particle effects are created and destroyed constantly during gameplay. While this may seem harmless, frequent calls to [`Instantiate()`](/coding-standards/best-practices/avoid/creating-multiple-objects) and [`Destroy()`](/coding-standards/best-practices/avoid/destroy) cause **serious performance issues** over time.
The solution? **Object Pooling** - a design pattern that reuses objects instead of creating and destroying them repeatedly.

---

## What Is Object Pooling?
Object Pooling is a technique where you **pre-create a pool of objects** and reuse them by enabling/disabling instead of instantiating and destroying.

### Without Object Pooling:
- Every bullet is created with [`Instantiate()`](/coding-standards/best-practices/avoid/creating-multiple-objects)
- Every bullet is destroyed with [`Destroy()`](/coding-standards/best-practices/avoid/destroy)
- Memory allocations and garbage collection happen constantly

### With Object Pooling:
- Bullets are created once at the start
- When needed, an **inactive bullet** is reused
- When finished, the bullet is **disabled**, not destroyed

---

## Why Use Object Pooling?

### 1. Massive Performance Boost
- [`Instantiate()`](/coding-standards/best-practices/avoid/creating-multiple-objects) and [`Destroy()`](/coding-standards/best-practices/avoid/destroy) are **expensive** operations.
- Pooling removes most runtime instantiations, reducing CPU load.
- The fewer objects Unity needs to allocate and deallocate, the **smoother your game runs**.

---

### 2. Prevents Garbage Collection (GC) Spikes
- Destroying objects creates garbage in memory.
- Over time, the GC kicks in and causes **lag spikes**.
- Pooling avoids most garbage generation by **recycling objects**.

---

### 3. Smoother Gameplay
- Especially critical for **fast-paced games** (shooters, action, bullet-hell games).
- No more micro-freezes when lots of objects are spawned or destroyed at once.

---

### 4. Easy to Scale
- Adding more enemies, projectiles, or particle effects doesn’t tank performance.
- Great for games with **high object counts** (tower defense, survival waves, bullet-hell).

---

### 5. Cleaner Design
- Pools centralize object management.
- Objects know how to **return themselves** to the pool instead of self-destructing.
- Debugging becomes easier with fewer unnecessary [`Instantiate`](/coding-standards/best-practices/avoid/creating-multiple-objects)/[`Destroy`](/coding-standards/best-practices/avoid/destroy) calls.

---

## Example - Bullet Pool

```csharp
using UnityEngine;
using System.Collections.Generic;

public class BulletPool : MonoBehaviour
{
    [SerializeField] private GameObject bulletPrefab;
    [SerializeField] private int initialSize = 20;

    private Queue<GameObject> pool = new Queue<GameObject>();

    private void Awake()
    {
        // Pre-create objects
        for (int i = 0; i < initialSize; i++)
        {
            GameObject bullet = Instantiate(bulletPrefab);
            bullet.SetActive(false);
            pool.Enqueue(bullet);
        }
    }

    public GameObject GetBullet(Vector3 position, Quaternion rotation)
    {
        GameObject bullet;
        if (pool.Count > 0)
        {
            bullet = pool.Dequeue();
        }
        else
        {
            bullet = Instantiate(bulletPrefab); // fallback if pool is empty
        }

        bullet.transform.SetPositionAndRotation(position, rotation);
        bullet.SetActive(true);
        return bullet;
    }

    public void ReturnBullet(GameObject bullet)
    {
        bullet.SetActive(false);
        pool.Enqueue(bullet);
    }
}
```
- `GetBullet()` fetches an inactive bullet.
- `ReturnBullet()` recycles it when finished.