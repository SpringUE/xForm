
const formators = {};

const __sfc__ = {
  name: "XForm",

  props: {
    // 绑定值
    modelValue: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    // 表单项配置
    schema: {
      type: Array,
      required: true,
      default: () => [],
    },
    // 表单项间距
    gutter: {
      type: Number,
      default: 20,
    },
    // 行内表单模式
    inline: {
      type: Boolean,
      default: false,
    },
    // 表单域标签的宽度，例如 '50px'。作为 Form 直接子元素的 form-item 会继承该值。支持 auto。
    labelWidth: {
      type: String,
      default: "auto",
    },
    // 表单域标签的位置，如果值为 left 或者 right 时，则需要设置 label-width
    labelPosition: {
      type: String,
      default: "auto",
    },
    // 表单域标签的后缀
    labelSuffix: {
      type: String,
      default: ":",
    },
    // 是否以行内形式展示校验信息
    inlineMessage: {
      type: Boolean,
      default: false,
    },
    // 是否展示按钮栏
    showSubmitBar: {
      type: Boolean,
      default: true,
    },
    // 查询按钮文案
    submitBtnText: {
      type: String,
      default: "查询",
    },
    // 重置按钮文案
    resetBtnText: {
      type: String,
      default: "重置",
    },
  },

  data() {
    return {
      loading: false,
      items: [],
      model: {},
      rules: {},
      comps: {
        RadioGroup: 'el-radio-group',
        CheckboxGroup: 'el-checkbox-group',
        Select: 'el-select',
      },
      depMap: {},
    };
  },

  computed: {
    formProps() {
      const {
        inline,
        labelWidth,
        labelPosition,
        labelSuffix,
        inlineMessage,
      } = this;
      return { inline, labelWidth, labelPosition, labelSuffix, inlineMessage };
    },
  },

  watch: {
    // 此处勿深度监听，对象的每个字段已分别监听
    modelValue(nv) {
      this.writeBack(nv);
    },
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      const items = (this.items = this.createFormItems(this.schema));
      this.model = this.createFormModel(items)
      this.rules = this.createFormRules(items)
      this.writeBack(this.modelValue);
      // 储存初始model
      this.__defaultModelVal = JSON.parse(JSON.stringify(this.modelValue));
      console.log("XForm", items, this.model, this.depMap);
    },

    writeBack(nv) {
      const resolveValue = (item, val) => item.syntaxData.syntaxNames ? item.syntaxData.resolve(val) : val[item.field]
      // this.model = { ...this.model, ...nv };
      this.items.forEach((x) => {
        if (x.effects?.suggest?.load) {
          if (
            nv[x.field] !== null &&
            nv[x.field] !== undefined &&
            nv[x.field] !== ""
          ) {
            const value = resolveValue(x, nv)
            x.effects.suggest.load(value, this.model, x);
          }
        }

        this.model[x.field] = resolveValue(x, nv)
      });
    },

    // 创建表单项
    createFormItems(schema) {
      // 依赖项Map
      const depMap = this.depMap;
      return schema.map((x, i) => {
        const {
          label,
          field,
          dataType,
          span,
          offset,
          offsetRight,
          rule,
          hidden,
          editor,
          effects,
          render,
          formator,
        } = x;
        const item = {
          label,
          field,
          dataType: dataType || "string",
          span: span || 8,
          offset: offset || 0,
          offsetRight: offsetRight || 0,
          ref: "formItem" + field + "" + i,
          rule,
          hidden(model, item) {
            if (!hidden) return false;
            return typeof hidden === "function"
              ? hidden(model, item)
              : !!hidden;
          },
          state: {
            hidden: false,
            disabled: false,
            hiddenWithHolder: false,
          },
          lisenters: {
            change: [],
          },
          selectItems: this.selectItems
        };

        item.editor = this.createItemEditor(item, editor);
        item.effects = this.createItemEffects(item, effects, depMap);
        item.watcher = this.createItemWatcher(item);
        item.syntaxData = this.createSyntaxData(item.field);
        item.render = render ? this.createItemRender(item, render) : null;
        item.formator = formator
          ? this.createItemFormator(item, formator)
          : null;

        return item;
      });
    },

    // 创建编辑器
    createItemEditor(item, editor) {
      if (!editor) {
        return "text";
      }
      const { component, props, events, prefix, suffix } = editor;
      const _editor = {
        component,
        props,
        events: this.createEditorEvents(item, events),
      };

      if (prefix) {
        _editor.prefix = {
          render(h) {
            return prefix(h);
          },
        };
      }

      if (suffix) {
        _editor.suffix = {
          render(h) {
            return suffix(h);
          },
        };
      }

      return _editor;
    },

    // 创建编辑器事件
    createEditorEvents(item, events = {}) {
      const { focus, change } = events;

      // 重新封装所有事件，并添加执行其他事件
      const _events = Object.entries(events).reduce((total, [name, fn]) => {
        total[name] = ($event) => {
          const model = this.getModel();
          this.runLisenters(item, name, $event);
          fn && fn($event, model, item);
        };
        return total;
      }, {});

      _events.focus = ($event) => {
        const model = this.getModel();
        this.runLisenters(item, "focus", $event);
        focus && focus($event, model, item);
      };

      _events.change = ($event) => {
        this.setModelValue(item, $event);

        if (item.effects.dependedes.size) {
          [...item.effects.dependedes].forEach((x) => {
            const item = this.items.find((y) => y.field === x);
            this.setModelValue(item, null);
            this.model[x] = null;
          });
        }

        const model = this.getModel();
        this.runLisenters(item, "change", $event);
        change && change($event, model, item);
      };

      return _events;
    },

    getDefTypeValue(dataType) {
      const typeMap = {
        string: () => "",
        number: () => 0,
        array: () => [],
        object: () => ({}),
        boolean: () => false,
      };
      return typeMap[dataType];
    },

    // 更新model值
    setModelValue(item, nv) {
      // 赋值时跳过内部监听
      item.watcher.unwatch();
      if(item.syntaxData.syntaxNames) {
        item.syntaxData.writeBack(this.modelValue, nv)
      } else {
        this.modelValue[item.field] = nv;
      }
      item.watcher.watch();
    },

    // 执行事件监听函数
    runLisenters(item, name, $event) {
      const lisenter = item.lisenters[name];
      if (lisenter) {
        const model = this.getModel();
        [].concat(lisenter || []).forEach((fn) => {
          fn && fn($event, model, item);
        });
      }
    },

    // 创建表单项Watcher
    createItemWatcher(item) {
      const target = {};
      target.watch = () => {
        // 每个表单项单独监听，避免相互影响
        target.$watcher = this.$watch(`modelValue.${item.field}`, (nv) => {
          this.model[item.field] = nv;
        });
      };
      target.unwatch = () => {
        target.$watcher && target.$watcher();
      };

      target.watch();
      return target;
    },

    // 生成解构字段名
    createSyntaxNames(strName) {
      const isValid = /\[|\{[^\[\]\{\}]+\}|\]/.test(strName);
      return isValid ? strName.match(/[^\[\]\{\},]+/g) : null;
    },

    // 生成解构功能数据
    createSyntaxData(strName) {
      let type = 'string'
      if(/\{[^\[\]\{\}]+\}/.test(strName)) {
        type = 'object'
      } 
      
      if(/\[[^\[\]\{\}]+\]/.test(strName)) {
        type = 'array'
      }

      const syntaxNames = type !== 'string' ? strName.match(/[^\[\]\{\},\s]+/g) : null
      const resolve = (source) => {
        if(!syntaxNames || !syntaxNames.length) {
          return source
        }

        if(type === 'object') {
          return syntaxNames.reduce((t, x) => {
            t[x] = source && source[x]
            return t
          }, {})
        }

        if(type === 'array') {
          return syntaxNames.map(x => source && source[x])
        }

        return source
      }
      const writeBack = (source, value) => {
        syntaxNames.forEach((name, i) => {
          let val = value
          if(type === 'object') {
            val = value && value[name]
          }
          if(type === 'array') {
            val = value[i]
          }
          source[name] = val
        })
      }

      return {
        type,
        resolve,
        writeBack,
        syntaxNames
      }
    },

    // 生成自定义渲染器
    createItemRender(item, render) {
      return {
        render(h) {
          return render(h, { item });
        },
      };
    },

    // 生成格式化渲染器
    createItemFormator(item, formator) {
      return formators[formator];
    },

    // 创建表单项关联影响
    createItemEffects(item, effects = {}, depMap = {}) {
      const _effects = {};
      const { suggest, dependency } = effects;

      if (suggest) {
        _effects.suggest = {
          trigger: 'focus',
          times: 'once',
          lazy: true,
          dataPropName: 'options',
          isOnceAlready: false,
          ...suggest,
        };

        if(dependency) {
          _effects.suggest.times = 'every'
        }
        
        const {
          loader,
          trigger,
          lazy,
          times,
          dataPropName,
          isOnceAlready,
        } = _effects.suggest;
        const load = (_effects.suggest.load = async ($event, model, item) => {
          if (times === "once" && _effects.suggest.isOnceAlready) {
            return false;
          }
          const data = loader && (await loader($event, model, item));
          item.editor.props[dataPropName] = data;
          _effects.suggest.isOnceAlready = true;
        });

        // 聚焦时加载
        // if (trigger === "focus") {
          item.lisenters.focus = [].concat(item.lisenters.focus || [], load);
        // }

        // 即时加载
        if (lazy === false) {
          load(null, this.getModel(), item);
        }
      }

      const handleDeps = (name, dependency) => {
        let deps = depMap[name];
        if (!deps) {
          deps = depMap[name] = {
            dependency,
            dependedes: new Set(),
          };
        }
        return deps;
      };

      // 依赖项
      const deps = handleDeps(item.field, dependency);
      if (dependency) {
        _effects.dependency = dependency;
        const loopHandler = (name, childName) => {
          const parentItem = handleDeps(name);
          parentItem.dependedes.add(childName);
          if (parentItem.dependency) {
            loopHandler(parentItem.dependency, childName);
          }
        };
        loopHandler(dependency, item.field);
      }

      // 被依赖项
      _effects.dependedes = deps.dependedes;

      return _effects;
    },

    // 创建表单模型
    createFormModel(items) {
      return items.reduce((total, x) => {
        total[x.field] = null;
        return total;
      }, {});
    },

    // 创建表单规则
    createFormRules(items) {
      return items.reduce((total, x) => {
        total[x.field] = x.rule;
        return total;
      }, {});
    },

    addItemLisenter(item, name, fn) {
      if (!item.lisenters[name]) {
        item.lisenters[name] = [];
      }
      item.lisenters[name].push(fn);
    },

    // [对外开放方法]选择一些表单项并进行操作(英文,分隔)
    selectItems(strFields = "") {
      const vm = this;
      const fields = strFields.split(",");
      const items = this.items.filter((x) => fields.includes(x.field));

      const handler = {
        on(name, fn) {
          items.forEach((x) => {
            vm.addItemLisenter(x, name, fn);
          });
          return handler;
        },
        value(nv) {
          items.forEach((x) => {
            vm.setModelValue(x, nv);
            vm.model[x.field] = nv;
          });
          return handler;
        },
        required(nv) {
          return items.map((x) => {
            const rule = [].concat(x.rule || []).find(y => y.required !== undefined)
            rule && (rule.required = nv)
          });
        },
        getRefs() {
          return items.map((x) => vm.$refs[x.ref]);
        },
        hidden(nv) {
          items.forEach((x) => {
            x.state.hidden = nv;
          });
          return handler;
        },
        hiddenWithHolder(nv) {
          items.forEach((x) => {
            x.state.hiddenWithHolder = nv;
          });
          return handler;
        },
        setEditorProp(prop, nv) {
          items.forEach((x) => {
            x.editor.props[prop] = nv;
          });
          return handler;
        },
      };

      return handler;
    },

    getModel() {
      return this.model;
    },

    onSubmit() {
      this.$emit("submit", this.model);
    },

    onReset() {
      this.$refs.form.resetFields();
      const model = { ...this.__defaultModelVal };
      // this.model = model
      this.$emit("input", model);
    },

    validate(cb) {
      return this.$refs.form.validate(cb);
    },

    formEl() {
      return this.$refs.form;
    },
  },
};

