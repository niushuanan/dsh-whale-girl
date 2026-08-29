# dsh-whale-girl

[English](README.en.md) | 中文

[![DSH Plugin](https://img.shields.io/badge/DSH-Plugin-111111)](https://github.com/niushuanan/xiaozhuang-dsh) [![Release](https://img.shields.io/badge/release-xiaozhuang--v0.4.2-2563eb)](https://github.com/niushuanan/dsh-whale-girl/releases/tag/xiaozhuang-v0.4.2) [![MIT](https://img.shields.io/badge/license-MIT-16a34a)](LICENSE)

在 DSH 各页面提供会随会话状态变化的原生陪伴角色、快捷操作和轻量反馈。左侧圆键现会按精灵所在半区显示左右箭头，一键用气泡消散／出现效果切换到输入框约 10% 或 90% 处。

<p align="center"><img src="docs/05-whale-girl.webp" alt="鲸少女外观与快捷操作设置" width="800"></p>

## 安装

1. 打开 [Releases](https://github.com/niushuanan/dsh-whale-girl/releases/latest)，下载附带的 ZIP。
2. 把 ZIP 交给能够读取并修改目标 DSH 项目的 AI。
3. 对 AI 说：**先阅读压缩包里的 AGENTS.md、INSTALL.md 和 manifest.json，只安装这个插件，并保留现有插件、数据、对话、附件和设置。**
4. 安装 AI 会按目标 DSH 的当前结构合入代码和 Cordis 行，只验证本插件直接涉及的入口。

## 内容

- <code>payload/</code>：从主仓库复制的插件代码和必要运行资源。
- <code>manifest.json</code>：插件组成、来源、主仓库 commit 和逐文件 SHA-256。
- <code>INSTALL.md</code>：直接安装、冲突适配、失败恢复和最小验证说明。
- <code>docs/</code>：当前版本的真实产品截图。

## 来源与许可

本仓库是 [Xiaozhuang DSH](https://github.com/niushuanan/xiaozhuang-dsh) 的单向发布副本，不是独立开发源。当前内容同步自主仓库 commit [`35de1753ca`](https://github.com/niushuanan/xiaozhuang-dsh/commit/35de1753ca8a5e0cda2d9884e594887fbcdab5e5)；最新已发布安装包仍为 [`xiaozhuang-v0.4.2`](https://github.com/niushuanan/dsh-whale-girl/releases/tag/xiaozhuang-v0.4.2)。代码采用 [MIT License](LICENSE)。
