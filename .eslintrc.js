module.exports = {
  extends: [
    // 添加eslint支持
    'eslint:recommended',
    // 添加vue支持
    'plugin:vue/vue3-essential',
    // 添加prettier支持
    'plugin:prettier/recommended'
  ],
  rules: {
    // 在这里添加或覆盖规则
    'prettier/prettier': 'error'
  },
  // 支持.vue文件中的html、js、css
  overrides: [
    {
      files: ['*.vue', '*.js'],
      processor: 'vue3-eslint-processor'
    }
  ]
};
