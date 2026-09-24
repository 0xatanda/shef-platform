
CREATE TABLE IF NOT EXISTS focus_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,

    description TEXT NOT NULL DEFAULT '',

    image_url TEXT NOT NULL DEFAULT '',

    sort_order INTEGER NOT NULL DEFAULT 0,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_focus_areas_sort_order
    ON focus_areas(sort_order);

CREATE INDEX IF NOT EXISTS idx_focus_areas_is_active
    ON focus_areas(is_active);

INSERT INTO focus_areas
    (title, slug, description, image_url, sort_order, is_active)
VALUES
    (
        'Economic and Capacity Building Program',
        'economic-capacity-building',
        '',
        '',
        1,
        TRUE
    ),
    (
        'Policy and Advocacy Program',
        'policy-advocacy',
        '',
        '',
        2,
        TRUE
    ),
    (
        'Community Health and Environment Program',
        'community-health-environment',
        '',
        '',
        3,
        TRUE
    ),
    (
        'Housing and Community Upgrade Program',
        'housing-community-upgrade',
        '',
        '',
        4,
        TRUE
    ),
    (
        'Storytelling for Impact (Know-Your-City TV)',
        'storytelling-for-impact',
        '',
        '',
        5,
        TRUE
    ),
    (
        'Profiling and Data Collection Program',
        'profiling-data-collection',
        '',
        '',
        6,
        TRUE
    )
