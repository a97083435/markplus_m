[使用 CRXJS、Vite、TypeScript、Vue3、Pinia、Less、Naive-ui 开发 Chrome 浏览器插件——自带热加载，无需手动配置 - 掘金](https://juejin.cn/post/7330227149177028617)

dexie  indexedDB操作工具，替换chrome操作
# 书签扩展

- [x] 存储书签数据至indexedDB
- [x] 页面操作和background.js通信，将书签存储保存至background上下文
- [x] 左侧树展示目录
- [x] 右侧书签展示，查询功能
- [x] 扩展原始书签数据，访问网址并获取head中参数用于增强查询
- [x] 基础统计
- [x] 自动访问书签并获取扩展数据
- [x] 基于统计做快捷查询
- [ ] 增加书签和indexedDB同步，避免脏数据 
- [ ] 重复书签清理，通过爬取功能可获得url对应书签数量可单独存储
- [ ] 书签移动，创建文件夹，删除书签
- [ ] 异常书签判断(重复书签,失效书签,域名变化,需要登陆)
- [ ] 书签统计分析

BUG
- [ ] 如何判断打开页面发生跳转/正常响应但页面为404
- [ ] {"tags": ["透明创业", "实验", "被动收入", "机灵", "普通人"]} 提示词优化
- [ ] 首页打开后tab不唯一，
- [ ] 高并发访问导致ai接口调用失败
  llm总结标签异常: GoogleGenerativeAIFetchError: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/learnlm-1.5-pro-experimental:generateContent: [429 ] Resource has been exhausted (e.g. check quota).
  at handleResponseNotOk (@google_generative-ai.js?v=39d289e3:216:9)
  at async makeRequest (@google_generative-ai.js?v=39d289e3:192:5)
  at async generateContent (@google_generative-ai.js?v=39d289e3:524:20)
  at async ChatSession.sendMessage (@google_generative-ai.js?v=39d289e3:760:5)
  at async llmutil.js:34:28
  at async summarizeTagsByLLm (service-worker.js:241:22)

llm总结标签异常: GoogleGenerativeAIResponseError: [GoogleGenerativeAI Error]: Candidate was blocked due to SAFETY
at response.text (@google_generative-ai.js?v=39d289e3:241:15)
at llmutil.js:35:41
at async summarizeTagsByLLm (service-worker.js:241:22)