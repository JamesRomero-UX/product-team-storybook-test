// Real RiskSmart RSHighcharts from
// `packages/web/src/components/highcharts/RSHighcharts.tsx` — wraps
// `highcharts-react-official` with RiskSmart-themed defaults (Sora font,
// muted axis labels, reflow-on-render for grid layouts) plus
// auto-loading of the `more`, `exporting`, and `offline-exporting`
// modules. Renders any chart type Highcharts supports.
import type { Meta, StoryObj } from '@storybook/react-vite';
// eslint-disable-next-line import/no-unresolved
import { RSHighcharts } from 'src/components/highcharts/RSHighcharts';

import '../_setup';

const meta = {
  title: 'Cloudscape Reference/Highcharts',
  component: RSHighcharts as any,
  tags: ['cloudscape-real'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: 'Real RiskSmart RSHighcharts. 1:1 with live app.' } },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = ({ children, height = 360 }: { children: React.ReactNode; height?: number }) => (
  <div
    style={{
      width: 720,
      height,
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #e5e5e5',
      padding: 16,
    }}
  >
    {children}
  </div>
);

export const BarChart: Story = {
  render: () => (
    <Frame>
      <RSHighcharts
        containerProps={{ style: { height: '100%', width: '100%' } }}
        options={{
          chart: { type: 'column' },
          title: { text: 'Open risks by severity' },
          xAxis: { categories: ['Critical', 'High', 'Medium', 'Low'] },
          yAxis: { title: { text: 'Count' } },
          legend: { enabled: false },
          series: [
            {
              type: 'column',
              name: 'Open risks',
              data: [
                { y: 8, color: '#CE1B1B' },
                { y: 14, color: '#E37373' },
                { y: 17, color: '#F2A041' },
                { y: 8, color: '#8CC862' },
              ],
            } as any,
          ],
        }}
      />
    </Frame>
  ),
};

export const LineChart: Story = {
  render: () => (
    <Frame>
      <RSHighcharts
        containerProps={{ style: { height: '100%', width: '100%' } }}
        options={{
          chart: { type: 'line' },
          title: { text: 'Risks over time' },
          xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          },
          yAxis: { title: { text: 'Open risks' } },
          series: [
            { type: 'line', name: 'All risks', color: '#0F8B7C', data: [42, 44, 47, 49, 52, 50, 47, 44, 47, 48, 47, 47] } as any,
            { type: 'line', name: 'Critical', color: '#CE1B1B', data: [4, 5, 6, 8, 9, 8, 7, 6, 7, 8, 8, 8] } as any,
          ],
        }}
      />
    </Frame>
  ),
};

export const PieChart: Story = {
  render: () => (
    <Frame>
      <RSHighcharts
        containerProps={{ style: { height: '100%', width: '100%' } }}
        options={{
          chart: { type: 'pie' },
          title: { text: 'Risk distribution by tier' },
          series: [
            {
              type: 'pie',
              name: 'Tier',
              data: [
                { name: 'Tier 1 (executive)', y: 8, color: '#CE1B1B' },
                { name: 'Tier 2 (functional)', y: 22, color: '#F2A041' },
                { name: 'Tier 3 (operational)', y: 17, color: '#8CC862' },
              ],
            } as any,
          ],
        }}
      />
    </Frame>
  ),
};
