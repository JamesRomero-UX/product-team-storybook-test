import busboy from 'busboy';
import type { IncomingHttpHeaders } from 'http';

export interface Attachment {
  fileName: string;
  mimetype: string;
  encoding: string;
  content?: Buffer;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  truncated?: any;
}

export interface MultipartData {
  [fileName: string]: Attachment | Attachment[];
}

export const parse = (
  body: string,
  headers: IncomingHttpHeaders
): Promise<MultipartData> => {
  const multipartData: { [fileName: string]: Attachment | Attachment[] } = {};

  return new Promise<MultipartData>((resolve, reject) => {
    const bb = busboy({ headers });
    bb.on('file', (name, file, info) => {
      const { filename, encoding, mimeType: mimetype } = info;
      const attachment: Attachment = {
        fileName: filename,
        mimetype,
        encoding,
      };
      const chunks: Uint8Array[] = [];
      file
        .on('data', (data) => {
          chunks.push(data);
        })
        .on('end', () => {
          attachment.content = Buffer.concat(chunks);
          if (!multipartData[name]) {
            multipartData[name] = attachment;
          } else {
            const current = multipartData[name];
            multipartData[name] = [attachment].concat(current);
          }
        });
    })
      .on('error', reject)
      .on('close', () => {
        resolve(multipartData);
      });
    // TODO charset
    bb.write(body, 'base64');
    bb.end();
  });
};
