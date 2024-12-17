import antfu from '@antfu/eslint-config'

export default antfu({
  lessOpinionated: true,
  stylistic: {
    overrides: {
      'style/comma-dangle': ['error', 'never'],
      'no-console': 'warn'
    }
  },
  typescript: {
    tsconfigPath: 'tsconfig.json'
  },
  vue: {
    overrides: {
      'vue/block-order': ['error', {
        order: ['template', 'script', 'style']
      }]
    }
  }
})
