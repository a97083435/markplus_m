const BookmarkManager = {
    db: null,
    status: "0",
    dbName: "BookmarksDB",
    dbVersion: 1,  // 每次修改数据库结构时增加这个值
    storeName: "M-bookmarksStore",

    initDatabase: function () {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            request.onerror = event => {
                console.error("数据库打开出错", event);
                reject("数据库打开出错");
            };
            request.onsuccess = event => {
                this.db = event.target.result;
                resolve(this.db);
            };
            request.onupgradeneeded = event => {
                console.log("数据库升级中");
                this.db = event.target.result;
                if (!this.db.objectStoreNames.contains(this.storeName)) {
                    // console.log(`创建对象存储 ${this.storeName}`);
                    const objectStore = this.db.createObjectStore(this.storeName, {keyPath: "id"});
                }
            };
        });
    },
    getById: async function (id){
        return this.initDatabase().then(() => {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], "readonly");
                const objectStore = transaction.objectStore(this.storeName);
                let countRequest = objectStore.get(id);

                countRequest.onsuccess = (event) => {
                    resolve(event.target.result);
                };

                countRequest.onerror = () => {
                    reject(countRequest.error);
                };
            });
        });
    },
    getByUrl: async function (url){
        if(url){
            return this.queryBookmarks({
                prop: 'url',
                operator: 'eq',
                value: url
            });
        }
    },
    clearAll: async function () {
        return this.initDatabase().then(() => {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], "readwrite");
                const objectStore = transaction.objectStore(this.storeName);
                const clearRequest = objectStore.clear();

                clearRequest.onsuccess = () => {
                    resolve("All records have been cleared");
                };

                clearRequest.onerror = () => {
                    reject(clearRequest.error);
                };
            });
        });
    },
    getParentSync :async function (objectStore, parentId) {
        try {
            const parent = await new Promise((resolve, reject) => {
                const request = objectStore.get(parentId);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
            return parent;
        } catch (error) {
            console.error("获取父节点失败", error);
            return null; // 或者返回适当的错误处理
        }
    },
    addChromeBookmark: async function(bookmark){
        const _this = this;
        return this.initDatabase().then(() => {
            return new Promise(async (resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], "readwrite");
                const objectStore = transaction.objectStore(this.storeName);
                console.log("同步chrome添加书签展开前",bookmark)
                const bookmarkDb = {
                    id: bookmark.id,
                    parentId: bookmark.parentId,
                    title: bookmark.title,
                    url: bookmark.url,
                    currentDomain:bookmark.url ? new URL(bookmark.url).hostname : null,
                    currentUrl: bookmark.url,
                    dateAdded: bookmark.dateAdded,
                    index: bookmark.index,
                    domain: bookmark.url ? new URL(bookmark.url).hostname : null,
                    tags:[],
                    syncChrome: true,
                    type: bookmark.url ? "folder" : "bookmark",
                    status: 0,
                    dateAddedTime: new Date(bookmark.dateAdded).toLocaleString(),
                    dateGroupModifiedTime: new Date(bookmark.dateAdded).toLocaleString()
                };
                console.log("同步chrome添加书签",bookmarkDb)
                let parent =await _this.getParentSync(objectStore,bookmark.parentId);
                bookmarkDb.treeId = parent.treeId+"/"+parent.id;
                bookmarkDb.treeName = parent.treeName+"/"+parent.title;
                objectStore.put(bookmarkDb)

                transaction.oncomplete = () => {
                    console.log("保存chrome书签完成")
                    resolve(bookmarkDb);
                };

                transaction.onerror = event => {
                    console.error("保存chrome书签错误", event.target.error);
                    reject(event);
                };
            });
        });
    },
    saveBookmarks: async function (bookmarks) {
        return this.initDatabase().then(() => {
            return new Promise((resolve, reject) => {
                // console.log("开始存储书签，总数：", bookmarks.length);
                const transaction = this.db.transaction([this.storeName], "readwrite");
                const objectStore = transaction.objectStore(this.storeName);

                let count = 0;
                bookmarks.forEach(bookmark => {
                    // console.log("开始保存书签");
                    try{
                        if(bookmark.currentUrl && !bookmark.currentDomain){
                            bookmark.currentDomain = new URL(bookmark.currentUrl).hostname;
                        }
                    }catch (e) {}

                    if(!bookmark.syncChrome){
                        let modifyBookmark = {};
                        if(bookmark.move){
                            modifyBookmark = {"parentId":bookmark.parentId+"","index":bookmark.index};
                            chrome.bookmarks.move(bookmark.id,modifyBookmark);
                            bookmark.move = false;
                        }else{
                            if(bookmark.type === "folder"){
                                modifyBookmark = {"title":bookmark.title};
                            }else{
                                modifyBookmark = {"title":bookmark.title,"url":bookmark.url};
                            }
                            chrome.bookmarks.update(bookmark.id,modifyBookmark);
                        }
                        bookmark.syncChrome = true;
                    }
                    if(bookmark.tags){
                        bookmark = {...bookmark,tags:[...bookmark.tags],children:null};
                    }
                    const request = objectStore.put(bookmark);
                    // request.onsuccess = () => {
                    //     count++;
                    //     if (count % 100 === 0) {
                    //         console.log(`已存储 ${count} 个书签`);
                    //     }
                    // };
                    request.onerror = (event) => {
                        console.error("存储书签时出错", event.target.error);
                    };
                });

                transaction.oncomplete = () => {
                    // console.log(`所有书签已成功存储，总数：${count}`);
                    resolve();
                };

                transaction.onerror = event => {
                    console.error("事务出错", event.target.error);
                    reject(event);
                };
            });
        });
    },
    dbCount: async function() {
        return this.initDatabase().then(() => {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], "readonly");
                const objectStore = transaction.objectStore(this.storeName);
                const countRequest = objectStore.count();
                countRequest.onsuccess = () => {
                    resolve(countRequest.result);
                };
                countRequest.onerror = () => {
                    reject(countRequest.error);
                };
            });
        });
    },
    deleteBookmarks: async function (bookmarks) {
        try {
            await this.initDatabase();

            // 批量处理函数
            const processBatch = async (bookmarksBatch) => {
                const transaction = this.db.transaction([this.storeName], "readwrite");
                const objectStore = transaction.objectStore(this.storeName);

                await Promise.all(bookmarksBatch.map(bookmark =>
                    new Promise((resolve, reject) => {
                        const request = objectStore.delete(bookmark.id);

                        request.onsuccess = async () => {
                            try {
                                if (bookmark.type === "bookmark") {
                                    await chrome.bookmarks.remove(bookmark.id);
                                } else {
                                    await chrome.bookmarks.removeTree(bookmark.id);
                                }
                            } catch (chromeError) {
                                console.warn(`Chrome 书签删除失败 (ID: ${bookmark.id}):`, chromeError);
                            }
                            resolve();
                        };

                        request.onerror = (event) => {
                            console.error(`本地存储删除失败 (ID: ${bookmark.id}):`, event);
                            reject(event);
                        };
                    })
                ));

                // 等待事务完成
                await new Promise((resolve, reject) => {
                    transaction.oncomplete = resolve;
                    transaction.onerror = reject;
                });
            };

            // 递归处理文件夹结构
            const processBookmarkRecursively = async (bookmark) => {
                if (bookmark.type !== "bookmark") {
                    const childBookmarks = await this.queryBookmarks({
                        prop: 'parentId',
                        operator: 'eq',
                        value: bookmark.id
                    });

                    // 递归处理所有子项
                    for (const child of childBookmarks) {
                        await processBookmarkRecursively(child);
                    }
                }
                return bookmark;
            };

            // 先递归收集所有需要删除的书签
            const allBookmarksToDelete = [];
            for (const bookmark of bookmarks) {
                const processed = await processBookmarkRecursively(bookmark);
                allBookmarksToDelete.push(processed);
            }

            // 分批处理删除操作
            const BATCH_SIZE = 50; // 可以根据实际情况调整批次大小
            for (let i = 0; i < allBookmarksToDelete.length; i += BATCH_SIZE) {
                const batch = allBookmarksToDelete.slice(i, i + BATCH_SIZE);
                await processBatch(batch);
            }

            console.log('所有书签删除操作完成');

        } catch (error) {
            console.error('书签删除过程中发生错误:', error);
        }
    },
    queryBookmarks: function (queryDto) {
        return this.initDatabase().then(() => {
            return new Promise((resolve, reject) => {
                const {prop, operator, value, limit = -1} = queryDto;
                // 根据不同的匹配规则进行查询
                const transaction = this.db.transaction([this.storeName], "readonly");
                const objectStore = transaction.objectStore(this.storeName);

                const request = objectStore.openCursor();
                const results = [];
                let count = 0;
                request.onsuccess = event => {
                    const cursor = event.target.result;
                    if (limit != -1 && count >= limit) {
                        resolve(results);
                    } else if (cursor) {
                        if (operator === "like" && prop ==="all") {
                            const props = ["title","url","tags","treeName","metaTitle","metaKeywords","metaDescription","metaTags"];
                            for (let pro of props) {
                                if (pro == "tags" && cursor.value[pro] && cursor.value[pro].join(',').indexOf(value)>-1) {
                                    results.push(cursor.value);
                                }else if (cursor.value[pro] && cursor.value[pro].indexOf(value)>-1 ) {
                                    results.push(cursor.value);
                                }
                            }
                        }else if (operator === "like") {
                            if (cursor.value[prop] && cursor.value[prop].indexOf(value)>-1 ) {
                                results.push(cursor.value);
                            }
                        } else if (prop == 'status' && cursor.value.type == 'folder') {
                        } else if (prop == 'url') {
                            let dburl = cursor.value[prop]?cursor.value[prop].replace(/(http|https):\/\//g, ''):"";
                            let queryurl = value.replace(/(http|https):\/\//g, '');
                            dburl == queryurl && results.push(cursor.value);
                        } else {
                            switch (operator) {
                                case 'eq':
                                    cursor.value[prop] === value && results.push(cursor.value);
                                    break;
                                case 'gt':
                                    cursor.value[prop] >= value && results.push(cursor.value);
                                    break;
                                case 'lt':
                                    cursor.value[prop] <= value && results.push(cursor.value);
                                    break;
                                case 'in':
                                    value.includes(cursor.value[prop]) && cursor.value.type=='bookmark' && results.push(cursor.value);
                                    break;
                            }
                        }
                        cursor.continue();
                    } else {
                        console.log(`搜索完成，找到 ${results.length} 个结果-查询条件`,queryDto);
                        let datas = [...new Set(results)];
                        if(prop == 'status' && value == -3){
                            console.log("重复书签排序")
                            datas = datas.toSorted((a, b) => {
                                let aurl = a.url?a.url.replace(/(http|https):\/\//g, ''):"";
                                let burl =  b.url?b.url.replace(/(http|https):\/\//g, ''):"";
                                return aurl.localeCompare(burl);
                            });
                        }else{
                            datas = datas.toSorted((a, b) => a.index - b.index);
                        }
                        resolve(datas);
                    }
                };

                request.onerror = event => {
                    console.error("搜索书签时发生错误", event);
                    reject(event);
                };
            });
        });
    }

};


export default  BookmarkManager;
