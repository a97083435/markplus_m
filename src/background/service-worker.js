import BookmarkManager from '../common/bookmarkManager.js';
import Constant from '../common/constant.js';
import Util from "../common/utils.js";
import {summarizeTags} from '../common/llmutil.js';

//初始化indexedDB
chrome.runtime.onInstalled.addListener(() => {
    console.log("Bookmark Extender 插件已安装");
    chrome.bookmarks.getTree(async function (bookmarkTreeNodes) {
        console.log("开始初始化书签");
        const bookmarks = Util.flattenBookmarkTree(bookmarkTreeNodes);
        console.log(bookmarks.length)
        let dbCount = await BookmarkManager.dbCount();
        if (dbCount == bookmarks.length) {
            console.log("书签已初始化");
        } else {
            BookmarkManager.saveBookmarks(bookmarks)
                .then(() => {
                    console.log("书签保存成功");
                })
                .catch(error => {
                    console.error("初始化或验证书签时出错:", error);
                });
        }
    });
});
//打开管理页
chrome.action.onClicked.addListener((tab) => {
    let settingTabIdKey = "sys_settingTabIdKey";
    let settingTabId = "";
    chrome.storage.local.get(settingTabIdKey, (result) => {
        settingTabId = result[settingTabIdKey];
        if (settingTabId) {
            chrome.tabs.get(settingTabId, function (tab) {
                if (chrome.runtime.lastError) {
                    chrome.tabs.create({url: 'index.html'}, function (tab) {
                        chrome.storage.local.set({[settingTabIdKey]: tab.id});
                    });
                } else {
                    chrome.tabs.update(settingTabId, {active: true});
                }
            });
        } else {
            chrome.tabs.create({url: 'index.html'}, function (tab) {
                chrome.storage.local.set({[settingTabIdKey]: tab.id});
            });
        }

    });
});

//打开tab时缓存tabid与url
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    if (details.frameId != 0) {
        return;
    }
    const url = details.url;
    const tabKey = Util.getTabKey(details.tabId);
    console.log("打开地址:", url)
    chrome.storage.local.get(tabKey, (result) => {
        if (!result[tabKey]) {
            console.log("添加tab缓存",tabKey,url)
            chrome.storage.local.set({[tabKey]: url});
        }
    });
});

//打开tab异常时清理缓存更新书签状态
chrome.webNavigation.onErrorOccurred.addListener((details) => {
    if (details.frameId != 0) {
        return;
    }
    let url = details.url;
    const tabKey = Util.getTabKey(details.tabId);
    console.log("打开标签异常!",tabKey)
    chrome.storage.local.get(tabKey, (items) => {
        console.log("错误-删除tab缓存-before",items[tabKey])
        if (!items[tabKey]) {
            return;
        }
        console.log("错误-删除tab缓存-after",items[tabKey])
        chrome.storage.local.remove(tabKey);
        console.error("异常标签搜索书签", url)
        BookmarkManager.getByUrl(url).then(datas => {
            if (Array.isArray(datas) && datas.length > 0) {
                for (let bookmark of datas) {
                    if (bookmark && bookmark.id) { // 如果是书签地址
                        console.log("打开书签异常", bookmark)
                        bookmark.currentUrl = url;
                        try {
                            bookmark.currentDomain = new URL(url).hostname;
                        } catch (e) {
                        }
                        bookmark.status = -1;
                        BookmarkManager.saveBookmarks([bookmark]);
                    }
                }
            }

        });
        if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
        }
    });
    const removeTabKey = Util.getRemoveTabKey(details.tabId);
    chrome.storage.local.get(removeTabKey, (items) => {
        console.log("错误-删除removetab缓存-before",items[removeTabKey])
        if (items[removeTabKey]) {
            console.log("错误-删除removetab缓存-after",items[removeTabKey])
            chrome.storage.local.remove(removeTabKey);
            chrome.tabs.remove(details.tabId);
        }
    });
});

/**
 * 加载完成
 *
 */
chrome.webNavigation.onCompleted.addListener((details) => {
    if (details.frameId != 0) {
        return;
    }
    let url = details.url;
    const tabId = details.tabId;
    const tabKey = Util.getTabKey(details.tabId);

    chrome.storage.local.get(tabKey, (items) => {
        console.log("监听加载完成-删除tab缓存-before",items[tabKey])
        if (!items[tabKey]) {
            return;
        }
        let searchUrl = url;
        if (items[tabKey] && items[tabKey] != url) {
            console.log("原始url：", items[tabKey], "，当前url：", url)
            searchUrl = items[tabKey];
        }
        console.log("监听加载完成-删除tab缓存",tabKey,url)
        chrome.storage.local.remove(tabKey);
        console.log("搜索书签", searchUrl)
        BookmarkManager.getByUrl(searchUrl).then(datas => {
            if (Array.isArray(datas) && datas.length > 0) {
                const bookmark = datas[0];
                if (bookmark && bookmark.id) { // 如果是书签地址
                    console.log("加载完成找到书签", bookmark)
                    bookmark.currentUrl = url;
                    try {
                        bookmark.currentDomain = new URL(url).hostname;
                    } catch (e) {
                    }
                    updateBookMark(bookmark, tabId);
                }
            } else {
                console.log("未找到书签:", searchUrl)
            }
            console.log("监听加载完成-删除removetab缓存-before",items[tabKey])
            const removeTabKey = Util.getRemoveTabKey(tabId);
            chrome.storage.local.get(removeTabKey, (items) => {
                if (items[removeTabKey]) {
                    chrome.storage.local.remove(removeTabKey);
                    chrome.tabs.remove(tabId);
                }
            });
        });
    });
});

