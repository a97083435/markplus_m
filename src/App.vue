<template>
  <el-container>
    <el-header height="50px" style="width: 100%;display: flex;flex-direction: row;padding: 0px;">
      <div style="width: 300px;align-self: end;padding-bottom: 14px;">
        <el-space :size="25" v-if="setting.editModel" style="margin-left: 10px;">
          <!--          <el-badge :max="10000" :offset="[-5,0]" :value="statistics.total" title="书签总数" type="info">-->
          <!--            <el-button style="padding: 5px;" type="default"-->
          <!--                       @click="searchStatisticsBookmarks({prop: 'parentId',operator: 'eq',value: '1'})">-->
          <!--              <el-icon size="20px">-->
          <!--                <Collection/>-->
          <!--              </el-icon>-->
          <!--            </el-button>-->
          <!--          </el-badge>-->

          <el-badge :max="10000" :offset="[-5,0]" :value="statistics.pending" title="待采集" type="info"
                    v-if="statistics.pending>0">
            <el-button style="padding: 5px;" type="default"
                       @click="searchStatisticsBookmarks({prop: 'status',operator: 'eq',value: 0})">
              <el-icon size="20px">
                <Compass/>
              </el-icon>
            </el-button>
          </el-badge>

          <el-badge :max="10000" :offset="[-5,0]" :value="statistics.over" title="采集完成" type="success"
                    v-if="statistics.over>0">
            <el-button style="padding: 5px;" type="default"
                       @click="searchStatisticsBookmarks({prop: 'status',operator: 'in',value: [2,9]})">
              <el-icon size="20px">
                <CircleCheck/>
              </el-icon>
            </el-button>
          </el-badge>

          <el-badge :max="10000" :offset="[-5,0]" :value="statistics.same" title="重复书签" type="warning"
                    v-if="statistics.same>0">
            <el-button style="padding: 5px;" type="default"
                       @click="searchStatisticsBookmarks({prop: 'status',operator: 'eq',value: -3})">
              <el-icon size="20px">
                <DocumentCopy/>
              </el-icon>
            </el-button>
          </el-badge>

          <el-badge :max="10000" :offset="[-5,0]" :value="statistics.change" title="域名变化" type="warning"
                    v-if="statistics.change>0">
            <el-button style="padding: 5px;" type="default"
                       @click="searchStatisticsBookmarks({prop: 'status',operator: 'eq',value: -2})">
              <el-icon size="20px">
                <Warning/>
              </el-icon>
            </el-button>
          </el-badge>

          <el-badge :max="10000" :offset="[-5,0]" :value="statistics.error" title="异常书签数" type="danger"
                    v-if="statistics.error>0">
            <el-button style="padding: 5px;" type="default"
                       @click="searchStatisticsBookmarks({prop: 'status',operator: 'eq',value: -1})">
              <el-icon size="20px">
                <CircleClose/>
              </el-icon>
            </el-button>
          </el-badge>

        </el-space>
        <template v-if="!setting.editModel">
          <el-link href="https://github.com/mjm13/markplus_m" target="_blank" type="primary" style="margin-left: 20px;">
            <el-image fit="cover"
                      style="width: 32px; height: 32px"
                      src="src/assets/icons/icon48.png"
            />
            MarkPlus-M
          </el-link>
        </template>
      </div>
      <div style="width: calc(99% - 620px);align-self: center;padding-left: 20px;">
        <el-input v-model="searchQuery.value"
                  placeholder="搜索书签"
                  size="default"
                  style="width: 98%"
                  @keydown.enter="searchBookmarks">
          <template #prefix>
            <el-checkbox
                style="padding-left: 3px;border-right: 1px solid rgb(220, 223, 230);padding-right: 10px;"
                v-if="setting.editModel"
                @change="handleCheckAll"
            />
            <el-select
                v-model="searchQuery.prop"
                class="custom-select"
            >
              <el-option
                  v-for="item in searchQuery.options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </template>
          <template #suffix>
            <el-icon class="el-input__icon">
              <search/>
            </el-icon>
          </template>
        </el-input>
      </div>
      <el-space style="width: 120px;" size="small">

        <el-switch v-model="setting.editModel" @change="handleEditModelChange">
          <template #active-action>
            <span>E</span>
          </template>
          <template #inactive-action>
            <span>R</span>
          </template>
        </el-switch>

        <template v-if="setting.editModel">
          <el-button circle size="default" title="获取所有书签源数据" type="success" @click="crawlMeta"
                     v-if="setting.crawlStatus == '0'">
            <el-icon size="18">
              <Promotion/>
            </el-icon>
          </el-button>

          <el-button circle size="default" title="停止获取" type="danger" @click="stopCrawlMeta"
                     v-else-if="setting.crawlStatus == '1'">
            <el-icon size="18">
              <SwitchButton/>
            </el-icon>
          </el-button>

          <el-button circle size="default" title="用户配置" type="warning" @click="setting.showUserConfig=true">
            <el-icon size="18">
              <Setting/>
            </el-icon>
          </el-button>



          <el-popconfirm title="是否确定删除选中数据?" width="200px"
                         @confirm="removeAllCheck">
            <template #reference>
              <el-button circle size="default" title="删除选中书签" type="danger" >
                <el-icon size="18">
                  <Delete/>
                </el-icon>
              </el-button>
            </template>
          </el-popconfirm>
        </template>

        <template v-if="setting.debug">
          <el-button circle size="default" title="下载书签json" type="info" @click="downLoadBookmarks">
            <el-icon size="18">
              <Download/>
            </el-icon>
          </el-button>

          <el-upload
              :auto-upload="false"
              :on-change="handleFileUpload"
              :show-file-list="false"
              action="#"
          >
            <el-button circle size="default" title="上传书签json" type="success">
              <el-icon size="18">
                <Upload/>
              </el-icon>
            </el-button>
          </el-upload>
        </template>
      </el-space>
    </el-header>
    <el-container style="height: 90vh">
      <el-aside
          :style="{ width: '300px',borderRight:'3px solid var(--el-border-color)' }"
      >
        <el-scrollbar>
          <el-tree :data="treeData"
                   :expand-on-click-node="false"
                   default-expand-all
                   node-key="id"
                   @node-drag-end="moveBookMarkDir"
                   @node-click="queryByDir">
            <template #default="{ node, data }">
              <div class="bookmark-node">
                <el-icon class="folder-icon">
                  <Folder/>
                </el-icon>
                <span class="bookmark-title">{{ data.title }}</span>
                <el-tag
                    :round="true"
                    class="child-count-tag"
                    size="small"
                    title="子节点数量"
                    type="info"
                >
                  {{ data.childrenCount }}
                </el-tag>
              </div>
            </template>
          </el-tree>
        </el-scrollbar>
      </el-aside>
      <el-main style="padding-top: 10px;padding-bottom: 10px">
        <el-auto-resizer>
          <template #default="{ height, width }">
            <el-scrollbar style="border-radius: 4px;box-shadow: 0 2px 12px 0 #909399">
              <el-tree-v2 :data="bookmarks"
                          ref="bookmarkList"
                          :highlight-current="true"
                          :show-checkbox="setting.editModel"
                          :expand-on-click-node="false"
                          :height="height-10"
                          default-expand-all
                          node-key="id">
                <template #default="{ node, data }">
                  <el-row style="width: 97%">
                    <el-col :span="21">
                      <template v-if="data.type === 'folder'">
                        <el-icon style="margin-right: 20px;">
                          <Folder/>
                        </el-icon>
                        <el-tooltip
                            :raw-content="true"
                            placement="top"
                            trigger="click"
                        >
                          <template #content>
                            <template v-if="setting.debug">
                            id：{{ data.id }}<br/>
                            </template>
                            标题：{{ data.title }}<br/>
                            目录：{{ data.treeName }}<br/>
                            创建时间：{{ data.dateAddedTime }}
                          </template>
                          <el-text class="dir-text" @dblclick="queryByDir(data)">
                            {{ data.title }}
                          </el-text>
                        </el-tooltip>
                      </template>
                      <template v-else>
                        <img :src="getFaviconUrl(data.url)" style="height: 1em;width:1em;margin-right: 20px"/>
                        <el-tooltip
                            :raw-content="true"
                            placement="top"
                            trigger="click"
                        >
                          <template #content>
                            <template v-if="setting.debug">
                              id：{{ data.id }}<br/>
                              status：{{ data.status }}<br/>
                            </template>
                            目录：{{ data.treeName }}<br/>
                            标题：{{ data.title }}<br/>
                            地址：{{ data.url }}<br/>
                            当前地址：{{ data.currentUrl }}<br/>
                            源标题：{{ data.metaTitle }}<br/>
                            源描述：{{ data.metaDescription }}<br/>
                            源标签：{{ data.tags }}<br/>
                            创建时间：{{ data.dateAddedTime }}
                          </template>
                          <el-text class="bookmark-text" truncated @dblclick="openUrl(data)">
                            {{ data.title ? data.title : data.url }}
                          </el-text>
                        </el-tooltip>
                      </template>
                    </el-col>
                    <el-col :span="3">
                      <template v-if="setting.editModel">
                        <el-popconfirm title="是否确定删除?目录会删除所有数据!" width="300px"
                                       @confirm="removeBookmark(data)">
                          <template #reference>
                            <el-button class="iconBtn" title="删除" type="danger" text>
                              <el-icon>
                                <Delete/>
                              </el-icon>
                            </el-button>
                          </template>
                        </el-popconfirm>
                        <el-button class="iconBtn" title="编辑" type="primary" text @click="editBookmark(data)">
                          <el-icon>
                            <Edit/>
                          </el-icon>
                        </el-button>
                      </template>
                      <!--                        <template v-if="setting.editModel===false">-->
                      <!--                          <template v-if="data.status === 2 || data.status === 9">-->
                      <!--                            <el-icon color="#409efc" title="采集完成">-->
                      <!--                              <CircleCheck />-->
                      <!--                            </el-icon>-->
                      <!--                          </template>-->
                      <!--                          <template v-if="data.status === -1" >-->
                      <!--                            <el-icon color="#F56C6C" title="无法打开">-->
                      <!--                              <CircleClose />-->
                      <!--                            </el-icon>-->
                      <!--                          </template>-->
                      <!--                          <template v-if="data.status === -2" >-->
                      <!--                            <el-icon color="#ffc107" title="网址发生变化">-->
                      <!--                              <Warning />-->
                      <!--                            </el-icon>-->
                      <!--                          </template>-->
                      <!--                        </template>-->
                    </el-col>
                  </el-row>
                </template>

              </el-tree-v2>
            </el-scrollbar>
          </template>
        </el-auto-resizer>

        <el-badge :max="10000" :value="statistics.show" title="查询总数" type="info"
                  style="position: absolute;top: 95%;left: 97%;z-index: 1000">
          <template #content="{ value }">
            {{ value }}
          </template>
        </el-badge>
      </el-main>
    </el-container>
  </el-container>

  <el-dialog v-model="showBookmarkDailog" title="详情" width="500">
    <el-form :model="bookmark" label-width="auto">
      <el-form-item label="名称">
        <el-input v-model="bookmark.title"/>
      </el-form-item>
      <template v-if="bookmark.type === 'folder'">
        <el-form-item label="目录">
          <el-input v-model="bookmark.treeName" disabled/>
        </el-form-item>
      </template>
      <template v-if="bookmark.type === 'bookmark'">
        <el-form-item label="地址">
          <el-input v-model="bookmark.url"/>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
              v-model="bookmark.status"
          >
            <el-option
                v-for="item in bookmarkStatus"
                :key="item.value"
                :label="item.key"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-space :size="10" style="width: 600px;" wrap>
            <el-tag
                v-for="tag in bookmark.tags"
                :key="tag"
                :disable-transitions="false"
                closable
                @close="handleClose(tag)"
            >
              {{ tag }}
            </el-tag>
            <el-input
                v-if="inputVisible"
                ref="InputRef"
                v-model="inputValue"
                class="w-10"
                size="small"
                @blur="handleInputConfirm"
                @keyup.enter="handleInputConfirm"
            />
            <el-button v-else class="button-new-tag" size="small" @click="showInput">
              +标签
            </el-button>
          </el-space>
        </el-form-item>

        <el-form-item label="目录">
          <el-input v-model="bookmark.treeName" disabled/>
        </el-form-item>
        <el-form-item label="当前地址">
          <el-input v-model="bookmark.currentUrl" disabled/>
        </el-form-item>
        <el-form-item label="源标题">
          <el-input v-model="bookmark.metaTitle" disabled/>
        </el-form-item>
        <el-form-item label="源关键字">
          <el-input v-model="bookmark.metaKeywords" disabled/>
        </el-form-item>
        <el-form-item label="源描述">
          <el-input v-model="bookmark.metaDescription" autosize disabled type="textarea"/>
        </el-form-item>
      </template>
      <el-form-item label="添加时间">
        <el-input v-model="bookmark.dateAddedTime" disabled/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveBookmark">保存</el-button>
        <el-button @click="closeBookmarkDialog">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

  <el-drawer v-model="setting.showUserConfig" direction="rtl">
    <template #header>
      用户设置
    </template>
    <template #default>
      <el-form :model="userSetting" label-width="auto" label-position="top">
        <el-form-item label="扫描标签并发数" title="点击扫描时，同时扫描书签的个数">
          <el-slider
              v-model="userSetting.crawlQueueLength"
              :min="1"
              :max="30"
              :show-input="true"
          />
        </el-form-item>
        <el-form-item label="扫描状态" title="点击扫描时，扫描的书签状态">
          <el-select
              v-model="userSetting.crawlStatus"
              multiple
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="3"
              placeholder="Select"
          >
            <el-option
                v-for="item in bookmarkStatus"
                :key="item.value"
                :label="item.key"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Gemini总结网页标签" label-position="left">
          <el-switch v-model="userSetting.llmEnabled"/>
          <br/>
        </el-form-item>
        <el-card v-show="userSetting.llmEnabled">
          <el-form-item label="llm供应商" v-show="false">
            <el-input v-model="userSetting.provider"/>
          </el-form-item>
          <el-form-item label="Gemini密钥">
            <el-input v-model="userSetting.providerkey"/>
          </el-form-item>
          <el-form-item label="llm模型名称" v-show="false">
            <el-input v-model="userSetting.providerModel"/>
          </el-form-item>
          <el-form-item label="总结标签提示词">
            <el-input
                v-model="userSetting.promt"
                :rows="8"
                type="textarea"
                placeholder="请输入提示词"
            />
          </el-form-item>
        </el-card>
      </el-form>
    </template>
    <template #footer>
      <el-button type="primary" @click="saveUserSetting">保存</el-button>
      <el-button @click="setting.showUserConfig=false">关闭</el-button>
    </template>
  </el-drawer>
