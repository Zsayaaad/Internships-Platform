import { and, count, desc, getTableColumns, ilike, or } from "drizzle-orm";
import express from "express";
import { internships } from "../db/schema";
import { db } from "../db";

const router = express.Router();

// Get all internships with optional search, filtering and pagination
router.get("/", async (req, res) => {
  try {
    const { search, major, page = 1, limit = 10 } = req.query;

    const currentPage = Math.max(1, +page);
    const limitPerPage = Math.max(1, +limit);

    // How many records to skip to get the next page
    const offset = (currentPage - 1) * limitPerPage;

    const filterConditions = [];

    // If search query exists, filter by internship title or major and probably city too
    if (search) {
      filterConditions.push(
        // or() coming from drizzle and make insensitive pattern match
        or(
          ilike(internships.title, `%${search}%`),
          ilike(internships.requiredMajor, `%${search}%`),
          ilike(internships.city, `%${search}%`),
        ),
      );
    }

    // If major filter exists, match by major name
    if (major) {
      filterConditions.push(ilike(internships.requiredMajor, `%${major}%`));
    }

    //  Combine all filters ==> AND (search match) AND (major match) ✓ correct
    const whereClause =
      filterConditions.length > 0 ? and(...filterConditions) : undefined;

    // Get the count of all elements on page
    const countResult = await db
      .select({ count: count() })
      .from(internships)
      .where(whereClause);

    const totalCount = countResult[0]?.count ?? 0; // ??0 =>  If the left is null or undefined, use 0 instead

    const internshipsList = await db
      .select({
        ...getTableColumns(internships),
      })
      .from(internships)
      .where(whereClause)
      .orderBy(desc(internships.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.status(200).json({
      data: internshipsList,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage),
      },
    });
  } catch (error) {
    console.error(`GET /internships error: ${error}`);
    res.status(500).json({ error: "Failed to get internships" });
  }
});

export default router;
