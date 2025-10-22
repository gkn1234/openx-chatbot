import antfu from '@antfu/eslint-config';

export default antfu({
  ignores: [
    '**/dist',
    '**/dist-test',
    '**/node_modules',
    '**/vitest-output',
  ],
  javascript: {
    overrides: {
      'prefer-promise-reject-errors': 'off',
      'no-restricted-globals': 'off',
    },
  },
  stylistic: {
    overrides: {
      'style/operator-linebreak': ['error', 'after'],
      'style/semi': ['error', 'always'],
    },
  },
  typescript: {
    tsconfigPath: 'tsconfig.eslint.json',
    overrides: {
      'ts/no-throw-literal': 'off',
      'ts/consistent-type-definitions': 'off',
    },
    // https://github.com/antfu/eslint-config/blob/main/src/configs/typescript.ts#L43
    overridesTypeAware: {
      'ts/no-unsafe-argument': 'off',
      'ts/no-unsafe-return': 'off',
      'ts/no-unsafe-assignment': 'off',
      'ts/no-unsafe-call': 'off',
      'ts/no-unsafe-member-access': 'off',
      'ts/no-floating-promises': 'off',
      'ts/strict-boolean-expressions': 'off',
      'ts/promise-function-async': 'off',
      'ts/no-misused-promises': 'off',
      'ts/return-await': 'off',
    },
  },
  vue: {
    overrides: {
      'vue/html-closing-bracket-newline': [
        'error',
        {
          singleline: 'never',
          multiline: 'never',
        },
      ],

      // 单行标签最多允许 3 个属性
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: { max: 3 },
          multiline: { max: 1 },
        },
      ],

      'vue/operator-linebreak': ['error', 'after'],

      'vue/custom-event-name-casing': ['error', 'kebab-case'],

      // 模板里面可能用到类型转换，因此关闭括号校验
      'vue/no-extra-parens': 'off',
    },
  },
  unocss: {
    attributify: true,
  },
});
