<template>
    <div id="app">
        <div class="huge-tree-wrap">
            <huge-tree
                ref="huge-tree"
                show-checkbox
                show-search-bar
                show-node-count
                :expand-level="2"
                :expand-on-click-node="true"
                :default-checked-keys="checkedKeys"
                :search-method="searchMethod"
                @check="onClickCheckbox"
                @click-label="onClickLabel"
                @check-change="onChange"
                @node-click="onNodeClick"
            />
        </div>
    </div>
</template>

<script>
// import HugeTree from '../dist/vue-huge-tree-oxr.common'
// import '../dist/vue-huge-tree-oxr.css'
import HugeTree from './huge-tree'
export default {
    components: {
        HugeTree
    },
    data() {
        return {
            checkedKeys: [],
            data: [
                {
                    id: '0',
                    label: 'ALL',
                    value: 'value_All',
                    pId: null,
                    children: Array.from(Array(10).keys(), v => ({
                        id: '0-' + v,
                        pId: '0',
                        label: 'label_' + v,
                        value: 'value_' + v,
                        children: Array.from(Array(1000).keys(), cv => ({
                            id: '0-' + v + '-' + cv,
                            pId: '0-' + v,
                            disabled: cv === 1 || cv === 2,
                            label: 'label_' + v + '-' + cv,
                            value: 'value_' + v + '-' + cv
                        }))
                    }))
                }
            ]
        }
    },
    mounted() {
        this.getTreeData()
    },
    methods: {
        getTreeData() {
            this.$refs['huge-tree'].setData(this.data)
            this.checkedKeys = ['0-0', '0-1-1']
        },
        onClickCheckbox(node) {
            console.log('onClickCheckbox ~ node>>> :', node)
            console.log('------')
        },
        onClickLabel(node) {
            console.log('onClickLabel ~ node>>> :', node)
            console.log('------')
        },
        onChange(checkedKeys, checkedNodes) {
            console.log('onChange ~ checkedKeys>>> :', checkedKeys)
            console.log('onChange ~ checkedNodes>>> :', checkedNodes)
            const leafNode = checkedNodes.filter(n => n.isLeaf)
            console.log('onChange ~ leafNode>>> :', leafNode)
            console.log('------')
        },
        onNodeClick(node, e) {
            if (!node.isLeaf || node.disabled) return
            node.checked = !node.checked
            this.$refs['huge-tree'].onChecked(node)
        },
        searchMethod(keywords, { value, label }) {
            return keywords.some(
                keyword =>
                    value.toLowerCase().includes(keyword.toLowerCase()) ||
                    label.toLowerCase().includes(keyword.toLowerCase())
            )
        }
    }
}
</script>

<style scoped lang="scss">
.huge-tree-wrap {
    width: 50%;
    height: 50vh;
    border: 1px solid #efefef;
    margin: 10% auto;
}
</style>
