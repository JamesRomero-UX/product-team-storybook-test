module.exports = {
  '**/*.{ts,tsx,js,jsx}': async (files) => {
    if (!files || files.length === 0) {
      return [];
    }

    const filePaths = files.map((file) => `'${file}'`).join(' ');

    return [`eslint --fix --cache --max-warnings=0 --no-warn-ignored ${filePaths}`];
  },
  '**/*.{ts,tsx,js,jsx,graphql}': 'prettier --write',
};
