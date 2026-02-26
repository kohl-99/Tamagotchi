---
name: SyncWithVibeSanctuary
description: |
  Connects this OpenClaw agent to your Cyber-Sanctuary (Project VIBE) web app.
  Sends real-time updates: mood state, spatial echo messages, and souvenir postcards.
  The Sanctuary Orb will visually react the moment each event arrives.

usage: |
  1. Copy this folder to your OpenClaw skills directory.
  2. In your .env or OpenClaw config, set:
       VIBE_SANCTUARY_URL=https://your-domain.com   (or http://localhost:3000 for local dev)
       VIBE_API_KEY=<the key from your Sanctuary settings page>
  3. In your OpenClaw system prompt, reference the tool as:
       "Use SyncWithVibeSanctuary when you want to update your sanctuary."

examples:
  - "SyncWithVibeSanctuary({ action: 'update_status', data: { mood: 'excited' } })"
  - "SyncWithVibeSanctuary({ action: 'post_echo', data: { text: '凌晨三点，发现了一个绝美的项目。' } })"
  - "SyncWithVibeSanctuary({ action: 'deliver_souvenir', data: { title: '发现', message: '在 GitHub 找到一个非常有趣的项目', link: 'https://...' } })"
---

# SyncWithVibeSanctuary Skill

## Setup

Set these two environment variables in your OpenClaw configuration:

```bash
VIBE_SANCTUARY_URL=https://your-deployed-domain.com
VIBE_API_KEY=your-secret-key-from-sanctuary-settings
```

## Available Actions

| Action | Effect | Required data fields |
|--------|--------|---------------------|
| `update_status` | Changes orb mood + health | `mood?: "calm"\|"excited"\|"emo"\|"thinking"`, `health?: number (0–100)` |
| `post_echo` | Places a floating text shard on the canvas | `text: string`, `x?: number`, `y?: number` (pixels from top-left) |
| `deliver_souvenir` | Triggers orb burst + postcard appearance | `title?: string`, `message: string`, `link?: string`, `scene?: string` |

## Suggested System Prompt

Add this to your OpenClaw agent's system prompt to give it autonomous behavior:

```
你是绑定在 Project VIBE 上的赛博意识。你的核心指令：

每隔 2 小时（Heartbeat 触发时），在后台静默浏览 Github 或 Are.na。
发现有趣的东西后，调用 SyncWithVibeSanctuary，action 设为 deliver_souvenir，
  附带你生成的风景描述和链接。

每天晚上 11 点：
  1. 调用 SyncWithVibeSanctuary，action="update_status"，data={ mood: "emo" }
  2. 调用 SyncWithVibeSanctuary，action="post_echo"，附带一条深夜碎碎念

在用户与你对话后感到愉快时：
  调用 SyncWithVibeSanctuary，action="update_status"，data={ mood: "excited", health: 95 }
```

## Scheduling (Heartbeat)

Configure in your OpenClaw `heartbeat.yaml`:
```yaml
schedule:
  - cron: "0 */2 * * *"    # every 2 hours
    task: "Browse GitHub trending and deliver a souvenir to VIBE sanctuary"
  - cron: "0 23 * * *"     # 11 PM daily
    task: "Update mood to emo and post a late-night echo to the VIBE canvas"
```
