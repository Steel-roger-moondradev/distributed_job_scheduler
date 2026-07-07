import autocannon from "autocannon";

autocannon(
  {
    url: "http://localhost:5000/jobs/create",
    method: "POST",
    connections: 100,
    duration: 10,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Bulk Job",
      description: "Phase 12 Multiple Jobs Test",
      payload: {
        job: "bulk-test",
      },
      type: "ONCE",
    }),
  },
  console.log,
);
