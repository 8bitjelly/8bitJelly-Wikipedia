---
title: Getting Started With GitHub Desktop
description: A Beginner-Friendly Guide to Branching, Committing, and Creating Pull Requests Using GitHub Desktop.
---

# Getting Started With GitHub Desktop

If you're new to Git or GitHub, the workflow can feel a bit overwhelming at first.  
Fortunately, **GitHub Desktop** makes the entire process much more visual, intuitive, and beginner-friendly.  
In this article, we’ll walk through the **core workflow** every developer should know:

- Creating a branch
- Publishing the branch
- Making changes and committing
- Pushing your work
- Opening a pull request

By the end, you'll clearly understand how to work with branches and share your changes with your team.

---

# Creating Your First Branch

Before you start adding or editing files, it’s a good idea to create a **new branch**.  
Branches let you work on features or fixes without touching the main project until everything is ready.

## 1. Open the Branch Menu

First, click on the current branch name located at the top of the GitHub Desktop window under **Current Branch**.

![Place for image](https://i.imgur.com/JC1Tkcj.png)

## 2. Select “New Branch”

A dropdown will appear. Choose **New Branch** from the list.

![Place for image](https://i.imgur.com/ZZHjmIC.png)

## 3. Name Your Branch

A window will pop up where you can enter the name of your new branch.  
Follow [`Naming Convention for branches`](../../Coding%20Standards/Git%20Workflow/Branch%20Naming%20Convention)

Once you're done, click **Create Branch**.

![Place for image](https://i.imgur.com/oRvFMr1.png)

---

# Publishing Your Branch

Now that your branch exists locally, you need to share it with GitHub so others (or you on another machine) can access it.

Click the **Publish branch** button next to the branch name.

![Place for image](https://i.imgur.com/bfc7M9S.png)

Once the button changes to **Fetch origin**, that means your branch is now live on GitHub, and you can start working.

![Place for image](https://i.imgur.com/uGM3oBj.png)

---

# Making Changes and Committing

After editing, adding, or deleting files in your project, GitHub Desktop will automatically detect all changes.

## 1. View Your Changes

Your modified files appear on the **left side** of the window.

![Place for image](https://i.imgur.com/ShPiIyI.png)

## 2. Select Which Changes You Want to Commit

If there are files you *don’t* want to include in the commit, simply uncheck them.

This is useful when you're still experimenting or when some files aren’t ready yet.

> Remember that you can commit multiple times on the same branch!!!!

![Place for image](https://i.imgur.com/Ww5ofqV.png)

## 3. Write a Commit Message

At the bottom-left, you’ll see two text boxes:

- **Summary** - a short description of what changed
- **Description (optional)** - a longer explanation

Try to keep the summary clear and meaningful, check [`Git Commit Messages`](../../Coding%20Standards/Git%20Workflow/Git%20Commit%20Messages) for more information

![Place for image](https://i.imgur.com/qiEB39g.png)

## 4. Commit Your Changes

When you're ready, click **Commit files to \<your branch name\>**.

![Place for image](https://i.imgur.com/CPAddFL.png)

---

# Pushing Your Work to GitHub

After committing locally, a new button appears: **Push origin**.  
Click it to upload your commit to your online repository.

You’ll also see the name of your latest commit in the bottom-left list.

![Place for image](https://i.imgur.com/BZUmRoM.png)

---

# Creating a Pull Request

Once your work is pushed, it’s time to merge your changes into the main branch - but only after someone reviews them.

## 1. Go to Your Repository on GitHub

Open GitHub in your browser and navigate to your repository.

You should see a large yellow banner at the top with a **Compare & pull request** button.

Click it.

![Place for image](https://i.imgur.com/wnLgbQB.png)

## 2. Open a Pull Request

You’ll now see the **Open a pull request** screen.  
Here you can:

- Change the pull request title
- Write an explanation of what you changed

When everything looks good, click **Create pull request**.

![Place for image](https://i.imgur.com/2g7t0KR.png)

---

# And You’re Done!

Your changes will now appear in the **Pull Requests** tab, where the code reviewer (or you, if you're working solo) can check everything before merging.

This workflow - **branch → commit → push → pull request** - is the foundation of nearly all collaborative Git development.  
Once you master it, you’ll be able to contribute cleanly, safely, and effectively to any project.