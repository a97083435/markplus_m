<template>
  <el-container>
    <el-header height="50px" style="width: 100%;display: flex;flex-direction: row;padding: 0px;">
      <div style="width: 300px;align-self: end;padding-bottom: 14px;">
        <template v-if="setting.editModel">
          <div style="display: flex;width: 95%;flex-wrap: wrap;justify-content: space-between;">
            <el-badge v-if="setting.debug" :max="10000" :offset="[-5,0]" :value="statistics.total" :title="t('statistics.total')" type="info">
              <el-button style="padding: 5px;" type="default"
                         @click="searchStatisticsBookmarks({prop: 'parentId',operator: 'eq',value: '1'})">
                <el-icon size="20px">
                  <Collection/>
                </el-icon>
              </el-button>
            </el-badge>

            <el-button  style="padding: 5px;" type="default" :title="t('statistics.undo')"
                       @click="searchStatisticsBookmarks({prop: 'status',operator: 'eq',value: -99})">
              <el-icon size="20px">
                <MuteNotification/>
              </el-icon>
            </el-button>

          <el-badge :max="10000" :offset="[-5,0]" :value="statistics.pending" :title="t('statistics.pending')" type="info"
                    v-if="statistics.pending>0">
            <el-button style="padding: 5px;" type="default"
                       @click="searchStatisticsBookmarks({prop: 'status',operator: 'eq',value: 0})">
              <el-icon size="20px">
                <Compass/>
              </el-icon>
            </el-button>
          </el-badge>

          <el-badge :max="10000" :offset="[-5,0]" :value="statistics.over" :title="t('statistics.over')" type="success"
                    v-if="statistics.over>0">
            <el-button style="padding: 5px;" type="default"
                       @click="searchStatisticsBookmarks({prop: 'status',operator: 'in',value: [2,9]})">
              <el-icon size="20px">
                <CircleCheck/>
              </el-icon>
            </el-button>
          </el-badge>

          <el-badge :max="10000" :offset="[-5,0]" :value="statistics.same" :title="t('statistics.same')" type="warning"
                    v-if="statistics.same>0">
            <el-button style="padding: 5px;" type="default"
                       @click="searchStatisticsBookmarks({prop: 'status',operator: 'eq',value: -3})">
              <el-icon size="20px">
                <DocumentCopy/>
              </el-icon>
            </el-button>
          </el-badge>

          <el-badge :max="10000" :offset="[-5,0]" :value="statistics.change" :title="t('statistics.change')" type="warning"
                    v-if="statistics.change>0">
            <el-button style="padding: 5px;" type="default"
                       @click="searchStatisticsBookmarks({prop: 'status',operator: 'eq',value: -2})">
              <el-icon size="20px">
                <Warning/>
              </el-icon>
            </el-button>
          </el-badge>

          <el-badge :max="10000" :offset="[-5,0]" :value="statistics.error" :title="t('statistics.error')" type="danger"
                    v-if="statistics.error>0">
            <el-button style="padding: 5px;" type="default"
                       @click="searchStatisticsBookmarks({prop: 'status',operator: 'eq',value: -1})">
              <el-icon size="20px">
                <CircleClose/>
              </el-icon>
            </el-button>
          </el-badge>
          </div>
        </template>
        <template v-else-if="!setting.editModel">
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
          <el-button circle size="default" :title="t('btn.crawlMeta')" type="success" @click="crawlMeta"
                     v-if="setting.crawlStatus == '0'">
            <el-icon size="18">
              <Promotion/>
            </el-icon>
          </el-button>

          <el-button circle size="default" :title="t('btn.stopCrawlMeta')" type="danger" @click="stopCrawlMeta"
                     v-else-if="setting.crawlStatus == '1'">
            <el-icon size="18">
              <SwitchButton/>
            </el-icon>
          </el-button>

          <el-button circle size="default" :title="t('btn.userConfig')" type="warning" @click="setting.showUserConfig=true">
            <el-icon size="18">
              <Setting/>
            </el-icon>
          </el-button>


          <el-button circle size="default" :title="t('btn.showBookmarkStatus')" type="primary" @click="showBookmarkStatus">
            <el-icon size="18">
              <Edit/>
            </el-icon>
          </el-button>

          <el-popconfirm :title="t('confirm.deleteAll')"  width="200px"
                         @confirm="removeAllCheck">
            <template #reference>
              <el-button circle size="default" :title="t('btn.delSelect')" type="danger" >
                <el-icon size="18">
                  <Delete/>
                </el-icon>
              </el-button>
            </template>
          </el-popconfirm>

          <el-popconfirm :title="t('confirm.reloadBookMark')" width="200px"
                         @confirm="reloadBookMark">
            <template #reference>
              <el-button circle size="default" :title="t('btn.reloadBookMark')" type="danger" >
                <el-icon size="18">
                  <Connection />
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
                  <el-row style="width: 99%">
                    <el-col :span="18">
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
                            {{ t('bookmark.title') }}：{{ data.title }}<br/>
                            {{ t('bookmark.treeName') }}：{{ data.treeName }}<br/>
                            {{ t('bookmark.dateAddedTime') }}：{{ data.dateAddedTime }}
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
                            {{ t('bookmark.treeName') }}：{{ data.treeName }}<br/>
                            {{ t('bookmark.title') }}：{{ data.title }}<br/>
                            {{ t('bookmark.url') }}：{{ data.url }}<br/>
                            {{ t('bookmark.currentUrl') }}：{{ data.currentUrl }}<br/>
                            {{ t('bookmark.metaTitle') }}：{{ data.metaTitle }}<br/>
                            {{ t('bookmark.metaDescription') }}：{{ data.metaDescription }}<br/>
                            {{ t('bookmark.tags') }}：{{ data.tags }}<br/>
                            {{ t('bookmark.dateAddedTime') }}：{{ data.dateAddedTime }}
                          </template>
                          <el-text class="bookmark-text" truncated @dblclick="openUrl(data)">
                            {{ data.title ? data.title.slice(0, 110) : data.url }}
                          </el-text>
                        </el-tooltip>
                      </template>
                    </el-col>
                    <el-col :span="3">
                      <template v-if="data.type === 'bookmark'">
                        <template v-if="data.status === 2">
                          <el-icon color="#409efc" :title="t('bookmark.status_show.2')">
                            <CircleCheck/>
                          </el-icon>
                        </template>
                        <template v-else-if="data.status === -99">
                          <el-icon :title="t('bookmark.status_show.-99')">
                            <MuteNotification/>
                          </el-icon>
                        </template>
                        <template v-else-if="data.status === 0">
                          <el-icon :title="t('bookmark.status_show.0')">
                            <Compass/>
                          </el-icon>
                        </template>
                        <template v-else-if="data.status === 9">
                          <el-icon color="#67c23a" :title="t('bookmark.status_show.9')">
                            <CollectionTag/>
                          </el-icon>
                        </template>
                        <template v-else-if="data.status === -1">
                          <el-icon color="#F56C6C" :title="t('bookmark.status_show.-1')">
                            <CircleClose/>
                          </el-icon>
                        </template>
                        <template v-else-if="data.status === -2">
                          <el-icon color="#ffc107" :title="t('bookmark.status_show.-2')">
                            <Warning/>
                          </el-icon>
                        </template>
                        <template v-else-if="data.status === -3">
                          <el-icon color="#ffc107" :title="t('bookmark.status_show.-3')">
                            <DocumentCopy/>
                          </el-icon>
                        </template>
                      </template>
                    </el-col>
                    <el-col :span="3">
                      <template v-if="setting.editModel">
                        <el-popconfirm :title="t('confirm.delete')" width="300px"
                                       @confirm="removeBookmark(data)">
                          <template #reference>
                            <el-button circle class="iconBtn" :title="t('btn.del')" type="danger">
                              <el-icon>
                                <Delete/>
                              </el-icon>
                            </el-button>
                          </template>
                        </el-popconfirm>
                        <el-button circle class="iconBtn" :title="t('btn.edit')" type="primary" @click="editBookmark(data)">
                          <el-icon>
                            <Edit/>
                          </el-icon>
                        </el-button>
                      </template>
                    </el-col>
                  </el-row>
                </template>

              </el-tree-v2>
            </el-scrollbar>
          </template>
        </el-auto-resizer>

        <el-badge :max="10000" :value="statistics.show" :title="t('statistics.show')" type="info"
                  style="position: absolute;top: 95%;left: 97%;z-index: 1000">
          <template #content="{ value }">
            {{ value }}
          </template>
        </el-badge>
      </el-main>
    </el-container>
  </el-container>

  <el-dialog v-model="showBookmarkDailog" :title="t('bookmarkDailog.dailogTitle')" width="500">
    <el-form :model="bookmark" label-width="auto">
      <el-form-item :label="t('bookmark.title')">
        <el-input v-model="bookmark.title"/>
      </el-form-item>
      <template v-if="bookmark.type === 'folder'">
        <el-form-item :label="t('bookmark.treeName')">
          <el-input v-model="bookmark.treeName" disabled/>
        </el-form-item>
      </template>
      <template v-if="bookmark.type === 'bookmark'">
        <el-form-item :label="t('bookmark.url')">
          <el-input v-model="bookmark.url"/>
        </el-form-item>
        <el-form-item :label="t('bookmark.status')">
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
        <el-form-item :label="t('bookmark.tags')">
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
              +{{ t('bookmark.tags') }}
            </el-button>
          </el-space>
        </el-form-item>

        <el-form-item :label="t('bookmark.treeName')">
          <el-input v-model="bookmark.treeName" disabled/>
        </el-form-item>
        <el-form-item :label="t('bookmark.currentUrl')">
          <el-input v-model="bookmark.currentUrl" disabled/>
        </el-form-item>
        <el-form-item :label="t('bookmark.metaTitle')">
          <el-input v-model="bookmark.metaTitle" :disabled="!setting.debug"/>
        </el-form-item>
        <el-form-item :label="t('bookmark.metaKeywords')">
          <el-input v-model="bookmark.metaKeywords" disabled/>
        </el-form-item>
        <el-form-item :label="t('bookmark.metaDescription')">
          <el-input v-model="bookmark.metaDescription" autosize disabled type="textarea"/>
        </el-form-item>
      </template>
      <el-form-item :label="t('bookmark.dateAddedTime')">
        <el-input v-model="bookmark.dateAddedTime" disabled/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveBookmark">{{ t('btn.save') }}</el-button>
        <el-button @click="closeBookmarkDialog">{{ t('btn.close') }}</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

  <el-dialog v-model="showBookmarkStatusDailog" width="500">
    <el-form :model="changeBookmarkStatus" label-width="auto">
      <el-form-item :label="t('bookmark.status')">
        <el-select
            v-model="changeBookmarkStatus.status"
        >
          <el-option
              v-for="item in bookmarkStatus"
              :key="item.value"
              :label="item.key"
              :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveBookmarkStatus">{{ t('btn.save') }}</el-button>
        <el-button @click="showBookmarkStatusDailog=false">{{ t('btn.close') }}</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

  <el-drawer v-model="setting.showUserConfig" direction="rtl">
    <template #header>
      {{ t('userConfig.title') }}
    </template>
    <template #default>
      <el-form :model="userSetting" label-width="auto" label-position="top">
        <el-form-item :label="t('userConfig.crawlQueueLength')" :title="t('userConfig.crawlQueueLength_title')">
          <el-slider
              v-model="userSetting.crawlQueueLength"
              :min="1"
              :max="30"
              :show-input="true"
          />
        </el-form-item>
        <el-form-item :label="t('userConfig.crawlStatus')" :title="t('userConfig.crawlStatus_title')">
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
        <el-form-item :label="t('userConfig.llmEnabled')" label-position="left">
          <el-switch v-model="userSetting.llmEnabled"/>
          <br/>
        </el-form-item>
        <el-card v-show="userSetting.llmEnabled">
          <el-form-item :label="t('userConfig.provider')" v-show="false">
            <el-input v-model="userSetting.provider"/>
          </el-form-item>
          <el-form-item :label="t('userConfig.providerkey')">
            <el-input v-model="userSetting.providerkey"/>
          </el-form-item>
          <el-form-item :label="t('userConfig.providerModel')" v-show="false">
            <el-input v-model="userSetting.providerModel"/>
          </el-form-item>
          <el-form-item :label="t('userConfig.promt')">
            <el-input
                v-model="userSetting.promt"
                :rows="8"
                type="textarea"
            />
          </el-form-item>
        </el-card>
      </el-form>
    </template>
    <template #footer>
      <el-button type="primary" @click="saveUserSetting">{{ t('btn.save') }}</el-button>
      <el-button @click="setting.showUserConfig=false">{{ t('btn.close') }}</el-button>
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
import { useI18n } from 'vue-i18n'
import {nextTick, ref,toRaw} from 'vue';
import Setting from "./common/userSetting.js";
import Util from "./common/utils.js";
import {Delete} from "@element-plus/icons-vue";

