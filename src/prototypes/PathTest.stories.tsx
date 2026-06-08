import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Prototypes/Path Test',
  tags: ['prototype'],
};
export default meta;

export const OneDrivePathConfirmed: StoryObj = {
  name: '✅ OneDrive path working',
  render: () => (
    <div style={{ fontFamily: 'Sora, sans-serif', padding: 32, maxWidth: 480 }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
      <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600 }}>
        Storybook is running from OneDrive
      </h2>
      <p style={{ margin: 0, color: '#555', fontSize: 14, lineHeight: 1.6 }}>
        This story was written to:<br />
        <code style={{ fontSize: 12, background: '#f3f3f3', padding: '2px 6px', borderRadius: 4 }}>
          OneDrive-RiskSmart/Product - Product Dream Team/<br />
          product-team-storybook/src/prototypes/
        </code>
      </p>
    </div>
  ),
};