import { renderList as _renderList, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock, createCommentVNode as _createCommentVNode, resolveDynamicComponent as _resolveDynamicComponent, createBlock as _createBlock, toDisplayString as _toDisplayString, createTextVNode as _createTextVNode, resolveComponent as _resolveComponent, withCtx as _withCtx, toHandlers as _toHandlers, mergeProps as _mergeProps, createVNode as _createVNode, createElementVNode as _createElementVNode, normalizeClass as _normalizeClass } from "vue"

const _hoisted_1 = { class: "x-form" }
const _hoisted_2 = { class: "x-form-item-component" }
const _hoisted_3 = {
  key: 0,
  class: "x-form-submitbar"
}
function render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_el_radio = _resolveComponent("el-radio")
  const _component_el_radio_group = _resolveComponent("el-radio-group")
  const _component_el_checkbox = _resolveComponent("el-checkbox")
  const _component_el_checkbox_group = _resolveComponent("el-checkbox-group")
  const _component_el_option = _resolveComponent("el-option")
  const _component_el_select = _resolveComponent("el-select")
  const _component_el_form_item = _resolveComponent("el-form-item")
  const _component_el_col = _resolveComponent("el-col")
  const _component_el_row = _resolveComponent("el-row")
  const _component_el_button = _resolveComponent("el-button")
  const _component_el_form = _resolveComponent("el-form")

  return (_openBlock(), _createElementBlock("div", _hoisted_1, [
    _createVNode(_component_el_form, _mergeProps({ ref: "form" }, $options.formProps, {
      model: $data.model,
      rules: $data.rules
    }), {
      default: _withCtx(() => [
        _createVNode(_component_el_row, { gutter: $props.gutter }, {
          default: _withCtx(() => [
            (_openBlock(true), _createElementBlock(_Fragment, null, _renderList($data.items, (item, index) => {
              return (_openBlock(), _createBlock(_component_el_col, {
                key: item.field + '.' + index,
                span: item.hidden($data.model, item) || item.state.hidden ? 0 : item.span,
                xs: 24,
                offset: item.offset,
                class: _normalizeClass(item.offsetRight ? 'form-col-offset-right-' + item.offsetRight : '')
              }, {
                default: _withCtx(() => [
                  (
            !item.hidden($data.model, item) &&
            !item.state.hidden &&
            !item.state.hiddenWithHolder)
                    ? (_openBlock(), _createBlock(_component_el_form_item, {
                        key: 0,
                        label: item.label,
                        prop: item.field,
                        rules: item.rule,
                        class: _normalizeClass({
              'x-form-flex-item': item.editor.prefix || item.editor.suffix,
            })
                      }, {
                        default: _withCtx(() => [
                          _createCommentVNode(" 前置组件 "),
                          (item.editor.prefix)
                            ? (_openBlock(), _createBlock(_resolveDynamicComponent(item.editor.prefix), { key: 0 }))
                            : _createCommentVNode("v-if", true),
                          _createCommentVNode(" 文本展示 "),
                          (!item.editor || item.editor.component === 'text')
                            ? (_openBlock(), _createElementBlock("span", {
                                key: 1,
                                ref_for: true,
                                ref: item.ref,
                                class: "x-form-item-text"
                              }, _toDisplayString($data.model[item.field]), 513 /* TEXT, NEED_PATCH */))
                            : (_openBlock(), _createElementBlock(_Fragment, { key: 2 }, [
                                _createCommentVNode(" 一般输入组件 "),
                                _createElementVNode("div", _hoisted_2, [
                                  _createCommentVNode(" 单选 "),
                                  (item.editor.component === 'el-radio-group')
                                    ? (_openBlock(), _createBlock(_component_el_radio_group, _mergeProps({
                                        key: 0,
                                        ref_for: true,
                                        ref: item.ref,
                                        modelValue: $data.model[item.field],
                                        "onUpdate:modelValue": $event => (($data.model[item.field]) = $event)
                                      }, item.editor.props, _toHandlers(item.editor.events)), {
                                        default: _withCtx(() => [
                                          (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(item.editor.props.options, (radio) => {
                                            return (_openBlock(), _createBlock(_component_el_radio, {
                                              key: radio.value,
                                              label: radio.value,
                                              disabled: radio.disabled
                                            }, {
                                              default: _withCtx(() => [
                                                _createTextVNode(_toDisplayString(radio.label), 1 /* TEXT */)
                                              ]),
                                              _: 2 /* DYNAMIC */
                                            }, 1032 /* PROPS, DYNAMIC_SLOTS */, ["label", "disabled"]))
                                          }), 128 /* KEYED_FRAGMENT */))
                                        ]),
                                        _: 2 /* DYNAMIC */
                                      }, 1040 /* FULL_PROPS, DYNAMIC_SLOTS */, ["modelValue", "onUpdate:modelValue"]))
                                    : (item.editor.component === 'el-checkbox-group')
                                      ? (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
                                          _createCommentVNode(" 复选 "),
                                          _createVNode(_component_el_checkbox_group, _mergeProps({
                                            ref_for: true,
                                            ref: item.ref,
                                            modelValue: $data.model[item.field],
                                            "onUpdate:modelValue": $event => (($data.model[item.field]) = $event)
                                          }, item.editor.props, _toHandlers(item.editor.events)), {
                                            default: _withCtx(() => [
                                              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(item.editor.props.options, (checkbox) => {
                                                return (_openBlock(), _createBlock(_component_el_checkbox, {
                                                  key: checkbox.value,
                                                  label: checkbox.value,
                                                  name: item.field
                                                }, {
                                                  default: _withCtx(() => [
                                                    _createTextVNode(_toDisplayString(checkbox.label), 1 /* TEXT */)
                                                  ]),
                                                  _: 2 /* DYNAMIC */
                                                }, 1032 /* PROPS, DYNAMIC_SLOTS */, ["label", "name"]))
                                              }), 128 /* KEYED_FRAGMENT */))
                                            ]),
                                            _: 2 /* DYNAMIC */
                                          }, 1040 /* FULL_PROPS, DYNAMIC_SLOTS */, ["modelValue", "onUpdate:modelValue"])
                                        ], 2112 /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */))
                                      : _createCommentVNode("v-if", true),
                                  _createCommentVNode(" 下拉 "),
                                  (item.editor.component === 'el-select')
                                    ? (_openBlock(), _createBlock(_component_el_select, _mergeProps({
                                        key: 2,
                                        ref_for: true,
                                        ref: item.ref,
                                        modelValue: $data.model[item.field],
                                        "onUpdate:modelValue": $event => (($data.model[item.field]) = $event)
                                      }, item.editor.props, _toHandlers(item.editor.events)), {
                                        default: _withCtx(() => [
                                          (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(item.editor.props.options, (option) => {
                                            return (_openBlock(), _createBlock(_component_el_option, {
                                              key: option.value,
                                              label: option.label,
                                              value: option.value
                                            }, null, 8 /* PROPS */, ["label", "value"]))
                                          }), 128 /* KEYED_FRAGMENT */))
                                        ]),
                                        _: 2 /* DYNAMIC */
                                      }, 1040 /* FULL_PROPS, DYNAMIC_SLOTS */, ["modelValue", "onUpdate:modelValue"]))
                                    : (_openBlock(), _createElementBlock(_Fragment, { key: 3 }, [
                                        _createCommentVNode(" 其他所有组件 "),
                                        (_openBlock(), _createBlock(_resolveDynamicComponent(item.editor.component), _mergeProps({
                                          ref_for: true,
                                          ref: item.ref,
                                          modelValue: $data.model[item.field],
                                          "onUpdate:modelValue": $event => (($data.model[item.field]) = $event)
                                        }, item.editor.props, _toHandlers(item.editor.events)), null, 16 /* FULL_PROPS */, ["modelValue", "onUpdate:modelValue"]))
                                      ], 2112 /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */))
                                ])
                              ], 2112 /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */)),
                          _createCommentVNode(" 后置组件 "),
                          (item.editor.suffix)
                            ? (_openBlock(), _createBlock(_resolveDynamicComponent(item.editor.suffix), { key: 3 }))
                            : _createCommentVNode("v-if", true)
                        ]),
                        _: 2 /* DYNAMIC */
                      }, 1032 /* PROPS, DYNAMIC_SLOTS */, ["label", "prop", "rules", "class"]))
                    : _createCommentVNode("v-if", true),
                  (item.state.hiddenWithHolder)
                    ? (_openBlock(), _createElementBlock("div", {
                        key: 1,
                        ref_for: true,
                        ref: item.ref,
                        class: "x-form-item-holder"
                      }, null, 512 /* NEED_PATCH */))
                    : _createCommentVNode("v-if", true)
                ]),
                _: 2 /* DYNAMIC */
              }, 1032 /* PROPS, DYNAMIC_SLOTS */, ["span", "offset", "class"]))
            }), 128 /* KEYED_FRAGMENT */))
          ]),
          _: 1 /* STABLE */
        }, 8 /* PROPS */, ["gutter"]),
        ($props.showSubmitBar)
          ? (_openBlock(), _createElementBlock("div", _hoisted_3, [
              _createVNode(_component_el_button, {
                type: "primary",
                onClick: $options.onSubmit
              }, {
                default: _withCtx(() => [
                  _createTextVNode(_toDisplayString($props.submitBtnText), 1 /* TEXT */)
                ]),
                _: 1 /* STABLE */
              }, 8 /* PROPS */, ["onClick"]),
              _createVNode(_component_el_button, { onClick: $options.onReset }, {
                default: _withCtx(() => [
                  _createTextVNode(_toDisplayString($props.resetBtnText), 1 /* TEXT */)
                ]),
                _: 1 /* STABLE */
              }, 8 /* PROPS */, ["onClick"])
            ]))
          : _createCommentVNode("v-if", true)
      ]),
      _: 1 /* STABLE */
    }, 16 /* FULL_PROPS */, ["model", "rules"])
  ]))
}
__sfc__.render = render
__sfc__.__file = "XForm.vue"
export default __sfc__