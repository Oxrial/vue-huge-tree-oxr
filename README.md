# vue-huge-tree

## 安装

```
npm i vue-huge-tree
```

## 引入

```
import VueHugeTree from 'vue-huge-tree';
import 'vue-huge-tree/dist/vue-huge-tree.css'
```

## 使用

> 海量数据建议不要放到 data 里，vue 依赖收集会导致内存占用过多。所以此插件没有使用 props 传递海量数据，而是通过 setData(data) 方法。

```
<template>
  <vue-huge-tree
    ref="huge-tree"
    showCheckbox
    hasInput
    :defaultCheckedKeys="checkedKeys"
    @onClickCheckbox="onClickCheckbox"
    @onClickLabel="onClickLabel"
    @onChange="onChange"
  ></vue-huge-tree>
</template>

<script>
import VueHugeTree from 'vue-huge-tree';
import 'vue-huge-tree/dist/vue-huge-tree.css';

export default {
  components: {
    VueHugeTree,
  },
  props: {},
  data() {
    return {
      checkedKeys: [],
      treeData: [
        {
          label: '测试0',
          id: '0',
          parentId: null,
          children: [
            {
              label: '测试0-0',
              id: '0-0',
              parentId: '0',
              children: [
                {
                  label: '测试0-0-0',
                  id: '0-0-0',
                  parentId: '0-0',
                  children: null,
                },
                {
                  label: '测试0-0-1',
                  id: '0-0-1',
                  parentId: '0-0',
                  children: null,
                },
              ],
            },
            {
              label: '测试0-1',
              id: '0-1',
              parentId: '0',
              disabled: true,
              children: [
                {
                  label: '测试0-1-0',
                  id: '0-1-0',
                  parentId: '0-1',
                  disabled: true,
                  children: null,
                },
                {
                  label: '测试0-1-1',
                  id: '0-1-1',
                  parentId: '0-1',
                  disabled: true,
                  children: null,
                },
              ],
            },
          ],
        },
        {
          label: '测试1',
          id: 1,
          parentId: null,
          children: null,
        },
      ],
      defaultProps: {
        children: 'children',
        label: 'label',
      },
    };
  },
  mounted() {
    this.getTreeData();
  },
  methods: {
    getTreeData() {
      this.$refs['huge-tree'].setData(this.treeData);
      this.checkedKeys = ['0-0-0', '0-1-1'];
    },
    onClickCheckbox(node) {
      console.log(node);
    },
    onClickLabel(node) {
      console.log(node);
    },
    onChange({ checkedKeys, checkedNodes }) {
      console.log(checkedKeys, checkedNodes);
    },
  },
};
</script>

```

## Attributes

|参数|说明|类型|可选值|默认值|
|-|-|-|-|-|
|empty-text|内容为空的时候展示的文本|string|—|'暂无数据'|
|node-key|每个树节点用来作为唯一标识的属性, 整棵树应该是**唯一**的|string|—|'id'|
|highlight-current|是否高亮当前选中节点|boolean|true|false|
|expand-level|节点展开的层级|number|-1: 展开所有节点;<br />1: 展开第一层 (最外层);<br />2: 展开第二层;<br />...|-1|
|indent|相邻级节点间的水平缩进，单位为像素|number|—|16|
|show-node-count|显示节点对应的数据量|boolean|true|false|
|show-search-bar|显示搜索框, 多个关键字之间用英文逗号分隔||||
|placeholder|搜索框的占位文本|string|—|请输入关键字, 多个关键字之间用英文逗号分隔|
|default-expanded-keys|默认展开的节点的 key 的数组|array|—|—|
|loading|是否显示数据加载时的状态|boolean|true|false|
|loading-text|数据加载状态时提示的文字|string|—|'loading...'|
|checked-action|点击 label 选中模式|string|'none': 不选中;<br />'click': 单击选中;<br />'dblclick': 双击选中|'none'|
|show-checkbox|节点是否可被选择|boolean|true|false|
|show-checkbox-leaf-only|是否仅叶子节点展示 checkbox, show-checkbox 为 true 时有效|boolean|true|false|
|default-checked-keys|默认勾选的节点的 key 的数组 (**需要 setData 之后赋值**)||||
|check-strictly|在显示复选框的情况下，是否严格的遵循父子不互相关联的做法|boolean|true|false|


## Methods

|方法名称|说明|参数|
|-|-|-|
|setData|导入<a href="#data-format">数据结构</a>|object[]|
| setCheckedKeys  | 通过 keys 设置目前勾选的节点|勾选节点的 key 的数组|
| setCheckedNodes | 设置目前勾选的节点|勾选节点数据的数组|
| getCheckedKeys  | 若节点可被选择, 则返回目前被选中的节点的 key 所组成的数组|—|
| getCheckedNodes | 若节点可被选择, 则返回目前被选中的节点所组成的数组|—|
| clearChecked    | 清空所有已选中的节点|—|
| setExpand       | 设置目前展开的节点|展开节点的 key 的数组|
| showCheckedOnly | 只展示选中的项, 此方法会置空过滤条件 | (isOnlyInCheckedSearch): 是否只在选中的节点里进行筛选, 默认 `true` |
| restore         | 对 showCheckedOnly 之后进行恢复      | —|
| update          | 手动更新选中状态| —|
| clear           | 清空内存占用| —|

## Events

| 事件名称| 说明| 回调参数|
| - | - | - |
| check-change| 选中状态变化触发|(checkedKeys, checkedNodes) 共两个参数, 依次为: 已选节点的 key 列表; 已选节点列表|
| check |当复选框被点击的时候触发|当前节点|
| click-label|节点 label 被点击时的回调|当前节点|

## Scoped Slot

|name|说明|
|-|-|
|—|自定义树节点的内容, 例:  `<template v-slot="node">{{ node }}</template>` <a href="#node-format">参数详情</a> |
|search-bar| 自定义搜索框的内容, 例:  `<template v-slot:search-bar>xxx</template>`|
|loading| 自定义加载中 slot, 例:  `<template v-slot:loading>加载中...</template>`|

#### <a id="data-format">数据结构</a>

|属性|说明|类型|可选值|默认值|
|-|-|-|-|-|
|**label**|节点标签|string|—|—|
|**id**|节点唯一标识 (属性名受 node-key 影响, 默认为"id")||||
|**parentKey**|父节点的 key (根节点必须为 null)|string \| number|—|—|
|disabled|设置禁用状态|boolean|true|false|
|children|节点子元素|array|—|—|

#### <a id="node-format">节点结构</a>

|属性|说明|类型|
|-|-|-|
|label|节点标签|string|
|disabled|禁用状态|boolean|
|id|节点唯一标识 (属性名受 node-key 影响, 默认为"id")|string \| number|
|parentKey|父节点的 key (根节点必须为 null)|string \| number|
|children|节点子元素|array|
|checked|勾选状态|boolean|
|indeterminate|节点的子树中是否是部分选中|boolean|
|isLeaf|是否为叶子节点|boolean|
|path|节点位置|string[]|
|isExpand|是否展开|boolean|
|hidden|是否隐藏|boolean|
|leafCount|后代元素数量|number|
