import { readdir, readFile, writeFile } from 'fs/promises';
import { mergeResourcesAsInterface } from 'i18next-resources-for-ts';

const OUT_PATH = './src/@types/resources.d.ts';
const IN_PATH = '../components/taxonomy/locales/default/en';

const main = async () => {
  const fileNames = await readdir(IN_PATH, {
    withFileTypes: true,
  });

  const namespaces = fileNames
    .filter((dirent) => dirent.isFile())
    .filter((file) => file.name.endsWith('.json'))
    .map((file) => file.name.replace('.json', ''));

  const resources = namespaces.map(async (namespace) => {
    const filePath = `${IN_PATH}/${namespace}.json`;
    // no-dd-sa
    const data = await readFile(filePath, 'utf-8');
    try {
      return {
        name: namespace,
        resources: JSON.parse(data),
      };
    } catch {
      console.log('Unable to parse JSON');
    }
  });
  const x = await Promise.all(resources);
  const cleaned = x.map((resource) => {
    if (resource.name === 'library' || resource.name === 'ratings') {
      const libraryKeys = Object.keys(resource.resources);
      resource.resources = Object.assign(
        {},
        ...libraryKeys.map((k) => ({ [k]: [] }))
      );
    }

    return resource;
  });
  const out = mergeResourcesAsInterface(cleaned);

  await writeFile(OUT_PATH, out);
};

(async () => {
  try {
    await main();
  } catch (e) {
    console.error(e);
  }
})();
