module.exports = {
  extends: [
    'eslint:recommended'
  ],
  plugins: [
    'solid'
  ],
  rules: {
    // Detect expensive operations
    'no-loop-func': 'error', // Functions in loops are expensive
    'no-implied-eval': 'error', // eval() is extremely expensive
    'no-new-func': 'error', // new Function() is expensive
    
    // SolidJS specific performance rules
    'solid/reactivity': 'error', // Detect reactivity issues
    'solid/no-destructure': 'warn', // Destructuring breaks reactivity
    'solid/prefer-for': 'warn', // For loops are more performant than map
    
    // General performance anti-patterns
    'prefer-const': 'error', // const is more optimizable
    'no-var': 'error', // let/const are more optimizable than var
    'prefer-template': 'warn', // Template literals are faster than concatenation
    
    // Detect potentially expensive regex
    'no-regex-spaces': 'error',
    
    // Memory leak detection
    'no-global-assign': 'error',
    'no-implicit-globals': 'error',
    
    // Async performance
    'require-await': 'error', // Detect unnecessary async functions
    'no-return-await': 'error', // Unnecessary await in return
  },
  
  // Custom rules for detecting expensive operations
  overrides: [
    {
      files: ['**/*.jsx', '**/*.tsx'],
      rules: {
        // Custom performance checks
        'no-array-constructor': 'error', // Array() is slower than []
        'prefer-spread': 'warn', // Spread is often more performant
      }
    }
  ]
}; 