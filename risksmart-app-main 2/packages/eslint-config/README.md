# Introduction

- This package provides a set of ESLint configurations that can shared across the entire monorepo
- The configs can be found in the `configs` directory
  - `baseConfig`: The base ESLint configuration which other configs extend from
  - `commonJSConfig`: The ESLint configuration for packages that don't use ESM
  - `esmConfig`: The ESLint configuration for packages that use ESM
  - `reactConfig`: The ESLint configuration for React projects, which extends the `esmConfig`

# Usage

- To use an ESLint config in a package:
  - Install the package by including it in the `devDependencies` of the package's `package.json` file
    - `"@risksmart-app/eslint-config": "workspace:*"`
  - Create an `eslint.config.js` file in the root of the package (use the `.mjs` extension for commonJS packages)
  - Import the desired config and export it as the default export
    - For example, to use the `reactConfig`:
      ```js
      // eslint.config.js

      import reactConfig from '@risksmart-app/eslint-config/reactConfig';

      export default reactConfig;
      ```
    - Note the import path is trimmed, and can be found in the `exports` field the `package.json` file

# Adding New Rules
- To add a new rule to an existing ESLint config:
  - Open the config file in the `configs` directory
  - Add the rule to the `rules` object
    - For example, to add the `no-console` rule:
      ```js
      // configs/baseConfig.js

      export const baseConfig = {
        rules: {
          'no-console': 'warn',
          // other rules...
        },
      };
      ```
- ESLint Rules can be found in the [ESLint documentation](https://eslint.org/docs/latest/rules/)
- Plugins with v9 support can be found in the [ESLint Plugin List](https://github.com/eslint/eslint/issues/18391)


# Creating a new config
- To create a new ESLint config:
  - Create a new file in the `configs` directory
  - Import the base config and any other configs you want to extend
  - **_TIP:_** When installing new ESLint plugins, check for installation instructions for either V9+ or 'Flat Config'
  - Export the combined config as the default export
    - For example, to create a new config that extends the `baseConfig`:
      ```js
      // configs/newConfig.js

      import baseConfig from './baseConfig';

      export const newConfig = {
        ...baseConfig,
        // Add any additional rules or overrides here
      };
      ```
  - Add the new config to the `exports` field in the `package.json` file
    - For example:
      ```json
      {
        "exports": {
          "./newConfig": "./configs/newConfig.js"
        }
      }
      ```
