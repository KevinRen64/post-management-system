ALTER TABLE Posts
  ADD COLUMN Status ENUM('Draft','Published','Archived') NOT NULL DEFAULT 'Draft' AFTER PostContent,
  ADD COLUMN IsDeleted TINYINT(1) NOT NULL DEFAULT 0 AFTER Status,
  ADD COLUMN Tags VARCHAR(255) NULL AFTER IsDeleted;

CREATE INDEX idx_posts_status ON Posts (Status);
CREATE INDEX idx_posts_postcreated ON Posts (PostCreated);
