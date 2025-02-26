# MarkPlus-M

<div align="center">

![MarkPlus-M Logo](src/assets/icons/icon128.png)

Chrome 书签管理增强插件 - 让你的书签管理更智能

[![Version](https://img.shields.io/badge/version-0.0.3-blue.svg)](https://github.com/your-repo/MarkPlus-M/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[English](./docs/README_en.md) | 简体中文

</div>

## 🚀 功能

-  通过tab页爬取已存储书签检查书签状态并获取网页 meta 信息
-  通过AI Studio自动解析网页标签
-  基于扩展信息进行搜索
-  批量维护书签

## ✨ 特性

- 🤖 **AI 驱动** - 集成 Google AI Studio，自动为书签生成标签
- 📊 **数据统计** - 直观展示书签使用情况
- 🔍 **智能搜索** - 多维度快速检索
- 💾 **本地存储** - 数据安全，完全离线
- 🛡️ **隐私保护** - 不收集任何个人信息

## 📦 安装

1. 从 [Chrome Web Store](https://chromewebstore.google.com/detail/markplus-m/ggnkeikgmibbjjjfglhbnpjbacnbpgek) 安装



## 🚀 快速开始
> 书签管理中操作书签会同步操作chrome中书签，最好备份之后再操作

### 基本使用
1. 扩展搜索，搜索框左侧可下拉通过扩展信息搜索
![](docs/images/1.png)

2. 编辑模式下，通过chrome.tabs获取网页扩展数据，再次点击停止获取

> ⚠️ 获取过程会临时打开标签页，可在设置中调整并发数

![](docs/images/2.png)
![](docs/images/2-1.png)

3.编辑模式下，点击左上角统计内容批量删除书签
![](docs/images/2-2.png)

### 配置说明
> 总结网页标签需要Google AI Studio密钥，使用的模型是learnlm-1.5-pro-experimental，

![](docs/images/3.png)


## 📝 更新日志

### 0.0.5
#### ✨ 新功能
- 增加Geminid调用测试



### 0.0.4
#### ✨ 新功能
- 搜索增加正则支持

#### 🐛 问题修复
- 修复用户设置保存失效

#### 🔨 优化改进
- 页面样式调整

### 0.0.3
#### ✨ 新功能
- 新增浏览器语言自动识别功能
- 新增书签数据导入/导出功能
- 新增文件夹右键菜单
  - 支持批量删除
  - 支持快速编辑

#### 🐛 问题修复
- 修复后台服务挂起导致页面按钮失效的问题

#### 🔨 优化改进
- 改进文件夹管理体验
- 优化数据同步机制
