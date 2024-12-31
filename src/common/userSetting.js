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
    getConfig: function(){
        return chrome.storage.sync.get([Constant.USER_CONFIG]).then((result) => {
            let data = result[Constant.USER_CONFIG];
            if(!data){
                data = {
                    crawlQueueLength:10,
                    crawlStatus:"0,-1"
                };
            }
            return data;
        });
    },
    setConfig: function(data){
        chrome.storage.sync.set({[Constant.USER_CONFIG]:data});
    }
}

export default  UserSetting;
