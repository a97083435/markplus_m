# MarkPlus-M 文档

<div align="center">

![MarkPlus-M Logo](src/assets/icons/icon128.png)

Smart Bookmark Manager - Making Chrome Bookmark Management Easier


[![Version](https://img.shields.io/badge/version-0.0.3-blue.svg)](https://github.com/your-repo/MarkPlus-M/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

English | [简体中文](../README.md)

</div>

## ✨ Features

- 🤖 **AI-Powered** - Integrated with Google AI Studio for automatic tag generation
- 📊 **Data Analytics** - Visualize bookmark usage patterns
- 🔍 **Smart Search** - Multi-dimensional quick search
- 💾 **Local Storage** - Secure data with complete offline support
- 🛡️ **Privacy First** - No personal information collection

## 📦 Installation

1. Install from [Chrome Web Store](https://chromewebstore.google.com/detail/markplus-m/ggnkeikgmibbjjjfglhbnpjbacnbpgek) 安装



## 🚀 Quick Start
> Note: Bookmark management operations will sync with Chrome bookmarks. It's recommended to backup before making changes.


### Basic Usage
1. **Extension Search**
    - Use the dropdown menu on the left of the search box
    - Search through extension information
   ![](docs/images/1.png)

2. **Edit Mode**
    - In edit mode, webpage extension data is retrieved via chrome.tabs
    - Click again to stop retrieval

   > ⚠️ The retrieval process temporarily opens tabs. Concurrency can be adjusted in settings.


![](images/2.png)
![](images/2-1.png)


3. **Batch Management**
    - In edit mode, click the statistics in the top left
    - Batch delete bookmarks
![](images/2-2.png)

### Configuration

> 💡 Webpage tag summarization requires a Google AI Studio key. Uses model: learnlm-1.5-pro-experimental


![](images/3.png)


## 📝 Changelog

### 0.0.3
#### ✨ New Features
- Added automatic browser language detection
- Added bookmark data import/export functionality
- Added folder context menu
  - Support batch deletion
  - Support quick editing

#### 🐛 Bug Fixes
- Fixed page button failure caused by background service suspension

#### 🔨 Improvements
- Enhanced folder management experience
- Optimized data synchronization mechanism
