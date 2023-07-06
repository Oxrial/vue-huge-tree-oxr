<template>
    <div class="huge-tree">
        <section class="search-bar" v-if="showSearchBar">
            <slot
                name="pre-input"
                :func="
                    val => {
                        keyword = val
                        init()
                    }
                "
            >
                <el-input
                    v-model="keyword"
                    clearable
                    placeholder="输入关键字过滤 [,] 分隔匹配"
                    @keyup.13="init"
                    @input="debounceInput"
                />
            </slot>
        </section>
        <section
            v-if="renderList.length"
            ref="content-wrap"
            class="content-wrap"
            @scroll="onScroll"
        >
            <div class="tree-phantom" :style="`height: ${phantomHeight}px`"></div>
            <div
                class="tree-content"
                :style="`transform: translateY(${startIndex * itemHeigth}px)`"
            >
                <template v-for="(item, index) in renderList">
                    <section
                        v-if="item.path"
                        :key="'k' + index"
                        :class="[
                            'item',
                            {
                                'is-hidden': item.isHidden,
                                active: highlightCurrent && item.id === selectedNode.id
                            }
                        ]"
                        :style="`margin-left: ${(item.path.length - 1) * Number(indent)}px`"
                        @click="expandOnClickNode && onExpand(item, index)"
                    >
                        <div
                            v-if="!item.isLeaf"
                            :class="[
                                item.isLeaf ? 'leaf-node' : 'expand-node',
                                { 'is-expand': item.isExpand }
                            ]"
                            @click="onExpand(item, index)"
                        >
                            <slot name="exxpandicon" />
                        </div>
                        <div v-else>
                            <slot name="itemicon"><div class="item-node" /> </slot>
                        </div>
                        <Checkbox
                            v-model="item.checked"
                            :indeterminate="item.indeterminate"
                            :disabled="item.disabled"
                            :is-leaf="item.isLeaf"
                            :show-checkbox-leaf-only="showCheckboxLeafOnly"
                            :checked-action="checkedAction"
                            :show-checkbox="!item.hideCheckbox && showCheckbox"
                            :check-striclty="checkStrictly"
                            :node="item"
                            @on-checked="onChecked(item)"
                            @on-click-label="onClickLabel(item)"
                        >
                            <div class="label">
                                <slot :slot-scope="item">{{ item.label }}</slot>
                                <i v-if="!item.isLeaf && showNodeCount" class="count">
                                    ({{ item.leafCount }})
                                </i>
                            </div>
                        </Checkbox>
                    </section>
                </template>
            </div>
        </section>
        <section v-else class="no-data">
            <p v-if="loading || isSearching">
                <slot name="loading">{{ loadingText }}</slot>
            </p>
            <p v-else>{{ emptyText }}</p>
        </section>
    </div>
</template>

<script>
import Checkbox from '../checkbox'
import {
    isIncludesKeyword,
    getLeafCount,
    depthFirstEach,
    listToTree,
    findSubTree,
    breadthFirstEach,
    findNode,
    isBrother,
    isCheckedOrIndeterminate,
    throttle,
    debounce,
    clearAll
} from '../utils/util.js'

class BigData {
    _data = [] // 海量数据 tree
    list = [] // 扁平化的tree
    filterList = [] // 根据关键词过滤后的list
    listMap = {} // this.big.list 对应的 map
    filterTree = [] // 根据关键词过滤后的tree
    disabledList = [] // disabled 为true组成的数组
    checkedKeys = [] // 选中的 ids
    checkedNodes = [] // 选中的 nodes
    allCheckedList = [] // 所有选中的节点， 用于开启开关 isOnlyInCheckedSearch 时， 仅在选中节点里筛选。
}

