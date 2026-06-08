import { authedProcedure, router } from '../../init';
import { createBusinessAreaService } from '../../services/frontend/index';
export const businessAreaRouter = router({
  businessAreas: authedProcedure.query(async (req) => {
    const businessAreaService = createBusinessAreaService();

    return businessAreaService.getBusinessAreas(req.ctx.user);
  }),
});
