-- Add indicator tab settings to the tab table
INSERT INTO risksmart.tab ("ParentType", "Tabs")
VALUES (
  'indicator',
  '{"default":[{"id":"details"},{"id":"results"},{"id":"linkedItems"}]}'::jsonb
);