export default {
    name: 'huge-tree',
    components: {
        Checkbox
    },
    props: {
        checkOver: { type: Number, default: 1000 },
        expandOnClickNode: { type: Boolean, default: false },
        /**强制使用id，提高性能 */
        // 每个树节点用来作为唯一标识的属性，整棵树应该是唯一的
        // nodeKey: { type: String, default: 'id' },
        // 是否高亮当前选中节
        highlightCurrent: { type: Boolean, default: false },
        // 展开层级 -1: 展开全部; 1: 只展示第一层(最外层); 2: 展示到第二层; ...
        expandLevel: { type: Number, default: -1 },
        // 显示节点对应的数据量
        showNodeCount: { type: Boolean, default: false },
        // 显示搜索框
        showSearchBar: { type: Boolean, default: false },
        // 缩进
        indent: { type: Number, default: 16 },
        // 默认展开的节点的 key 的数组
        defaultExpandedKeys: { type: Array, default: () => [] },
        // 输入框 placeholder
        placeholder: { type: String, default: '请输入关键字, 多个关键字之间用英文逗号分隔' },
        // 加载中
        loading: { type: Boolean, default: false },
        // 加载状态提示文字
        loadingText: { type: String, default: 'loading...' },
        // 在 label 上选中动作, 点击 label 选中 --> none: 不选中；click: 单击； dblclick: 双击；
        checkedAction: { type: String, default: 'none' },
        // 内容为空展示的文本
        emptyText: { type: String, default: '暂无数据' },
        // 是否展示checkbox
        showCheckbox: { type: Boolean, default: false },
        // 是否仅叶子节点展示 checkbox, show-checkbox 为 true 时有效
        showCheckboxLeafOnly: { type: Boolean, default: false },
        // 默认勾选值
        defaultCheckedKeys: { type: Array, default: () => [] },
        // 父子不互相关联
        checkStrictly: { type: Boolean, default: false }
    },
    data() {
        this.big = null
        return {
            count: 1, // 用于视图更新
            keyword: '', // 关键词
            isSearching: false, // 搜索中
            itemHeigth: 27, // 每一项的高度
            startIndex: 0, // 渲染的开始区间
            endIndex: 70, // 渲染的结束区间
            throttleSrcoll: '', // 节流
            debounceInput: '',
            isOnlyInCheckedSearch: false,
            selectedNode: {}
        }
    },
    computed: {
        // 过滤掉 hidden 节点
        unHiddenList() {
            return this.count ? this.big.filterList.filter(i => !i.isHidden) : []
        },
        // 虚拟高度，与隐藏的数量有关
        phantomHeight() {
            return this.unHiddenList.length * this.itemHeigth
        },
        renderList() {
            return this.unHiddenList.slice(this.startIndex, this.endIndex)
        }
    },
    watch: {
        defaultCheckedKeys(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.setCheckedKeys(newVal)
            }
        },
        defaultExpandedKeys(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.setExpand(newVal)
            }
        }
    },
    created() {
        this.big = new BigData()
        this.big.checkedKeys = JSON.parse(JSON.stringify(this.defaultCheckedKeys))
        this.throttleSrcoll = throttle(this.setRenderRange, 80)
        this.debounceInput = debounce(this.init, 300)
    },

    beforeDestroy() {
        this.clear()
    },

    methods: {
        // 设置海量数据
        setData(data) {
            this.clear()
            this.big._data = data
            this.init('init')
        },

        init(op) {
            // op: init, restore, showCheckedOnly
            if (this.big._data.length === 0) return
            if (op === 'init') {
                this.flatTree(this.big._data)
                this.big.list.forEach(node => (this.big.listMap[node.id] = node))
            }
            this.initFilter(op)
            if (op === 'init' || op === 'restore') this.initExpand()
            this.setCheckedKeys(this.big.checkedKeys)
            this.backToTop()
        },

        // 拉平 tree
        flatTree(data) {
            depthFirstEach({ tree: data, init: true }, node => {
                this.big.list.push(node)
            })
        },

        // 初始化处理展开逻辑
        initExpand() {
            if (!this.big || this.big._data.length === 0) return
            if (this.defaultExpandedKeys.length > 0) {
                this.setExpand(this.defaultExpandedKeys)
                return
            }
            this.initExpandTrigger()
            this.setCount()
        },
        initExpandTrigger() {
            // if (/^\d+$/.test(this.expandLevel)) {
            if (this.expandLevel !== -1) {
                this.big.filterList.forEach(node => {
                    node.isExpand = Boolean(node.path.length < this.expandLevel)
                    node.isHidden = Boolean(node.path.length > this.expandLevel)
                    this.initNode(node)
                })
            } else {
                // 展开全部
                this.big.filterList.forEach(node => {
                    node.isExpand = true
                    node.isHidden = false
                    this.initNode(node)
                })
            }
        },
        // 指定id展开
        setExpand(keys = []) {
            if (keys.length <= 0) return
            if (!this.big || this.big._data.length === 0) return
            const nodes = keys.map(key => this.big.listMap[key]).filter(v => v)
            const ids = Array.from(new Set(nodes.map(node => node.path).flat(1)))
            this.big.filterList.forEach(node => {
                if (node.isLeaf) {
                    node.isExpand = false
                    node.isHidden = Boolean(!ids.includes(node.pId))
                } else {
                    node.isExpand = Boolean(ids.includes(node.id))
                    node.isHidden = false
                }
                this.initNode(node)
            })
            this.setCount()
        },

        // 初始化节点所需要的字段
        initNode(node) {
            node.checked = node.checked || false
            node.indeterminate = node.indeterminate || false
            node.disabled = node.disabled || false
        },

        // 回显选中状态
        setCheckedKeys(keys = []) {
            if (!Array.isArray(keys)) {
                console.warn('The argument to function setCheckedKeys must be an array')
                return
            }
            this.clearChecked()
            const nodes = keys.map(key => this.big.listMap[key])
            nodes.forEach((node, index) => {
                if (node && node.isLeaf) {
                    node.checked = true
                    if (!isBrother(node, nodes[index + 1])) this.handleCheckedChange(node)
                }
            })
            this.emitChecked()
        },

        // 回显选中状态
        setCheckedNodes(nodes = []) {
            if (!Array.isArray(nodes)) {
                console.warn('The argument to function setCheckedNodes must be an array')
                return
            }
            if (nodes.length > 0) {
                const keys = nodes.map(i => i.id)
                this.setCheckedKeys(keys)
            }
        },

        // 获取选中状态
        getCheckedKeys() {
            return this.big.checkedKeys
        },

        getCheckedNodes() {
            return this.big.checkedNodes
        },

        // 点击展开与收缩
        onExpand(node) {
            node.isExpand = !node.isExpand
            this.showOrHiddenChildren(node, !node.isExpand)
        },

        // 点击 checkbox
        onChecked(node) {
            this.handleCheckedChange(node)
            this.emitChecked()
            this.$emit('check', node)
        },

        // 点击 label
        onClickLabel(node) {
            this.selectedNode = node
            this.$emit('click-label', node)
        },

        // 发送给父组件选中信息
        emitChecked() {
            this.big.checkedNodes = this.big.list.filter(i => i.checked || i.indeterminate) // 返回”所有“选中的节点 或者 父节点(子节点部分选中)
            this.big.checkedKeys = this.big.checkedNodes.map(i => i.id)
            this.$emit('check-change', this.big.checkedKeys, this.big.checkedNodes)
            this.setCount()
        },
        // 处理选中逻辑
        handleCheckedChange(node) {
            // 父子不互相关联
            if (this.checkStrictly) {
                node.indeterminate = node.isLeaf ? false : node.checked
                return
            }
            if (node.checked) node.indeterminate = false
            this.doChildrenChecked(node)
            this.doParentChecked(node.pId)
            this.big.disabledList.forEach((node, index) => {
                if (!isBrother(node, this.big.disabledList[index + 1]))
                    this.doParentChecked(node.pId)
            })
        },

        // 1. 隐藏： 子孙后代都要隐藏， 2. 展开：仅儿子展开, value
        showOrHiddenChildren(node, isHidden) {
            if (node.isLeaf) return
            if (isHidden) {
                depthFirstEach({ tree: node.children }, node => {
                    node.isHidden = isHidden
                    node.isExpand = false
                })
            } else {
                node.children.forEach(j => {
                    j.isHidden = isHidden
                    j.isExpand = false
                })
            }
            this.setCount()
        },

        // 处理子、孙后代
        doChildrenChecked(node) {
            if (!node.children) return
            const checked = node.checked
            depthFirstEach({ tree: node.children }, i => {
                if (i.isLeaf && i.disabled) return
                i.indeterminate = false
                i.checked = checked
            })
        },

        // 处理自己及祖先
        doParentChecked(pId) {
            if (pId === null || pId === undefined) return
            const allDirectChildren = findSubTree(this.big.filterTree, pId)
            const parentNode = findNode(this.big.filterTree, pId)
            const childrenAllChecked = allDirectChildren.every(i => i.checked)
            this.checkParentIndeterminate(parentNode, allDirectChildren)
            parentNode.checked = childrenAllChecked
            if (childrenAllChecked) parentNode.indeterminate = false
            if (parentNode.pId !== null) this.doParentChecked(parentNode.pId)
        },

        // 子元素部分选中，核对祖先是否部分选中
        checkParentIndeterminate(parentNode, directChildren) {
            const hasChecked = directChildren.some(i => i.checked)
            const hasUnchecked = directChildren.some(i => !i.checked)
            const partOfChecked = hasChecked && hasUnchecked
            const childrenHasIndeterminate = directChildren.some(i => i.indeterminate)
            const isIndeterminate = partOfChecked || childrenHasIndeterminate
            parentNode.indeterminate = !!isIndeterminate
            directChildren.forEach(node => {
                if (node.checked) node.indeterminate = false
            })
        },

        // 监听滚动
        onScroll() {
            this.throttleSrcoll()
        },

        // 设置可见区域的区间
        setRenderRange(scrollTop = this.$refs['content-wrap'].scrollTop) {
            const count = Math.ceil(this.$el.clientHeight / this.itemHeigth) + 40 // 可见项数
            const startIndex = Math.floor(scrollTop / this.itemHeigth)
            this.startIndex = startIndex > 20 ? startIndex - 20 : 0
            this.endIndex = this.startIndex + count
            this.setCount()
        },

        // 筛选节点
        initFilter(op) {
            // set this.big.filterList
            this.setFilterList(op)
            this.initExpandTrigger()
            this.setCount()
            // 过滤后的tree  同时也将children挂载到了this.filterList的节点
            this.big.filterTree = listToTree(this.big.filterList)
            breadthFirstEach({ tree: this.big.filterTree }, node => {
                if (!node.isLeaf) {
                    node.leafCount = getLeafCount(this.big.filterTree, node)
                }
            })
            this.big.disabledList = this.big.filterList.filter(i => i.disabled)
        },

        // set this.big.filterList
        setFilterList(op) {
            if (op === 'showCheckedOnly') {
                // 不直接 this.big.filterList = this.big.checkedNodes, 因为之前的 filter 将 滤掉的 非叶子节点indeterminate = true 丢失了。场景，1. 输入关键字，2. 点击showCheckedOnly
                this.big.filterList = this.big.list.filter(i => {
                    const is = isCheckedOrIndeterminate(i, this.big.list)
                    if (is) {
                        i.checked = true
                        i.indeterminate = false
                    }
                    return is
                })
                return
            }
            if (this.isOnlyInCheckedSearch && this.big.allCheckedList.length > 0) {
                if (this.keyword.trim() === '') {
                    this.big.filterList = this.big.allCheckedList
                    return
                }
                this.big.filterList = this.big.allCheckedList.filter(i => {
                    return isIncludesKeyword(i, this.keyword, this.big.allCheckedList)
                })
                return
            }
            if (this.keyword.trim() === '') {
                this.big.filterList = this.big.list
                return
            }
            this.big.filterList = this.big.list.filter(i => {
                return isIncludesKeyword(i, this.keyword, this.big.list)
            })
        },

        // 回到顶部
        backToTop() {
            this.$nextTick(() => {
                if (this.$refs['content-wrap']) {
                    this.$refs['content-wrap'].scrollTop = 0
                    this.setRenderRange()
                }
            })
        },

        // 清空所有选中
        clearChecked() {
            this.big.list.forEach(node => {
                node.checked = false
                node.indeterminate = false
            })
        },

        // 根据 count 触发 computed
        setCount() {
            this.count++
        },

        // 仅展示选中的项
        showCheckedOnly(isOnlyInCheckedSearch = true) {
            this.keyword = ''
            this.init('showCheckedOnly')
            // 开关，仅在选中节点里筛选
            this.isOnlyInCheckedSearch = isOnlyInCheckedSearch
            if (isOnlyInCheckedSearch) {
                this.big.allCheckedList = this.big.checkedNodes.slice()
            } else {
                this.big.allCheckedList = []
            }
        },

        restore() {
            this.isOnlyInCheckedSearch = false
            this.big.allCheckedList = []
            this.init('restore')
        },
        // 手动更新选中状态
        update() {
            this.setCount()
        },

        // 清空内存占用
        clear() {
            this.count = 1
            this.keyword = '' // 关键词
            this.isSearching = false // 搜索中
            this.startIndex = 0 // 渲染的开始区间
            this.endIndex = 70 // 渲染的结束区间
            this.isOnlyInCheckedSearch = false
            clearAll(this.big.list)
            if (this.big) {
                this.big._data = [] // 海量数据 tree
                this.big.list = [] // 扁平化的tree
                this.big.filterList = [] // 根据关键词过滤后的list
                this.big.listMap = {} // this.big.filterList 对应的 map
                this.big.filterTree = [] // 根据关键词过滤后的tree
                this.big.disabledList = [] // disabled 为true组成的数组
                this.big.checkedKeys = [] // 选中的 ids
                this.big.checkedNodes = [] // 选中的 nodes
            }
        }
    }
}
</script>

