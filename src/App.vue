<template>
  <div id="app">
    <huge-tree
      ref="huge-tree"
      showCheckbox
      hasInput
      :defaultCheckedKeys="checkedKeys"
      @onClickCheckbox="onClickCheckbox"
      @onClickLabel="onClickLabel"
      @onChange="onChange"
    ></huge-tree>
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
                  children: null
                },
                {
                  label: '测试0-0-1',
                  id: '0-0-1',
                  parentId: '0-0',
                  children: null
                }
              ]
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
                  children: null
                },
                {
                  label: '测试0-1-1',
                  id: '0-1-1',
                  parentId: '0-1',
                  disabled: true,
                  children: null
                }
              ]
            }
          ]
        },
        {
          label: '测试1',
          id: 1,
          parentId: null,
          children: null
        }
      ],
      defaultProps: {
        children: 'children',
        label: 'label'
      }
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
    onChange({ checkedKeys, checkedNodes }) {
      console.log(checkedKeys, checkedNodes);
    }
  }
};
</script>

<style scoped lang="scss">
#app {
  width: 100vw;
  height: 100vh;
}
</style>
