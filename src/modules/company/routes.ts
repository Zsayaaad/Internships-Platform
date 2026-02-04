import { Router } from "express";
import {
  searchStudentsController,
  viewStudentProfileController,
  getCompanyApplicationsController,
  //   updateApplicationStatusController,
  runSelectionAlgorithmController,
} from "./controller";
import { authenticateUser, requireRole } from "../auth/shared/authService";

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// Company routes (require company role)
router.get(
  "/students/search",
  requireRole("company"),
  searchStudentsController,
);
// View student profile (auto-increments view count)
router.get(
  "/students/:studentId",
  requireRole("company"),
  viewStudentProfileController,
);

// View applications for company's internships with filtering
router.get(
  "/applications",
  requireRole("company"),
  getCompanyApplicationsController,
);

/**
 * RANKING:
 * - each internship receives applications from multiple students with varying wishes
 * - select an internship and do selection algorithm on applications that related to this internship
 * - selection algo based on each application has [ `wish order`(has highest value), `major`, `gpa` ]
 * - algorithm will calculate for each app the result rank of these 3 keys
 *
 * Selection Process:
 * - fetch all pending applications
 * - calculate total score for each application
 * - sort by score desc, then by app date (in case of a tie) First come, first served
 * - accept top n applications, where n = capacity of internship
 * - reject remaining applications
 * - update internship status to inactive
 *
 */
// Run selection algorithm for internship (accept top N, reject rest, close internship)
router.post(
  "/internships/:internshipId/run-selection",
  requireRole("company"),
  runSelectionAlgorithmController,
);

export default router;

/**
 * * -- Case 1 =>
 * --- sort apps by appliedAt asc, now it's sorted by data
 *
 * LOOP ON CAPACITY INSIDE .map(outer loop)
 * --- if all first wish && total <= capacity
 * ---- take all apps and mark all as accepted
 * ---- break;
 *
 * LOOP ON CAPACITY INSIDE .map(outer loop)
 * --- if all first wish && total > capacity
 * ---- loop to get max GPA, take it and mark as accepted
 * ------
 *
 * LOOP ON CAPACITY INSIDE .map(outer loop)
 * --- if
 *
 *
 * --- All apps contain wishOrder=1 & apps.length === capacity
 * --- take all wish=1
 * ---- if apps(wish=1).length === capacity => take all apps(wish=1) and break
 * ---- if apps(wish=1).length < capacity => take all apps(wish=1)
 * ----- look at GPA, and take the bigger app.gpa
 * ----- if same gpa, take the first appliedAt
 * ---- if if apps(wish=1).length === capacity => break
 *
 * -- Case 2 => apps for the intern more than it's capacity
 * ----
 * -- Case 3 => apps for the intern less than it's capacity
 * -- Case 4 => capacity filled with
 *
 */
