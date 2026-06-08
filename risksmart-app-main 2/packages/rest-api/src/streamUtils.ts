import { Readable } from 'node:stream';

export const byteToArrayToStream = (byteArray: Uint8Array) => {
  return new Readable({
    read() {
      this.push(Buffer.from(byteArray));
      this.push(null); // Signal the end of the stream
    },
  });
};
