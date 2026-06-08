export default {
  '**/*.{ts,tsx,js,jsx}': async (files) => {
    if (!files || files?.length === 0) {
      return [];
    }

    const filePaths = files.map((file) => `'${file}'`).join(' ');

    return [`eslint --fix --max-warnings=0 --no-warn-ignored ${filePaths}`];
  },
};
