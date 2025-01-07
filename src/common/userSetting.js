import Constant from './constant.js';

/**
 * 包含字段
 * crawlQueueLength:爬取队列长度
 * crawlStatus: 爬取状态,空为所有，多个状态使用","分割
 * provider: llm厂商
 * providerkey: llm 密钥
 * @type {{getConfig: (function(): Promise<{[p: string]: any}>), setConfig: userSetting.setConfig}}
 */
const UserSetting={
    getConfig: async function(){
        return await chrome.storage.sync.get([Constant.ENV.SYS_SAVE_CONFIG]).then((result) => {
            let data = result[Constant.ENV.SYS_SAVE_CONFIG];
            if(!data){
                data = {
                    provider:"google",
                    providerkey:"",
                    providerModel:"learnlm-1.5-pro-experimental",
                    promt:"# 任务描述:\n" +
                        "从提供的网站书签JSON数据中提取最具代表性的标签。\n" +
                        "\n" +
                        "# 输入格式:\n" +
                        "- 输入为包含网站详细信息的JSON对象\n" +
                        "- 重点关注title、metaTitle、metaKeywords、metaDescription字段\n" +
                        "\n" +
                        "# 输出要求:\n" +
                        "1. 仅输出JSON格式\n" +
                        "2. 格式为: {\"tags\": [\"标签1\", \"标签2\", ...]}\n" +
                        "3. 标签数量控制在5-7个\n" +
                        "4. 标签使用中文\n" +
                        "5. 标签不能重复\n" +
                        "6. 标签应具有代表性,能准确描述网站的核心功能/特点\n" +
                        "\n" +
                        "# 标签提取原则:\n" +
                        "1. 优先从title和metaTitle中提取核心词\n" +
                        "2. 参考metaKeywords中的高频关键词\n" +
                        "3. 结合metaDescription理解网站主要功能\n" +
                        "4. 去除无实质意义的修饰词\n" +
                        "5. 合并相似含义的标签\n" +
                        "6. 保留最具识别度的表述方式\n" +
                        "\n" +
                        "# 示例:\n" +
                        "输入\n" +
                        "```json\n" +
                        "[{\n" +
                        "    \"id\": \"1531\",\n" +
                        "    \"title\": \"猿圈\",\n" +
                        "    \"url\": \"http://www.oxcoder.com/\",\n" +
                        "    \"currentUrl\": \"https://www.oxcoder.com/\",\n" +
                        "    \"metaTitle\": \"猿圈-在线考试-在线面试-校招笔试系统-在线考试系统-线上视频面试-题库-命题服务-线上笔试-在线面试-show me bug-考试星-代码面试-在线笔试平台-技术能力评估\",\n" +
                        "    \"metaKeywords\": \"在线考试,在线面试,校招笔试系统,showmebug, show me bug, 在线笔试, 技术面试, 面试题库, 在线面试复盘, 代码面试, 编程面试, 程序员招聘, 技术招聘, 代码测评, 模拟面试, 技术评估神器, 在线架构绘图, 在线白板面试, 技术能力评估, 技术招聘工具, 测评供应商, 视频面试供应商, 视频面试平台, 在线笔试平台, coding interview, 在线面试工具, 实习生招聘, 校招面试题, 校招笔试题, 网上考试系统,在线考试系统,在线考试题库,在线面试,线上视频面试,远程面试,校招题库,校招笔试出题,校招命题服务,在线题库,牛客,鹰眼,赛码,考试星,在线答题系统,在线培训系统,在线学习平台,企业内训, 线上笔试, 华信高科, 问卷星, 融智云考, 小艺帮, 考试云, eduline\",\n" +
                        "    \"metaDescription\": \"国内领先的AI在线考试和AI在线面试一体化解决方案供应商。适用于企业、院校、事业单位进行校园招聘、社会招聘和在线培训等。支持程序员技术能力评估，帮助管理者识别团队技术强项弱点，帮助你的团队从技术上快速适应业务部门提出的技术要求。\",\n" +
                        "    \"metaTags\": \"\"\n" +
                        "}]\n" +
                        "```\n" +
                        "输出\n" +
                        "```json\n" +
                        "[{\n" +
                        "   \"id\":\"1531\"\n" +
                        "   \"tags\":[\"oxcoder\",\"猿圈\",\"在线面试\",\"在线学习\"]\n" +
                        "}]\n" +
                        "```",
                    crawlQueueLength:5,
                    crawlStatus:[-1,0]
                };
                this.setConfig(data);
            }else{
                data = JSON.parse(data);
            }

            if(!data.crawlStatus || !data.crawlStatus){

            }

            return data;
        });
    },
    setConfig: async function(data){
        await chrome.storage.sync.set({[Constant.ENV.SYS_SAVE_CONFIG]:JSON.stringify(data)});
    }
}

export default  UserSetting;
