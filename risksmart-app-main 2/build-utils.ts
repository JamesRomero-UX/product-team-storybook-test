import fs from 'fs';
import path from 'path';

export function mergeFilesIntoFolder(source: string, destination: string) {
  // Make sure the source directory exists
  if (!fs.existsSync(source)) {
    console.error(`Source directory ${source} does not exist.`);

    return;
  }

  // Make sure the destination directory exists
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  // Recursively copy files from source to destination
  fs.readdirSync(source).forEach((file) => {
    const filePath = path.join(source, file);
    const destPath = path.join(destination, file);
    if (fs.lstatSync(filePath).isDirectory()) {
      mergeFilesIntoFolder(filePath, destPath);
    } else {
      fs.copyFileSync(filePath, destPath);

      /**
       * Remove .map files from the source directory so they won't be included
       * in the Lambda bundle.
       */
      if (path.extname(file) === '.map') {
        fs.unlinkSync(filePath);
      }
    }
  });
}
