ALTER TABLE risksmart."impact_rating"
DROP CONSTRAINT "impact_rating_rateditemid_fkey",
ADD CONSTRAINT "impact_rating_rateditemid_fkey"
  FOREIGN KEY ("RatedItemId")
  REFERENCES risksmart.node("Id")
  ON DELETE CASCADE;
