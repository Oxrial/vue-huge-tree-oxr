import { Tooltip, Input } from 'element-ui'
const requireComponents = { Tooltip, Input }
export default {
    install(Vue) {
        Object.values(requireComponents).forEach(com => Vue.component(com.name, com))
    }
}
