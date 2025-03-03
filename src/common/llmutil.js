import UserSetting from './userSetting.js';
import BookmarkManager from './bookmarkManager.js';
import {GoogleGenerativeAI,} from "@google/generative-ai";
import LLM from "@themaximalist/llm.js";

const LLM_M = {
    queue: [],
    processing: false,
    timer: null,
    scanInterval: 1000,  // 批次间延迟（毫秒）
    insufficientCount: 0,
    config:null,
    model: null,
    clear: function(){
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.model = null;
        this.config = null;
        this.insufficientCount = 0;
        this.queue = [];
        this.init();
    },
    init: async function () {
        if (this.model) {
            return this;
        }
        this.config = await UserSetting.getSysConfig();

        this.model = new LLM();
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
        this.config = await UserSetting.getSysConfig();
        // 检查队列长度和处理条件
        if (this.queue.length >= this.config.maxSummarizeTags) {
            this.insufficientCount = 0;  // 重置计数
            this.processing = true;
            try {
                const batchToProcess = this.queue.splice(0, this.config.maxSummarizeTags);
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
            if (this.insufficientCount >= 20) {
                this.processing = true;
                try {
                    let length = this.queue.length > this.config.maxSummarizeTags ? this.config.maxSummarizeTags : this.queue.length;
                    const remainingBookmarks = this.queue.splice(0, length);
                    console.log(`处理剩余 ${remainingBookmarks.length} 条数据`);
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
    summarizeTags:async function(input){
        let result;
        try {
            this.config = await UserSetting.getSysConfig();
            this.model = new LLM();
            this.model.system(this.config.promt);
            result = await this.model.chat(input,
                {
                    service: this.config.provider,
                    model: this.config.providerModel,
                    apikey:this.config.providerkey,
                    parser: LLM.parsers.json
                });
            result = JSON.stringify(result, null, 2);
            console.log("发送数据:", input);
            console.log("总结数据:", result);
            return result
        } catch (error) {
            return error.toString();
        }
    },
    summarizeTagsBatch: async function (input) {
        let result, resultText, temp;
        let datas = [];
        try {
            // const chatSession = this.model.startChat({
            //     history: [],
            // });
            console.log("发送数据:", input);
            // result = await chatSession.sendMessage(JSON.stringify(input));
            // resultText = result?.response?.candidates[0]?.content?.parts?.[0]?.text;
            // console.log("总结数据:", resultText);

            this.model = new LLM();
            this.model.system(this.config.promt);
            result = await this.model.chat(input,
                {
                    service: this.config.provider,
                    model: this.config.providerModel,
                    apikey:this.config.providerkey,
                    parser: LLM.parsers.json
                });
            console.log("总结数据:", result);
            if (result) {
                if (!Array.isArray(result)) {
                    datas.push(result);
                } else {
                    datas = result;
                }
                const map = new Map(datas.map(item => [item.id, item]));
                for (let data of input) {
                    let temp = map.get(data.id);
                    data.tags = temp['tags'];
                    if (data.status == -3) {
                        continue;
                    }else if (data.status == 404) {
                        continue;
                    } else if (data.tags) {
                        data.status = 9;
                    } else {
                        console.log("未获取到总结", data)
                    }
                }
                BookmarkManager.saveBookmarks(input);
            } else {
                console.log("未获取到总结", input)
            }
        } catch (error) {
            console.warn("总结异常:", error, "result:", result, "resultText:", resultText, "datas:", datas, "temp:", temp);
        }
    }
}

export default LLM_M;


// 输出路径  result.response.candidates[0].content.parts[1]
// 输出内容 {
//     "text": "```json\n{\n   \"tags\":[\"segmentfault.com\",\"Code Review\",\"思否\"]\n}\n```"
// }
