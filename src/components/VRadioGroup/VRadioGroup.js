// Styles
import '../../stylus/components/_selection-controls.styl'
import '../../stylus/components/_radio-group.styl'

// Components
import VInput from '../VInput'

// Mixins
import Comparable from '../../mixins/comparable'
import {
  provide as RegistrableProvide
} from '../../mixins/registrable'

export default {
  name: 'v-radio-group',

  extends: VInput,

  mixins: [
    Comparable,
    RegistrableProvide('radio')
  ],

  model: {
    prop: 'value',
    event: 'change'
  },

  provide () {
    return {
      isMandatory: () => this.mandatory,
      name: () => this.name,
      validationState: () => this.validationState
    }
  },

  data: () => ({
    internalTabIndex: -1,
    radios: []
  }),

  props: {
    column: {
      type: Boolean,
      default: true
    },
    height: {
      type: [Number, String],
      default: 'auto'
    },
    mandatory: {
      type: Boolean,
      default: true
    },
    name: String,
    row: Boolean,
    // If no value set on VRadio
    // will match valueComparator
    // force default to null
    value: {
      default: null
    }
  },

  watch: {
    hasError: 'setErrorState',
    internalValue: 'setActiveRadio'
  },

  computed: {
    classes () {
      return {
        'v-input--selection-controls v-input--radio-group': true,
        'v-input--radio-group--column': this.column && !this.row,
        'v-input--radio-group--row': this.row
      }
    }
  },

  mounted () {
    this.setErrorState(this.hasError)
    this.setActiveRadio()
  },

  methods: {
    genDefaultSlot () {
      return [this.genRadioGroup()]
    },
    genRadioGroup () {
      return this.$createElement('div', {
        staticClass: 'v-input--radio-group__input',
        attrs: {
          role: 'radiogroup'
        }
      }, this.$slots.default)
    },
    onRadioChange (value) {
      if (this.disabled) return

      this.hasInput = true
      this.internalValue = value
      this.$emit('change', value)
      this.setActiveRadio()
      this.$nextTick(this.validate)
    },
    onRadioBlur (e) {
      if (!e.relatedTarget || !e.relatedTarget.classList.contains('radio')) {
        this.hasInput = true
        this.$emit('blur', e)
      }
    },
    register (radio) {
      radio.isActive = this.valueComparator(this.internalValue, radio.value)
      radio.$refs.input.tabIndex = radio.$refs.input.tabIndex > 0 ? radio.$refs.input.tabIndex : 0
      radio.$on('change', this.onRadioChange)
      radio.$on('blur', this.onRadioBlur)
      this.radios.push(radio)
    },
    setErrorState (val) {
      for (let index = this.radios.length; --index >= 0;) {
        this.radios[index].parentError = val
      }
    },
    setActiveRadio () {
      for (let index = this.radios.length; --index >= 0;) {
        const radio = this.radios[index]
        radio.isActive = this.valueComparator(this.internalValue, radio.value)
      }
    },
    unregister (radio) {
      radio.$off('change', this.onRadioChange)
      radio.$off('blur', this.onRadioBlur)

      const index = this.radios.findIndex(r => r === radio)

      /* istanbul ignore else */
      if (index > -1) this.radios.splice(index, 1)
    }
  }
}
