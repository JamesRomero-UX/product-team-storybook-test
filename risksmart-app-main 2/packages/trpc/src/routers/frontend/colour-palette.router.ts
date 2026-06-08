import { authedProcedure, router } from '../../init';
import { createColourPaletteService } from '../../services/frontend/index';

export const colourPaletteRouter = router({
  getColourPalettes: authedProcedure.query(async (req) => {
    const colourPaletteService = createColourPaletteService();

    return colourPaletteService.getColourPalettes({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),
});
