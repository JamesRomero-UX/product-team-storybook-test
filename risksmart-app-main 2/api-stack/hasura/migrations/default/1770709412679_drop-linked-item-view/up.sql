-- Migration: Drop linked_item_view
-- This view is obsolete now that bidirectional sibling records are stored in the table.
-- The view was originally created to provide bidirectional access without storing bidirectional records.

DROP VIEW IF EXISTS risksmart.linked_item_view;
