

-- USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'editor', 'user')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- ASSETS TABLE 
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    asset_group_id INTEGER,
    version_number INTEGER NOT NULL,
    version_label VARCHAR(100),
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(50),
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    duration INTEGER,
    metadata_json JSONB,
    thumbnail_path TEXT,
    web_version_path TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(100) REFERENCES users(username) ON DELETE SET NULL,
    change_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- ASSET_GROUPS TABLE
CREATE TABLE asset_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    asset_type VARCHAR(20) CHECK (asset_type IN ('image', 'video', '3d')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) REFERENCES users(username) ON DELETE SET NULL,
    current_version_id INTEGER REFERENCES assets(id) ON DELETE SET NULL
);

-- Add foreign key from assets → asset_groups 
ALTER TABLE assets
ADD CONSTRAINT fk_asset_group
FOREIGN KEY (asset_group_id)
REFERENCES asset_groups(id)
ON DELETE CASCADE;

-- ASSET_TAGS TABLE
CREATE TABLE asset_tags (
    id SERIAL PRIMARY KEY,
    asset_group_id INTEGER REFERENCES asset_groups(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ACTIVITY_LOG TABLE
CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    asset_group_id INTEGER REFERENCES asset_groups(id) ON DELETE SET NULL,
    asset_version_id INTEGER REFERENCES assets(id) ON DELETE SET NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- INDEXES 

CREATE INDEX idx_assets_group_id ON assets(asset_group_id);
CREATE INDEX idx_assets_uploaded_by ON assets(uploaded_by);
CREATE INDEX idx_asset_tags_group_id ON asset_tags(asset_group_id);
CREATE INDEX idx_activity_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_asset_group ON activity_log(asset_group_id);
CREATE INDEX idx_activity_asset_version ON activity_log(asset_version_id);