</template>

<script>
import Constant from './common/constant.js';
import {
  ElAside,
  ElButton,
  ElContainer,
  ElHeader,
  ElInput,
  ElLink,
  ElMain,
  ElMessage,
  ElTable,
  ElTableColumn,
  ElTree
} from 'element-plus';
import BookmarkManager from "./common/bookmarkManager.js";
import LLM from './common/llmutil.js';
import {nextTick, ref} from 'vue';
import Setting from "./common/userSetting.js";
import Util from "./common/utils.js";
import {Delete} from "@element-plus/icons-vue";
import UserSetting from "./common/userSetting.js";

const backgroundConn = chrome.runtime.connect({name: "index-background-connection"});
const InputRef = ref(null);

export default {
  name: 'App',
  components: {
    Delete,
    ElContainer,
    ElAside,
    ElHeader,
    ElMain,
    ElTable,
    ElTableColumn,
    ElTree,
    ElLink,
    ElInput,
    ElButton,
    ElMessage
  },
  data() {
    return {
      userSetting: {},
      setting: {
        debug: import.meta.env.VITE_SETTING_DEBUG=='true',
        editModel: import.meta.env.VITE_SETTING_EDITMODEL=='true',
        showUserConfig: false,
        crawlStatus: "0"
      },
      bookmarkStatus: [
        {key: "重复书签", value: -3},
        {key: "域名变化", value: -2},
        {key: "异常", value: -1},
        {key: "待扫描", value: 0},
        {key: "已扫描", value: 1},
        {key: "已总结", value: 9},
      ],
      treeData: [{
        id: 0,
        tiltle: "书签"
      }],
      statistics: {
        selectStatus: [],
        total: 0,
        error: 0,
        over: 0,
        pending: 0,
        change: 0,
        show: 0
      },
      bookmarks: [],
      searchQuery: {
        prop: "all",
        value: "",
        options: [{
          value: 'all',
          label: '全部'
        }, {
          value: 'tags',
          label: '标签'
        }, {
          value: 'title',
          label: '标题'
        }, {
          value: 'metaTitle',
          label: '源标题'
        }, {
          value: 'metaKeywords',
          label: '源关键词'
        }, {
          value: 'metaDescription',
          label: '源描述'
        }, {
          value: 'url',
          label: '网址'
        }],
      },
      showBookmarkDailog: false,
      inputVisible: false,
      inputValue: '',
      bookmark: {},
      originalBookmark: {}
    };
  },
  methods: {
    handleClose(tag) {
      this.bookmark.tags.splice(this.bookmark.tags.indexOf(tag), 1)
    },
    showInput() {
      this.inputVisible = true;
      nextTick(() => {
        if (this.$refs.InputRef) {
          this.$refs.InputRef.input.focus(); // 调用 InputRef 并聚焦
        }
      })
    },
    handleInputConfirm() {
      if (!Array.isArray(this.bookmark.tags)) {
        this.bookmark.tags = [];
      }
      if (this.inputValue) {
        this.bookmark.tags.push(this.inputValue)
      }
      this.inputVisible = false
      this.inputValue = ''
    },
    saveUserSetting() {
      Setting.setSysConfig(this.userSetting);
      LLM.clear();
      ElMessage({
        message: '修改用户配置成功!',
        type: 'success',
      });
      this.setting.showUserConfig = false;
    },
    saveBookmark() {
      const _this = this;
      if (!_this.bookmark.tags) {
        _this.bookmark.tags = [];
      }
      if (_this.bookmark.title != _this.originalBookmark.title
          || _this.bookmark.url != _this.originalBookmark.url) {
        _this.bookmark.syncChrome = false;
      }
      BookmarkManager.saveBookmarks([_this.bookmark]).then(() => {
        ElMessage({
          message: '保存成功!',
          type: 'success',
        })
        _this.reloadBookmarkPage();
        _this.showBookmarkDailog = false;
        _this.bookmark = {};
        _this.originalBookmark = {};
      })
    },
    editBookmark(data) {
      this.bookmark = {...data};
      this.originalBookmark = {...data}
      this.showBookmarkDailog = true;
    },
    closeBookmarkDialog() {
      this.showBookmarkDailog = false;
    },
    getFaviconUrl(siteUrl) {
      const url = new URL(chrome.runtime.getURL("/_favicon/"));
      url.searchParams.set("pageUrl", siteUrl);
      url.searchParams.set("size", "16");
      return url.toString();
    },
    moveBookMarkDir(draggingNode, dropNode, dropType, ev) {
      //共四个参数，依次为：被拖拽节点对应的 Node、结束拖拽时最后进入的节点（可能为空）、被拖拽节点的放置位置（before、after、inner）、event
      //dropNode.parent.data  父节点
      //dropNode.data  当前节点
      let bookmarks = [];
      let result = [];
      let bookmark = draggingNode.data;
      bookmark.syncChrome = false;
      bookmark.move = true;
      if (dropType == 'inner') {
        bookmark.parentId = dropNode.data.id;
        bookmark.index = 0;
        bookmarks = dropNode.data.children;
      } else if (dropType == 'before') {
        bookmark.parentId = dropNode.data.parentId;
        bookmark.index = dropNode.data.index - 1;
        bookmarks = dropNode.parent.data.children;
      } else if (dropType == 'after') {
        bookmark.parentId = dropNode.data.parentId;
        bookmark.index = dropNode.data.index + 1;
      }
      if (bookmark.index < 0) {
        bookmark.index = 0;

        for (let i = 0; i < bookmarks.length; i++) {
          if (bookmarks[i].type == "folder") {
            bookmarks[i].index = bookmarks[i].index + 1;
            bookmarks[i].syncChrome = false;
            bookmarks[i].move = true;
            result.push(bookmarks[i]);
          }
        }
      }
      result.push(bookmark);
      BookmarkManager.saveBookmarks(result);
    },
    queryByDir(data) {
      backgroundConn.postMessage({
        action: Constant.PAGE_EVENT.QUERY_BOOKMARKS,
        prop: 'parentId',
        operator: 'eq',
        value: data.id
      });
    },
    crawlMeta() {
      const _this = this;
      Setting.getSysConfig().then(config => {
        if (config.llmEnabled && Util.hasEmptyProperty(config)) {
          ElMessage({
            message: '请先配置用户参数!',
            type: 'error',
          });
          return;
        }
        _this.setting.crawlStatus = "1";
        backgroundConn.postMessage({
          action: Constant.PAGE_EVENT.CRAWL_META,
          prop: 'type',
          operator: 'eq',
          value: 'bookmark'
        });
      })

    },
    stopCrawlMeta() {
      this.setting.crawlStatus = "0";
      backgroundConn.postMessage({
        action: Constant.PAGE_EVENT.STOP_CRAWL_META
      });
    },
    searchBookmarks() {
      let _this = this;
      _this.statistics.selectStatus = [];
      backgroundConn.postMessage({
        action: Constant.PAGE_EVENT.QUERY_BOOKMARKS,
        prop: _this.searchQuery.prop,
        operator: 'like',
        value: _this.searchQuery.value
      });
    },
    searchStatisticsBookmarks(param) {
      let status = [];
      status.push(param.value);
      this.statistics.selectStatus = status;
      backgroundConn.postMessage({action: Constant.PAGE_EVENT.QUERY_BOOKMARKS, ...param});
    },
    downLoadBookmarks() {
      backgroundConn.postMessage({
        action: Constant.PAGE_EVENT.DOWNLOAD_BOOKMARKS,
        prop: 'id',
        operator: 'gt',
        value: -1
      });
    },
    handleFileUpload(file) {
      const _this = this;
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const bookmarks = JSON.parse(e.target.result);
          BookmarkManager.saveBookmarks(bookmarks).then(() => {
            _this.reloadBookmarkPage();
            ElMessage({
              message: '上传成功!',
              type: 'success',
            });
          })
        } catch (error) {
          console.error('Error parsing JSON: ', error);
          ElMessage({
            message: '解析书签失败!',
            type: 'error',
          });
        }
      }
      reader.readAsText(file.raw)
    },
    handleEditModelChange(value){
      Util.setLocalStorageItem(Constant.ENV.SYS_PAGE_CONFIG,value);
    },
    reloadBookmarkPage() {
      // backgroundConn.postMessage({
      //   action: Constant.PAGE_EVENT.QUERY_FOLDER,
      //   prop: 'type',
      //   operator: 'eq',
      //   value: 'folder'
      // });
      backgroundConn.postMessage({
        action: Constant.PAGE_EVENT.QUERY_BOOKMARKS,
        prop: 'parentId',
        operator: 'eq',
        value: '1'
      });
      backgroundConn.postMessage({
        action: Constant.PAGE_EVENT.STATISTICS_TOTAL,
        prop: 'id',
        operator: 'gt',
        value: '0'
      });
    },
    handleCheckAll(val) {
      let _this = this;
      if (val) {
        this.$refs.bookmarkList.setCheckedKeys(_this.bookmarks.map(data => data.id))
      } else {
        this.$refs.bookmarkList.setCheckedKeys([])
      }
    },
    removeBookmark(data) {
      const _this = this;
      BookmarkManager.deleteBookmarks([{...data, syncChrome: false}]).then(() => {
        ElMessage({
          message: '删除成功!',
          type: 'success',
        });
        _this.reloadBookmarkPage();
      })
    },
    removeAllCheck() {
      const _this = this;
      let datas = _this.$refs.bookmarkList.getCheckedNodes();
      if(datas && datas.length > 0){
        BookmarkManager.deleteBookmarks(datas).then(() => {
          ElMessage({
            message: '删除成功!',
            type: 'success',
          });
          _this.reloadBookmarkPage();
        })
      }else{
        ElMessage({
          message: '请选择!',
          type: 'error',
        });
      }

    },
    openUrl(data) {
      window.open(data.url, '_blank');
    }
  },
  mounted() {
    const _this = this;
    Setting.getSysConfig().then(config => {
      _this.userSetting = config;
      console.log("读取配置完成")
    });
    Util.getLocalStorageItem(Constant.ENV.SYS_PAGE_CONFIG).then(config => {
      _this.setting.editModel = config;
    })
    Util.getLocalStorageItem(Constant.ENV.SYS_CRAWL_STATUS).then(config => {
      if (config == undefined) {
        config = "0";
        Util.setLocalStorageItem(Constant.ENV.SYS_CRAWL_STATUS,"0");
      }
      _this.setting.crawlStatus = config;
    })
    backgroundConn.onMessage.addListener(async function (result) {
      // 使用 `_this` 代替 `this`
      if (result.action === Constant.PAGE_EVENT.QUERY_FOLDER) {
        _this.treeData = result.datas;
      } else if (result.action === Constant.PAGE_EVENT.QUERY_BOOKMARKS) {
        _this.bookmarks = result.datas;
        if (_this.setting.editModel) {
          var selectIds = [];
          if (_this.statistics.selectStatus.includes(-3)) {
            let map = {};
            for (let bm of _this.bookmarks) {
              let url =  bm.url?bm.url.replace(/(http|https):\/\//g, ''):"";
              if (map[url]) {
                selectIds.push(bm.id);
              } else {
                map[url] = bm.id;
              }
            }
          }else if(_this.statistics.selectStatus.includes(-1)){
            selectIds = _this.bookmarks.map(data => data.id);
          }
          setTimeout(() => {
            if(selectIds){
              _this.$refs.bookmarkList.setCheckedKeys(selectIds);
            }
          }, 50)

        }
        _this.statistics.show = result.datas.length;
      } else if (result.action === Constant.PAGE_EVENT.ALERT_MSG) {
        ElMessage({
          message: result.msg,
          type: 'error',
        });
      } else if (result.action === Constant.PAGE_EVENT.DOWNLOAD_BOOKMARKS) {
        let newJsonString = JSON.stringify(result.datas, null, 2);
        // 创建 Blob 对象
        var blob = new Blob([newJsonString], {type: 'application/json'});
        // 创建下载链接
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'data.json';
        a.click();
      } else if (result.action === Constant.PAGE_EVENT.SAVE_TO_D1) {
        LLM.summarizeTags(JSON.stringify(result.datas[0]));
      } else if (result.action === Constant.PAGE_EVENT.STATISTICS_TOTAL) {
        const { datas } = result;
        const stat = {
          total: datas.length,
          error: 0,
          same: 0,
          over: 0,
          change: 0,
          pending: 0
        };
        let treeData = [];
        let map =  datas.reduce((acc, data) => {
          acc[data.id] = data;
          if (data.type === 'folder') {
            data.childrenCount = 0;
            treeData.push(data);
          }
          return acc;
        }, {});
        for (const data of datas) {
          map[data.id] = data;
          if (map[data.parentId] != null) {
            map[data.parentId].childrenCount += 1;
          }
          if (data.type === 'folder'){
            continue;
          }
          switch (data.status) {
            case -1: stat.error++; break;
            case 2:
            case 9: stat.over++; break;
            case -2: stat.change++; break;
            case -3: stat.same++; break;
            case 0:
              if(data.url && data.url.startsWith('http')){
                console.log(data);
                stat.pending++;
              }
              break;
          }
        }
        _this.statistics = { ..._this.statistics, ...stat }
        _this.treeData = Util.getRootTree(treeData);
      }
    });

    _this.reloadBookmarkPage();
  }
};
</script>
<style>
.el-popper.is-dark {
  max-width: 80%;
}
</style>
<style scoped>
.custom-select {
  width: 100px;
  border-right: 1px #DCDFE6FF solid;
}

.custom-select :deep(.el-select__wrapper) {
  box-shadow: none !important;
  min-height: 28px !important;
}

.bookmark-node {
  display: flex;
  align-items: center;
  font-size: 13px;
}

.iconBtn {
  --el-button-size: 15px;
  padding: 2px;
}

.dir-text, .bookmark-text {
  display: inline-block;
  color: initial; /* 初始颜色 */
  text-decoration: none; /* 无下划线 */
  width: 90%;
}

.bookmark-text:hover {
  color: #409EFF; /* 悬浮时的颜色 */
  text-decoration: underline; /* 悬浮时的下划线 */
  width: 90%;
}

.folder-icon {
  margin-right: 4px;
  color: #757575;
}

.bookmark-title {
  color: #333;
  margin-right: 6px;
}

.child-count-tag {
  font-size: 10px;
  height: 16px;
  line-height: 16px;
  padding: 0 4px;
}

</style>
