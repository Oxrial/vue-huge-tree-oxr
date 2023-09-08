<template>
    <div :class="['check-box']" @click.stop="e => $emit('on-node-click', e)">
        <el-tooltip
            v-if="showBox"
            effect="dark"
            content="至多一次选择1000条"
            placement="top-start"
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
    line-height: 26px;
    .box {
        position: relative;
        flex-shrink: 0;
        width: 14px;
        height: 14px;
        margin-right: 8px;
        border-radius: 2px;
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
            height: 7px;
            left: 5px;
            top: 2px;
            transform: rotate(45deg) scaleY(0);
            width: 3px;
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
            top: 6px;
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
        }
        &.is-disabled {
            background: #f2f6fc;
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
