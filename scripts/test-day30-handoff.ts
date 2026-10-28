import { INITIAL_JOURNEYS } from "../src/components/journey/journeyInitialData";
import { EmployeeJourney, Day30TrainerHandoff } from "../src/components/journey/journeyTypes";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${msg}`);
    failed++;
  }
}

console.log("=== Testing Day 30 Trainer → Team Leader Handoff Feature ===");

// Test Group 1: Initial Seed State
console.log("\nTest Group 1: Seed Data Verification");
const alyssa = INITIAL_JOURNEYS.find(j => j.id === "SIBS-2901");
assert(!!alyssa, "Alyssa Rivera (SIBS-2901) exists in cohort");
assert(alyssa?.daysElapsed === 27, "Alyssa is at Day 27/90 (approaching Day 30 Checkpoint)");
assert(alyssa?.day30Handoff?.status === "Pending", "Alyssa has day30Handoff status 'Pending'");
assert(alyssa?.day30Handoff?.trainerName === "Maria Cruz", "Alyssa's handoff has trainer Maria Cruz");
assert(alyssa?.day30Handoff?.targetTlName === "Anton Reyes", "Alyssa's handoff has target TL Anton Reyes");

const marco = INITIAL_JOURNEYS.find(j => j.id === "SIBS-2902");
assert(marco?.day30Handoff?.status === "Accepted", "Marco Santos has completed and accepted Day 30 handoff");
assert(!!marco?.day30Handoff?.acceptedBy, "Marco's handoff records accepting TL");

const omar = INITIAL_JOURNEYS.find(j => j.id === "SIBS-2906");
assert(omar?.day30Handoff?.status === "Submitted", "Omar Perez has submitted handoff awaiting TL acceptance");

// Test Group 2: Pending Count Calculation
console.log("\nTest Group 2: Pending Handoffs Calculation");
const getPendingCount = (journeys: EmployeeJourney[]) => {
  return journeys.filter(j => {
    const days = j.daysElapsed || 1;
    const handoff = j.day30Handoff || j.day30?.handoff;
    return days >= 20 && (!handoff || handoff.status !== "Accepted");
  }).length;
};

const initialPendingCount = getPendingCount(INITIAL_JOURNEYS);
assert(initialPendingCount > 0, `Pending handoffs count correctly identified (${initialPendingCount} pending)`);
assert(INITIAL_JOURNEYS.some(j => (j.daysElapsed || 1) >= 20 && j.day30Handoff?.status === "Pending"), "Finds pending handoffs due for Day 30");

// Test Group 3: Trainer Submission / Endorsement Workflow
console.log("\nTest Group 3: Trainer Endorsement Mutation");
let simulatedJourneys = JSON.parse(JSON.stringify(INITIAL_JOURNEYS)) as EmployeeJourney[];

function simulateTrainerSubmit(journeyId: string, updates: Partial<Day30TrainerHandoff>) {
  simulatedJourneys = simulatedJourneys.map(j => {
    if (j.id !== journeyId) return j;
    const current = j.day30Handoff || j.day30?.handoff;
    const newHandoff: Day30TrainerHandoff = {
      status: "Submitted",
      trainerName: updates.trainerName || j.trainerName || "Maria Cruz",
      targetTlName: updates.targetTlName || j.tl || "Anton Reyes",
      submittedAt: "2026-10-18 10:00 AM",
      readinessRating: updates.readinessRating || "Floor Ready",
      coreStrengths: updates.coreStrengths || ["Customer Communication", "Systems Navigation"],
      focusAreas: updates.focusAreas || ["AHT Pacing"],
      trainerNotes: updates.trainerNotes || "Trainer endorsed.",
      fstScore: 84,
      pstScore: 88,
      qaScore: 85,
      attendanceRate: 98,
      ...current,
      ...updates,
      status: "Submitted"
    };
    return {
      ...j,
      day30Handoff: newHandoff,
      day30: { ...j.day30, handoff: newHandoff }
    };
  });
}

simulateTrainerSubmit("SIBS-2901", {
  readinessRating: "Floor Ready",
  coreStrengths: ["High Empathy", "Quick Systems Navigation"],
  focusAreas: ["AHT Pacing during complex visa inquiries"],
  trainerNotes: "Ready for floor operations with bi-weekly AHT spot checks."
});

const updatedAlyssa = simulatedJourneys.find(j => j.id === "SIBS-2901");
assert(updatedAlyssa?.day30Handoff?.status === "Submitted", "Alyssa's handoff transitioned to 'Submitted'");
assert(updatedAlyssa?.day30Handoff?.readinessRating === "Floor Ready", "Readiness rating correctly updated to 'Floor Ready'");
assert(updatedAlyssa?.day30Handoff?.coreStrengths.includes("High Empathy") === true, "Core strengths preserved");

// Test Group 4: Team Leader Acceptance Workflow
console.log("\nTest Group 4: Team Leader Acceptance Mutation");
function simulateTLAcknowledgment(journeyId: string, acceptedBy: string, notes?: string) {
  simulatedJourneys = simulatedJourneys.map(j => {
    if (j.id !== journeyId) return j;
    const current = j.day30Handoff || j.day30?.handoff;
    const updated: Day30TrainerHandoff = {
      status: "Accepted",
      trainerName: current?.trainerName || j.trainerName || "Maria Cruz",
      targetTlName: current?.targetTlName || j.tl || "Anton Reyes",
      readinessRating: current?.readinessRating || "Floor Ready",
      coreStrengths: current?.coreStrengths || [],
      focusAreas: current?.focusAreas || [],
      trainerNotes: current?.trainerNotes || "",
      submittedAt: current?.submittedAt || "2026-10-18 10:00 AM",
      acceptedAt: "2026-10-18 02:30 PM",
      acceptedBy,
      tlAcceptanceNotes: notes || "Team Leader accepted operational custody of employee.",
      ...current,
      status: "Accepted"
    };
    return {
      ...j,
      day30Handoff: updated,
      day30: { ...j.day30, status: "Completed", completedDate: "2026-10-18", handoff: updated }
    };
  });
}

simulateTLAcknowledgment("SIBS-2901", "Anton Reyes (Team Leader)", "Accepted into Pod 4 queue. Assuming operational supervision.");
const acceptedAlyssa = simulatedJourneys.find(j => j.id === "SIBS-2901");
assert(acceptedAlyssa?.day30Handoff?.status === "Accepted", "Alyssa's handoff transitioned to 'Accepted'");
assert(acceptedAlyssa?.day30Handoff?.acceptedBy === "Anton Reyes (Team Leader)", "Recorded accepting Team Leader name");
assert(acceptedAlyssa?.day30?.status === "Completed", "Day 30 milestone marked Completed upon handoff acceptance");

const finalPendingCount = getPendingCount(simulatedJourneys);
assert(finalPendingCount === initialPendingCount - 1, `Pending count reduced by 1 (from ${initialPendingCount} to ${finalPendingCount})`);

console.log(`\n=======================================================`);
console.log(`DAY 30 HANDOFF TESTS: TOTAL ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log(`=======================================================`);

if (failed > 0) {
  process.exit(1);
}
