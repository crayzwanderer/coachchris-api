import { db } from "./db.js";

async function getCoachIdByName(name) {
  const conn = await db();
  const [rows] = await conn.query(
    "SELECT id FROM coaches WHERE name = ? LIMIT 1",
    [name]
  );
  if (!rows.length) throw new Error(`Coach "${name}" not found`);
  return rows[0].id;
}

async function ensureTags(tagNames = []) {
  const names = [
    ...new Set(tagNames.map((t) => String(t).trim()).filter(Boolean)),
  ];
  if (!names.length) return [];
  const conn = await db();

  // find existing
  const [existing] = await conn.query(
    `SELECT id, tag FROM tags WHERE tag IN (${names.map(() => "?").join(",")})`,
    names
  );
  const have = new Map(existing.map((r) => [r.tag, r.id]));

  // create missing
  const toCreate = names.filter((n) => !have.has(n));
  if (toCreate.length) {
    const values = toCreate.map((n) => [n]);
    await conn.query(
      "INSERT IGNORE INTO tags (tag) VALUES " +
        values.map(() => "(?)").join(","),
      toCreate
    );
    // requery to get ids
    const [after] = await conn.query(
      `SELECT id, tag FROM tags WHERE tag IN (${names
        .map(() => "?")
        .join(",")})`,
      names
    );
    after.forEach((r) => have.set(r.tag, r.id));
  }

  return names.map((n) => have.get(n)).filter(Boolean);
}

export async function mysqlCreateReview({
  reviewerName,
  reviewerRole,
  rating,
  title,
  body,
  tags = [],
}) {
  const conn = await db();
  const coachId = await getCoachIdByName(
    process.env.COACH_NAME || "Coach Chris Robinson"
  );

  const [result] = await conn.query(
    `INSERT INTO reviews (coach_id, reviewer_name, reviewer_role, rating, title, body, published, source)
     VALUES (?, ?, ?, ?, ?, ?, 0, 'Web')`,
    [
      coachId,
      reviewerName.trim(),
      reviewerRole,
      Number(rating),
      title.trim(),
      body.trim(),
    ]
  );

  const reviewId = result.insertId;

  if (tags.length) {
    const tagIds = await ensureTags(tags);
    if (tagIds.length) {
      const values = tagIds.map((tagId) => [reviewId, tagId]);
      await conn.query(
        "INSERT IGNORE INTO review_tags (review_id, tag_id) VALUES " +
          values.map(() => "(?, ?)").join(","),
        values.flat()
      );
    }
  }

  await conn.query(
    `INSERT INTO audit_log (review_id, actor, action, notes) VALUES (?, ?, 'Created', 'Web submission')`,
    [reviewId, reviewerName]
  );

  // mimic Airtable shape the frontend expects from our Node route
  return {
    id: reviewId,
    fields: { "Created At": new Date().toISOString() },
  };
}

export async function mysqlListPublishedReviews({
  role,
  minRating = 1,
  limit = 20,
  search,
} = {}) {
  const conn = await db();
  const params = [];
  const where = ["r.published = 1"];

  if (minRating) {
    where.push("r.rating >= ?");
    params.push(Number(minRating));
  }
  if (role) {
    where.push("r.reviewer_role = ?");
    params.push(role);
  }
  if (search) {
    where.push(
      "(LOWER(r.title) LIKE ? OR LOWER(r.body) LIKE ? OR LOWER(r.reviewer_name) LIKE ?)"
    );
    params.push(
      `%${search.toLowerCase()}%`,
      `%${search.toLowerCase()}%`,
      `%${search.toLowerCase()}%`
    );
  }

  const [rows] = await conn.query(
    `SELECT r.id, r.reviewer_name, r.reviewer_role, r.rating, r.title, r.body, r.created_at
     FROM reviews r
     WHERE ${where.join(" AND ")}
     ORDER BY r.created_at DESC
     LIMIT ?`,
    [...params, Math.min(Number(limit || 20), 100)]
  );

  return rows.map((r) => ({
    id: r.id,
    reviewerName: r.reviewer_name,
    reviewerRole: r.reviewer_role,
    rating: r.rating,
    title: r.title,
    body: r.body,
    createdAt: r.created_at,
  }));
}

export async function mysqlGetStats() {
  const conn = await db();
  const [[counts]] = await conn.query(
    `SELECT 
       SUM(CASE WHEN published = 1 THEN 1 ELSE 0 END)   AS totalPublished,
       AVG(CASE WHEN published = 1 THEN rating END)     AS avgRating
     FROM reviews`
  );
  const [[last30]] = await conn.query(
    `SELECT COUNT(*) AS c FROM reviews 
     WHERE published = 1 AND created_at >= (NOW() - INTERVAL 30 DAY)`
  );
  const [hist] = await conn.query(
    `SELECT rating, COUNT(*) c FROM reviews WHERE published = 1 GROUP BY rating`
  );

  const histogram = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  hist.forEach((h) => {
    histogram[h.rating] = h.c;
  });

  return {
    totalPublished: Number(counts.totalPublished || 0),
    avgRating: (counts.avgRating || 0).toFixed(2),
    last30dCount: Number(last30.c || 0),
    ratingHistogram: histogram,
  };
}
