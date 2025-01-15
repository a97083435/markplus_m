import UserSetting from './userSetting.js';
import BookmarkManager from './bookmarkManager.js';
import {GoogleGenerativeAI,} from "@google/generative-ai";

const LLM = {
    queue: [],
    processing: false,
    timer: null,
    batchSize: 5,  // 每批处理的数量
    scanInterval: 1000,  // 批次间延迟（毫秒）
    insufficientCount: 0,
    config:null,
    model: null,
    clear: function(){
        this.model = null;
        this.timer = null;
        this.config = null;
        this.insufficientCount = 0;
        this.queue = [];
    },
    init: async function () {
        if (this.model) {
            return this;
        }
        this.config = await UserSetting.getSysConfig();
        this.batchSize = this.config.crawlQueueLength;
        const genAI = new GoogleGenerativeAI(this.config.providerkey);
        this.model = genAI.getGenerativeModel({
            model: this.config.providerModel,
            systemInstruction: this.config.promt,
            generationConfig:{
                temperature: 1,
                topP: 0.95,
                topK: 64,
                maxOutputTokens: 8192,
                responseMimeType: "application/json"
            }
        });
        if (this.config.llmEnabled) {
            this.startQueueScanner();
        }
        return this;
    },
    startQueueScanner: function () {
        if (this.timer) {
            clearInterval(this.timer);
        }

        this.timer = setInterval(async () => {
            await this.processQueue();
        }, this.scanInterval);

        console.log("队列扫描器已启动");
    },
    processQueue: async function () {
        // 如果正在处理或队列为空，则跳过
        if (this.processing || this.queue.length === 0) {
            this.insufficientCount = 0;  // 重置计数
            return;
        }

        // 检查队列长度和处理条件
        if (this.queue.length >= this.batchSize) {
            this.insufficientCount = 0;  // 重置计数
            this.processing = true;
            try {
                const batchToProcess = this.queue.splice(0, this.batchSize);
                await this.summarizeTagsBatch(batchToProcess);
                console.log(`处理完成一批数据，剩余队列长度: ${this.queue.length}`);
            } catch (error) {
                console.error('处理队列出错:', error);
            } finally {
                this.processing = false;
            }
        } else if (this.queue.length > 0) {
            // 队列长度不足 batchSize
            this.insufficientCount++;
            // console.log(`队列长度不足 ${this.batchSize}，当前计数：${this.insufficientCount}`);
            // 如果连续N次扫描都不足，处理所有剩余数据
            if (this.insufficientCount >= this.batchSize*3) {
                this.processing = true;
                try {
                    const remainingBookmarks = this.queue.splice(0, this.queue.length);
                    // console.log(`处理剩余 ${remainingBookmarks.length} 条数据`);
                    await this.summarizeTagsBatch(remainingBookmarks);
                    this.insufficientCount = 0;  // 重置计数
                } catch (error) {
                    console.error('处理剩余数据出错:', error);
                } finally {
                    this.processing = false;
                }
            }
        }
    },
    addSummarizeQueue: async function (bookmark) {
        if (this.config.llmEnabled) {
            this.queue.push(bookmark);
        }
    },
    summarizeTagsBatch: async function (input) {
        const chatSession = this.model.startChat({
                history: [],
            });
        console.log("发送数据:", input);
        const result = await chatSession.sendMessage(JSON.stringify(input));
        console.log("总结数据:", result.response.candidates[0].content.parts[0].text)
        const datas = JSON.parse(result.response.candidates[0].content.parts[0].text);

        const map = new Map(datas.map(item => [item.id, item]));
        for (let data of input) {
            let temp = map.get(data.id);
            data.tags = temp['tags'];
            if(data.status == -3){
                continue;
            }else if (data.tags) {
                data.status = 9;
            } else {
                console.log("未获取到总结", bookmark)
            }
        }
        BookmarkManager.saveBookmarks(input);
    }
}

export default LLM;


// 输出路径  result.response.candidates[0].content.parts[1]
// 输出内容 {
//     "text": "```json\n{\n   \"tags\":[\"segmentfault.com\",\"Code Review\",\"思否\"]\n}\n```"
// }
