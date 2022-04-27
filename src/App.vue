<template>
  <div id="app">
    <div class="huge-tree-wrap">
      <huge-tree
        ref="huge-tree"
        show-checkbox
        show-search-bar
        show-node-count
        :default-checked-keys="checkedKeys"
        @check="onClickCheckbox"
        @click-label="onClickLabel"
        @check-change="onChange"
      ></huge-tree>
    </div>
  </div>
</template>

<script>
import HugeTree from './huge-tree';

export default {
  components: {
    HugeTree
  },
  props: {},
  data() {
    return {
      checkedKeys: [],
      treeData: [
        {
          label: '测试0',
          id: '0',
          parentKey: null,
          children: [
            {
              label: '测试0-0',
              id: '0-0',
              parentKey: '0',
              children: [
                {
                  label: '测试0-0-0',
                  id: '0-0-0',
                  parentKey: '0-0',
                  children: null
                },
                {
                  label: '测试0-0-1',
                  id: '0-0-1',
                  parentKey: '0-0',
                  children: null
                }
              ]
            },
            {
              label: '测试0-1',
              id: '0-1',
              parentKey: '0',
              disabled: true,
              children: [
                {
                  label: '测试0-1-0',
                  id: '0-1-0',
                  parentKey: '0-1',
                  disabled: true,
                  children: null
                },
                {
                  label: '测试0-1-1',
                  id: '0-1-1',
                  parentKey: '0-1',
                  disabled: true,
                  children: null
                }
              ]
            }
          ]
        },
        {
          label: '测试1',
          id: '1',
          parentKey: null,
          children: null
        }
      ]
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    this.getTreeData();
  },
  beforeDestroy() {},
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
    onChange(checkedKeys, checkedNodes) {
      console.log(checkedKeys, checkedNodes);
    }
  }
};
</script>

<style scoped lang="scss">
.huge-tree-wrap {
  width: 200px;
  height: 500px;
  border: 1px solid #efefef;
}
</style>
