ALTER TABLE risksmart.assessment_result_parent
ADD CONSTRAINT "assessment_result_parent_result_type_fkey" FOREIGN KEY ("ResultType") REFERENCES risksmart.parent_type("Value");

ALTER TABLE risksmart.assessment_result_parent
ADD CONSTRAINT "assessment_result_parent_parent_type_fkey" FOREIGN KEY ("ParentType") REFERENCES risksmart.parent_type("Value");