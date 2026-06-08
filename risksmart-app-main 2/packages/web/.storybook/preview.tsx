import '../src/index.css';
import '@risksmart-app/atomic-ui/output.css';

import { createStorybookPreview } from '@risksmart-app/atomic-ui/config/storybook-preview';
import { withRouter } from 'storybook-addon-remix-react-router';

const preview = createStorybookPreview({ decorators: [withRouter] });

export default preview;
