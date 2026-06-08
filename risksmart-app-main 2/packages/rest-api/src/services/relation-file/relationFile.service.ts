import { RelationFileRepository } from 'src/repositories/relation-file/relationFile.repository';

import type { ServiceOptions } from '../types';

export const RelationFileService = (opts: ServiceOptions) => {
  const relationFileRepo = RelationFileRepository(opts);

  return {
    async findAllByParentId(id: string) {
      const relationFiles = await relationFileRepo.findWhere({
        ParentId: { _eq: id },
      });

      return relationFiles;
    },
  };
};
