SELECT
  *
FROM
  sv_real_estate AS t1
WHERE
  (
    SELECT
      COUNT(*)
    FROM
      sv_real_estate AS t2
    WHERE
      t1.availability_type = t2.availability_type
      AND t1.name >= t2.name
  ) <= 2;

-- =====================================================
WITH ranked_houses AS (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY availability_type
      ORDER BY
        name
    ) AS rn
  FROM
    sv_real_estate
)
SELECT
  *
FROM
  ranked_houses
WHERE
  rn <= 2;
