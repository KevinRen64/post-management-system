USE UserDatabase;

DROP INDEX idx_posts_status ON Posts;
DROP INDEX idx_posts_postcreated ON Posts;

ALTER TABLE Posts
  DROP COLUMN Tags,
  DROP COLUMN IsDeleted,
  DROP COLUMN Status;
