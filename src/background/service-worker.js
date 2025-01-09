import BookmarkManager from '../common/bookmarkManager.js';
import Constant from '../common/constant.js';
import Util from "../common/utils.js";
import LLM from '../common/llmutil.js';
import userSetting from "../common/userSetting.js";

/**
 * 初始化indexedDB
 */
chrome.runtime.onInstalled.addListener(() => {
    chrome.bookmarks.getTree(async function (bookmarkTreeNodes) {
        const bookmarks = Util.flattenBookmarkTree(bookmarkTreeNodes);
        let dbCount = await BookmarkManager.dbCount();
        if (dbCount != bookmarks.length) {
            BookmarkManager.saveBookmarks(bookmarks)
                .catch(error => {
                    console.error("初始化或验证书签时出错:", error);
                });
        }
    });
});

chrome.bookmarks.onCreated.addListener(async function(id, bookmark) {
    const bookmarkDb = await BookmarkManager.addChromeBookmark(bookmark);
    chrome.tabs.query({ url: bookmark.url }, (tabs) => {
        updateBookMark([bookmarkDb],tabs[0].id);
    });
});

chrome.bookmarks.onRemoved.addListener(function(id, removeInfo) {
    BookmarkManager.deleteBookmarks([{id,type:removeInfo.node.url?'bookmark':'folder'}])
});

chrome.bookmarks.onChanged.addListener(function(id, changeInfo) {
    console.log('Bookmark changed:', id, changeInfo);
});

chrome.bookmarks.onMoved.addListener(function(id, moveInfo) {
    console.log('Bookmark moved:', id, moveInfo);
});
/**
 * 首页
 */
chrome.action.onClicked.addListener((tab) => {
    const indexUrl = `chrome-extension://${chrome.runtime.id}/index.html`; // 动态获取扩展 ID

    chrome.tabs.query({ url: indexUrl }, (tabs) => {
        if (tabs.length > 0) {
            // 如果 index.html 标签页已经打开，则切换到它
            chrome.tabs.update(tabs[0].id, { active: true });
        } else {
            // 如果未打开，则创建一个新的 index.html 标签页
            chrome.tabs.create({ url: indexUrl });
        }
    });
});

/**
 * 监听tab打开
 */
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    if (details.frameId != 0) {
        return;
    }
    const url = details.url;
    const tabKey = Util.getTabKey(details.tabId);
    // console.log("打开地址:", url)
    chrome.storage.local.set({[tabKey]: url});
});

/**
 * 监听tab异常
 */
chrome.webNavigation.onErrorOccurred.addListener((details) => {
    if (details.frameId != 0) {
        return;
    }
    let url = details.url;
    const tabKey = Util.getTabKey(details.tabId);
    const removeTabKey = Util.getRemoveTabKey(details.tabId);
    Util.removeLocalKey(tabKey, (items) => {
        console.log("打开标签异常-删除前!",tabKey)
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
                    }
                }
                BookmarkManager.saveBookmarks(datas);
            }

        });
    },(items) => {
        console.log("打开标签异常-关闭tab!",tabKey)
        Util.removeLocalKey(removeTabKey, (items) => {
            chrome.tabs.remove(details.tabId);
        });
    });


});

/**
 * 加载完成
 *
 */
chrome.webNavigation.onCompleted.addListener((details) => {
    if (details.parentFrameId != -1) {
        return;
    }
    let url = details.url;
    const tabId = details.tabId;

    const tabKey = Util.getTabKey(details.tabId);
    const removeTabKey = Util.getRemoveTabKey(details.tabId);
    Util.removeLocalKey(tabKey, async (items) => {
        // console.log("加载完成-删除前!", tabKey)
        let searchUrl = url;
        if (items[tabKey] && items[tabKey] != url) {
            searchUrl = items[tabKey];
        }
        await BookmarkManager.getByUrl(searchUrl).then(async datas => {
            if (Array.isArray(datas) && datas.length > 0) {
                const bookmark = datas[0];
                if (bookmark && bookmark.id) { // 如果是书签地址
                    // console.log("加载完成找到书签", bookmark)
                    bookmark.currentUrl = url;
                    bookmark.currentDomain = null;
                    try {
                        bookmark.currentDomain = new URL(url).hostname;
                    } catch (e) {
                    }
                    let sameUrl = bookmark.domain == bookmark.currentDomain;
                    for (let i = 0; i < datas.length; i++) {
                        datas[i].currentUrl = bookmark.currentUrl;
                        datas[i].currentDomain = bookmark.currentDomain;
                        if (!sameUrl) {
                            datas[i].status = -2;
                        }
                    }
                    if(!sameUrl){
                        BookmarkManager.saveBookmarks(datas);
                    }else{
                        await updateBookMark(datas, tabId);
                    }
                }
            } else {
                console.log("未找到书签:", searchUrl, tabKey)
            }
        });
    },(items) => {
        // console.log("加载完成-删除tab!",tabKey)
        Util.removeLocalKey(removeTabKey, (items) => {
            chrome.tabs.remove(details.tabId);
        });
    });
});

/**
 * 长连接监听页面指令
 */
chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (params) {
        if (params.action === Constant.PAGE_EVENT.QUERY_FOLDER) {
            BookmarkManager.queryBookmarks(params).then(datas => {
                port.postMessage({action: Constant.PAGE_EVENT.QUERY_FOLDER, datas: Util.getRootTree(datas)});
            })
        } else if (params.action === Constant.PAGE_EVENT.STOP_CRAWL_META) {
            chrome.storage.local.set({[Constant.ENV.SYS_CRAWL_STATUS]: "0"});
        } else if (params.action === Constant.PAGE_EVENT.CRAWL_META) {
            chrome.storage.local.set({[Constant.ENV.SYS_CRAWL_STATUS]: "1"});
            BookmarkManager.queryBookmarks(params).then(async datas => {
                const userConfig = await userSetting.getConfig();
                await Util.clearCache();
                var i = 0;
                for (const data of datas) {
                    const crawlStatus = await Util.getLocalStorageItem(Constant.ENV.SYS_CRAWL_STATUS);
                    if (crawlStatus == "0") {
                        return;
                    }
                    if(data.url.startsWith("chrome")){
                        continue;
                    }
                    if(!userConfig.crawlStatus.includes(data.status)){
                        continue;
                    }
                    await Util.awaitLoad(userConfig);
                    await chrome.tabs.create({url: data.url, active: false}, function (tab) {
                        chrome.storage.local.set({[Util.getRemoveTabKey(tab.id)]: tab.id});
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


//在打开的tab页中执行脚本获取元数据
async function updateBookMark(datas, tabId) {
    let bookmark = datas[0];
    if (bookmark.metaTitle == '') {
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
                // console.log("result:", result)
                return result;
            }
        }, async (results) => {
            if (chrome.runtime.lastError) {
                console.error("执行脚本时出错:", chrome.runtime.lastError);
            } else {
                let data = results[0].result;
                // console.log("获取的元数据:", results);
                for (let i = 0; i < datas.length; i++) {
                    datas[i].metaKeywords = data.metaKeywords;
                    datas[i].metaTitle = data.metaTitle;
                    datas[i].metaDescription = data.metaDescription;
                    datas[i].metaTags = data.metaTags;
                    datas[i].status = 2;
                }
                BookmarkManager.saveBookmarks(datas);
            }
            LLM.init().then(self => self.addSummarizeQueue(bookmark));
        });
    } else if (!bookmark.tags || bookmark.tags.length == 0) {
        LLM.init().then(self => self.addSummarizeQueue(bookmark));
    }
}