const backgroundConn = chrome.runtime.connect({ name: "index-background-connection" });
backgroundConn.onDisconnect.addListener(() => {
  console.log("联接失效")
  location.reload();
});

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
  setup() {
    const { t, locale } = useI18n({
      inheritLocale: true,
      useScope: 'local'
    })
    return { t, locale }
  },
  data() {
    let _this = this;
    return {
      userSetting: {},
      setting: {
        debug: import.meta.env.VITE_SETTING_DEBUG=='true',
        editModel: import.meta.env.VITE_SETTING_EDITMODEL=='true',
        showUserConfig: false,
        crawlStatus: "0"
      },
      bookmarkStatus: [
        {key: _this.t('bookmark.status_show.-99'), value: -99},
        {key: _this.t('bookmark.status_show.-3'), value: -3},
        {key: _this.t('bookmark.status_show.-2'), value: -2},
        {key: _this.t('bookmark.status_show.-1'), value: -1},
        {key: _this.t('bookmark.status_show.0'), value: 0},
        {key: _this.t('bookmark.status_show.1'), value: 1},
        {key: _this.t('bookmark.status_show.9'), value: 9},
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
          label: _this.t('searchQuery.all')
        }, {
          value: 'tags',
          label: _this.t('searchQuery.tags')
        }, {
          value: 'title',
          label: _this.t('searchQuery.title')
        }, {
          value: 'metaTitle',
          label: _this.t('searchQuery.metaTitle')
        }, {
          value: 'metaKeywords',
          label: _this.t('searchQuery.metaKeywords')
        }, {
          value: 'metaDescription',
          label: _this.t('searchQuery.metaDescription')
        }, {
          value: 'url',
          label: _this.t('searchQuery.url')
        }],
      },
      showBookmarkDailog: false,
      showBookmarkStatusDailog: false,
      inputVisible: false,
      inputValue: '',
      lastQueryParam: {
        prop: 'parentId',
        operator: 'eq',
        value: '1'
      },
      bookmark: {},
      originalBookmark: {},
      changeBookmarkStatus: {}
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
      const _this = this;
      Setting.setSysConfig(this.userSetting);
      LLM.clear();
      ElMessage({
        message: _this.t('tips.modifyUserSuccess'),
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
          message: _this.t('tips.success'),
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
      let _this = this;
      _this.lastQueryParam = {
        prop: 'parentId',
        operator: 'eq',
        value: data.id
      }
      backgroundConn.postMessage({
        action: Constant.PAGE_EVENT.QUERY_BOOKMARKS,
        ..._this.lastQueryParam
      });
    },
    reloadBookMark(){
      backgroundConn.postMessage({
        action: Constant.PAGE_EVENT.RELOAD_BOOKMARK
      });
    },
    crawlMeta() {
      const _this = this;
      Setting.getSysConfig().then(config => {
        if (config.llmEnabled && Util.hasEmptyProperty(config)) {
          ElMessage({
            message: _this.t('tips.modifyUserFirst'),
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
      _this.lastQueryParam = {
        prop: _this.searchQuery.prop,
        operator: 'like',
        value: _this.searchQuery.value
      };
      backgroundConn.postMessage({
        action: Constant.PAGE_EVENT.QUERY_BOOKMARKS,
        ..._this.lastQueryParam
      });
    },
    searchStatisticsBookmarks(param) {
      let status = [];
      status.push(param.value);
      this.statistics.selectStatus = status;
      this.lastQueryParam = param;
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
      let _this = this;
      backgroundConn.postMessage({
        action: Constant.PAGE_EVENT.QUERY_BOOKMARKS,
        ..._this.lastQueryParam
      });
      backgroundConn.postMessage({
        action: Constant.PAGE_EVENT.STATISTICS_TOTAL,
        prop: 'id',
        operator: 'gt',
        value: '0'
      });
    },
    showBookmarkStatus() {
      const _this = this;
      let datas = _this.$refs.bookmarkList.getCheckedNodes();
      if (datas && datas.length > 0) {
        _this.showBookmarkStatusDailog = true;
      } else {
        ElMessage({
          message: _this.t('tips.select'),
          type: 'error',
        });
      }
    },
    saveBookmarkStatus() {
      const _this = this;
      let datas = _this.$refs.bookmarkList.getCheckedNodes();
      if (datas && datas.length > 0) {
        for (const bm of datas) {
          bm.status = _this.changeBookmarkStatus.status;
        }
        BookmarkManager.saveBookmarks(datas).then(() => {
          _this.showBookmarkStatusDailog = false;
          ElMessage({
            message: _this.t('tips.success'),
            type: 'success',
          });
          _this.reloadBookmarkPage();
        })
      } else {
        ElMessage({
          message: _this.t('tips.select'),
          type: 'error',
        });
      }
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
          message: _this.t('tips.success'),
          type: 'success',
        });
        _this.reloadBookmarkPage();
      })
    },
    removeAllCheck() {
      const _this = this;
      let datas = _this.$refs.bookmarkList.getCheckedNodes().map(node => toRaw(node));
      if(datas && datas.length > 0){
        BookmarkManager.deleteBookmarks(datas).then(() => {
          ElMessage({
            message: _this.t('tips.success'),
            type: 'success',
          });
          _this.reloadBookmarkPage();
        })
      }else{
        ElMessage({
          message: _this.t('tips.select'),
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
      }  else if (result.action === Constant.PAGE_EVENT.RELOAD_PAGE) {
        _this.reloadBookmarkPage();
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
                // console.log(data);
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
  width: 80%;
}

.bookmark-text:hover {
  color: #409EFF; /* 悬浮时的颜色 */
  text-decoration: underline; /* 悬浮时的下划线 */
  width: 80%;
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
