-- Migration: Add trigger to automatically delete empty plans
-- Run this on existing databases to add the cleanup functionality
-- This ensures that when meals are deleted, plans with no meals are also deleted

-- First, clean up any existing empty plans
DELETE FROM plans
WHERE id NOT IN (
    SELECT DISTINCT plan_id FROM meals_in_plan
);

-- Function to delete plans that have no meals
CREATE OR REPLACE FUNCTION cleanup_empty_plans()
RETURNS TRIGGER AS $$
DECLARE
    affected_plan_id UUID;
BEGIN
    -- Get the plan_id that just lost a meal
    affected_plan_id := OLD.plan_id;
    
    -- Check if this plan now has no meals left, and delete it if so
    -- The check happens after the DELETE, so we check if the plan has zero meals
    IF NOT EXISTS (
        SELECT 1 FROM meals_in_plan WHERE plan_id = affected_plan_id
    ) THEN
        DELETE FROM plans WHERE id = affected_plan_id;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger that runs after a meal is removed from a plan
-- This will clean up plans that become empty
-- When a meal is deleted, CASCADE automatically removes it from meals_in_plan,
-- and this trigger ensures empty plans are also deleted
DROP TRIGGER IF EXISTS cleanup_empty_plans_trigger ON meals_in_plan;
CREATE TRIGGER cleanup_empty_plans_trigger
AFTER DELETE ON meals_in_plan
FOR EACH ROW
EXECUTE FUNCTION cleanup_empty_plans();