/**
 * 长连接监听页面指令
 */
chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (params) {
        if (params.action === Constant.QUERY_FOLDER) {
            BookmarkManager.queryBookmarks(params).then(datas => {
                port.postMessage({action: Constant.QUERY_FOLDER, datas: Util.getRootTree(datas)});
            })
        } else if (params.action === Constant.STOP_CRAWL_META) {
            chrome.storage.local.set({"sys_crawlStatus": "0"})
        } else if (params.action === Constant.CRAWL_META) {
            chrome.storage.local.set({"sys_crawlStatus": "1"})
            BookmarkManager.queryBookmarks(params).then(async datas => {
                // 清理缓存数据，TODO需确定为什么缓存一直没被清理
                // await chrome.storage.local.clear();
                await clearCache();
                var i = 0;
                for (const data of datas) {
                    const crawlStatus = await getLocalStorageItem('sys_crawlStatus');
                    if (crawlStatus == "0") {
                        return;
                    }
                    i++;
                    if (i>10){
                        debugger;
                    }
                    await awaitLoad();
                    console.log("获取源数据:", data.url);
                    await chrome.tabs.create({url: data.url, active: false}, function (tab) {
                        const removeTabKey = Util.getRemoveTabKey(tab.id);
                        chrome.storage.local.set({[removeTabKey]: tab.id});
                    });
                }
            })
        } else {
            BookmarkManager.queryBookmarks(params).then(datas => {
                port.postMessage({action: params.action, datas: datas});
            })
        }
    });
});

/**
 * 等待之前任务完成
 * @returns {Promise<unknown>}
 */
async function awaitLoad() {
    return new Promise((resolve) => {
        chrome.storage.local.get(null, (items) => {
            let removeCount = 0;
            for (let key in items) {
                if (key.startsWith('remove_')) {
                    removeCount++;
                }
            }
            if (removeCount > 3) {
                setTimeout(() => awaitLoad().then(resolve), 1000);
            } else {
                resolve(removeCount);
            }
        });
    });
}

//在打开的tab页中执行脚本获取元数据
async function updateBookMark(bookmark, tabId) {
    if (bookmark.status == 0 || bookmark.status == -1) {
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            function: () => {
                let metaKeywords = document.querySelector('meta[name$="keywords"]')?.content || '';
                let metaTitle = document.querySelector('meta[name$="title"]')?.content || '';
                if (metaTitle || metaTitle == '') {
                    metaTitle = document.querySelector('title')?.text || '';
                }
                let metaDescription = document.querySelector('meta[name$="description"]')?.content || '';
                const metaTagsEle = document.querySelectorAll('meta[property$="tag"]');
                let metaTags = '';
                metaTagsEle.forEach((metaTag, index) => {
                    const content = metaTag.getAttribute('content');
                    if (content) {
                        metaTags += content;
                        if (index < metaTagsEle.length - 1) {
                            metaTags += ',';
                        }
                    }
                });
                const result = {metaKeywords, metaTitle, metaDescription, metaTags};
                console.log("result:", result)
                return result;
            }
        }, async (results) => {
            const removeTabKey = Util.getRemoveTabKey(tabId);
            chrome.storage.local.get(removeTabKey, (items) => {
                if (items[removeTabKey]) {
                    chrome.storage.local.remove(removeTabKey);
                    chrome.tabs.remove(tabId);
                }
            });
            if (chrome.runtime.lastError) {
                console.error("执行脚本时出错:", chrome.runtime.lastError);
            } else {
                let data = results[0].result;
                console.log("获取的元数据:", results);
                bookmark.metaKeywords = data.metaKeywords;
                bookmark.metaTitle = data.metaTitle;
                bookmark.metaDescription = data.metaDescription;
                bookmark.metaTags = data.metaTags;
                bookmark.status = 2;
                BookmarkManager.saveBookmarks([bookmark]);
            }
            summarizeTagsByLLm(bookmark);
        });
    } else if (bookmark.status == 2) {
        summarizeTagsByLLm(bookmark);
        const removeTabKey = Util.getRemoveTabKey(tabId);
        chrome.storage.local.get(removeTabKey, (items) => {
            if (items[removeTabKey]) {
                chrome.storage.local.remove(removeTabKey);
                chrome.tabs.remove(tabId);
            }
        });
    }
}

async function summarizeTagsByLLm(bookmark) {
    try {
        const metaTitle = bookmark.metaTitle;
        const metaKeywords = bookmark.metaKeywords;
        const metaDescription = bookmark.metaDescription;
        const metaTags = bookmark.metaTags;
        const tags = await summarizeTags(JSON.stringify({metaTitle, metaKeywords, metaDescription, metaTags}));
        bookmark.status = 9;
        bookmark.tags = tags['tags'];
        BookmarkManager.saveBookmarks([bookmark]);
    } catch (e) {
        console.log("llm总结标签异常:", e)
    }
}

async function getLocalStorageItem(key) {
    return new Promise((resolve) => {
        chrome.storage.local.get([key], function (result) {
            resolve(result[key]);
        });
    });
}

async function clearCache() {
    return new Promise((resolve) => {
        chrome.storage.local.get(null, function (items) {
            let keysToRemove = [];
            for (let [key, value] of Object.entries(items)) {
                // 假设前缀是 "prefix_"
                if (!key.startsWith("sys_")) {
                    keysToRemove.push(key);
                }
            }

            // 移除所有符合条件的键
            if (keysToRemove.length > 0) {
                chrome.storage.local.remove(keysToRemove);
            }
            resolve();
        });
    });
}


