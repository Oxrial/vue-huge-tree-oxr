<template>
    <div :class="['check-box']" @click.stop="e => $emit('on-node-click', e)">
        <el-tooltip
            v-if="showBox"
            effect="dark"
            content="至多一次选择1000条"
            placement="top-start"
            popper-class="huge-tree-tooltip"
            :disabled="node.isLeaf || node.leafCount <= checkOver"
        >
            <div
                :class="[
                    'box',
                    {
                        'is-checked': checked,
                        'is-part-checked': indeterminate,
                        'is-disabled': disabled,
                        'check-over': !node.isLeaf && node.leafCount > checkOver
                    }
                ]"
                @click.stop="
                    ;(node.isLeaf || (!node.isLeaf && node.leafCount <= checkOver)) && onChecked()
                "
            />
        </el-tooltip>
        <div @click="onSingleChecked" @dblclick="onDBLChecked">
            <slot />
        </div>
    </div>
</template>

<script>
import { depthFirstEach } from '../utils/util'

export default {
    model: {
        prop: 'checked',
        event: 'checked-change'
    },
    props: {
        checkOver: { type: Number, default: 1000 },
        checked: { type: Boolean, default: false },
        indeterminate: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
        checkedAction: { type: String, default: 'none' },
        showCheckbox: { type: Boolean, default: false },
        isLeaf: { type: Boolean, default: true },
        showCheckboxLeafOnly: { type: Boolean, default: false },
        node: { type: Object, default: () => {} },
        checkStriclty: { type: Boolean, default: false }
    },
    data() {
        return {}
    },

    computed: {
        showBox() {
            if (this.showCheckbox) {
                if (this.showCheckboxLeafOnly) {
                    return this.isLeaf
                }
                return true
            }
            return false
        }
    },

    mounted() {},

    methods: {
        onChecked() {
            if (this.disabled) return
            this.$emit('checked-change', this.getNewChecked(this.checked))
            this.$emit('on-checked')
        },
        labelClick() {
            this.$emit('on-click-label')
        },
        onSingleChecked() {
            if (this.checkedAction === 'click' && this.showBox) this.onChecked()
            this.labelClick()
        },
        onDBLChecked() {
            if (this.checkedAction === 'dblclick' && this.showBox) this.onChecked()
            this.labelClick()
        },

        getNewChecked(oldChecked) {
            if (this.node.isLeaf || this.checkStriclty) {
                return !oldChecked
            }
            let newChecked = false
            depthFirstEach({ tree: this.node.children }, node => {
                if (node.isLeaf && !node.disabled && !node.checked) {
                    newChecked = true
                    return 'break'
                }
            })
            return newChecked
        }
    }
}
</script>

<style lang="scss" scoped>
.check-box {
    flex: 1;
    display: flex;
    align-items: center;
    line-height: 1.625rem;
    .box {
        position: relative;
        flex-shrink: 0;
        width: 0.875rem;
        height: 0.875rem;
        margin-right: 0.5rem;
        border-radius: 0.125rem;
        box-sizing: border-box;
        border: 1px solid #dcdfe6;
        cursor: pointer;
        &:hover {
            border-color: #409eff;
        }
        &::after {
            content: '';
            position: absolute;
            box-sizing: content-box;
            border: 1px solid #fff;
            border-left: 0;
            border-top: 0;
            height: 0.4375rem;
            left: 0.3125rem;
            top: 0.125rem;
            transform: rotate(45deg) scaleY(0);
            width: 0.1875rem;
            transition: transform 0.15s ease-in 0.05s;
            transform-origin: center;
        }
        // 子元素部分选中
        &.is-part-checked::before {
            content: '';
            position: absolute;
            display: block;
            background-color: #fff;
            height: 2px;
            transform: scale(0.5);
            left: 0;
            right: 0;
            top: 0.375rem;
        }
        &.is-checked {
            &::after {
                transform: rotate(45deg) scaleY(1);
            }
        }
        &.is-checked,
        &.is-part-checked {
            color: #fff;
            background-color: #409eff;
            border-color: #409eff;
            transition: all 0.25s;
            &.is-disabled {
                background: #95c9ff;
                color: #c0c4cc;
                border-color: #c0c4cc;
                cursor: not-allowed;
            }
        }
        &.is-disabled {
            background: #edf2fc;
            color: #c0c4cc;
            border-color: #c0c4cc;
            cursor: not-allowed;
        }
        &.check-over {
            cursor: not-allowed;
        }
    }
}
</style>
<style lang="scss">
.huge-tree-tooltip {
    &.el-tooltip__popper {
        border-radius: 0.25rem;
        padding: 0.625rem;
        font-size: 0.75rem;
    }
}
</style>
