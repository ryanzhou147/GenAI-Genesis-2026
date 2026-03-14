const workflowSteps = [
  "Upload front smile, left bite, right bite, upper teeth, lower teeth, and optional LiDAR.",
  "Generate a shared patient dental model after preprocessing, detection, segmentation, and 3D reconstruction.",
  "Run the agent orchestrator so each downstream agent uses the outputs from the previous step.",
];

const agents = [
  {
    name: "1. Treatment Predictive Agent",
    goal: "Show likely treatment outcomes over time.",
    inputs: "3D dental model, crowding, bite alignment, spacing, gum health.",
    output: "Predicted smile, treatment duration, and 3D timeline slider.",
  },
  {
    name: "2. Habit Coaching Agent",
    goal: "Improve oral hygiene before issues worsen.",
    inputs: "Dental scan, plaque indicators, inflammation, tooth wear patterns.",
    output: "Daily coaching plan, hygiene score, and highlighted risk zones.",
  },
  {
    name: "3. Financial Agent",
    goal: "Estimate insurance coverage and out-of-pocket costs.",
    inputs: "Treatment recommendation, SunLife policy data, province, procedure codes.",
    output: "Coverage summary, estimated cost, and timing recommendations.",
  },
  {
    name: "4. Clinic Locator & Scheduling Agent",
    goal: "Match patients with nearby clinics that fit the treatment plan.",
    inputs: "User location, treatment recommendation, insurance compatibility, urgency.",
    output: "Clinic shortlist, availability, and booking handoff.",
  },
  {
    name: "5. Monitoring Loop",
    goal: "Track progress after treatment begins.",
    inputs: "Recurring scan uploads and treatment history.",
    output: "Updated predictions, progress checks, and refreshed recommendations.",
  },
];

const dashboardItems = [
  "Dental Health Score",
  "Predicted Smile Outcome",
  "Treatment Timeline",
  "Insurance Coverage",
  "Nearby Clinics",
  "Hygiene Tips",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <section className="border-b border-ink/10 bg-[radial-gradient(circle_at_top_left,_rgba(216,241,242,0.95),_rgba(255,250,242,1)_55%)]">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
              SunLife Hackathon Scaffold
            </p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Patient-first dental multi-agent app
            </h1>
            <p className="max-w-2xl text-base leading-7 text-ink/75 md:text-lg">
              This is a lightweight frontend shell for the upload flow, agent
              orchestrator, and final dashboard. It is intentionally static so
              we can connect FastAPI endpoints later without reworking the page
              structure.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-ink/10 bg-white p-8 shadow-soft">
            <h2 className="text-2xl font-semibold">Step 1. User Upload</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Front smile",
                "Left bite",
                "Right bite",
                "Upper teeth",
                "Lower teeth",
                "Optional LiDAR scan",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-dashed border-ink/20 bg-sky/50 px-4 py-5 text-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-ink/10 bg-ink p-8 text-white shadow-soft">
            <h2 className="text-2xl font-semibold">Shared Data Object</h2>
            <p className="mt-4 text-sm leading-6 text-white/75">
              All uploaded imagery flows into one patient dental model that
              every agent can consume.
            </p>
            <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm leading-7">
              Image preprocessing
              <br />
              Teeth detection
              <br />
              Tooth segmentation
              <br />
              3D mouth reconstruction
              <br />
              <span className="font-semibold text-mint">
                Output: Patient Dental Model
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8 md:px-10">
        <div className="rounded-[28px] border border-ink/10 bg-mint p-8 shadow-soft">
          <h2 className="text-2xl font-semibold">Step 2. Agent Orchestrator</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {workflowSteps.map((step) => (
              <div key={step} className="rounded-2xl bg-white px-5 py-6 text-sm leading-6">
                {step}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
              Agent Sections
            </p>
            <h2 className="mt-2 text-3xl font-semibold">Main app modules</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-ink/70">
            Each card is a placeholder section for the core user experience and
            can later be turned into its own route, component, or API-backed
            module.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {agents.map((agent) => (
            <section
              key={agent.name}
              className="rounded-[28px] border border-ink/10 bg-white p-8 shadow-soft"
            >
              <h3 className="text-2xl font-semibold">{agent.name}</h3>
              <div className="mt-6 space-y-4 text-sm leading-6 text-ink/80">
                <p>
                  <span className="font-semibold text-ink">Goal:</span>{" "}
                  {agent.goal}
                </p>
                <p>
                  <span className="font-semibold text-ink">Inputs:</span>{" "}
                  {agent.inputs}
                </p>
                <p>
                  <span className="font-semibold text-ink">Output:</span>{" "}
                  {agent.output}
                </p>
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <div className="rounded-[28px] border border-ink/10 bg-white p-8 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-coral">
            Final Dashboard
          </p>
          <h2 className="mt-2 text-3xl font-semibold">Everything in one place</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dashboardItems.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-ink/10 bg-sky/40 px-5 py-6"
              >
                <p className="text-lg font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