<style lang="scss" scoped>
/* 滚动条样式 */
::-webkit-scrollbar {
    width: 5px;
    height: 5px;
}
::-webkit-scrollbar-track-piece {
    background: #efefef;
}
::-webkit-scrollbar-thumb {
    background: #aaa;
    min-width: 150px;
    border-radius: 5px;
}
::-webkit-scrollbar-thumb:vertical:hover {
    background: #666;
}
::-webkit-scrollbar-thumb:horizontal:hover {
    background: #666;
}
.huge-tree {
    display: flex;
    flex-direction: column;
    min-height: 50px;
    height: 100%;
    * {
        transition: all 0.3s ease-in-out;
    }
    .search-bar {
        margin-bottom: 20px;
    }
    .content-wrap {
        position: relative;
        overflow: auto;
        flex: 1;
        .tree-phantom {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            z-index: -1;
        }
        .tree-content {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            .item {
                display: flex;
                align-items: center;
                cursor: pointer;
                &:hover {
                    background-color: #f5f7fa;
                }
                &.active {
                    background-color: #f0f7ff;
                }
                &.is-hidden {
                    display: none;
                }
                .expand-node,
                .item-node {
                    width: 24px;
                    height: 26px;
                    line-height: 26px;
                    cursor: auto;
                }
                .expand-node {
                    position: relative;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    &:hover {
                        color: #409eff;
                        border-color: #409eff;
                        background-color: #f1f5f8;
                    }
                    &::before {
                        content: '\25BC';
                        position: absolute;
                        font-size: 12px;
                        color: #c0c4cc;
                        transform: rotate(-90deg) scale(1, 0.5);
                        transition: transform 0.3s ease-in-out;
                    }
                    &.is-expand::before {
                        content: '\25BC';
                        font-size: 12px;
                        color: #c0c4cc;
                        transform: rotate(0deg) scale(1, 0.5);
                        transition: transform 0.3s ease-in-out;
                    }
                }
                .label {
                    cursor: pointer;
                    color: #606266;
                    font-size: 14px;
                    .count {
                        font-size: 12px;
                        color: #c0c4cc;
                    }
                }
            }
        }
    }
    .no-data {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        text-align: center;
    }
}
</style>
