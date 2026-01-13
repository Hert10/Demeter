import BaseLayout from '../baseLayout';
import { protect } from '../../utils/auth-utils';

export default async function Help() {
  const { user } = await protect();

  return (
    <BaseLayout isAuthenticated={true} username={user.username}>
      <div className="container mt-5">
        <h1 className="text-center display-4 mb-5">🌾 User Guide</h1>

        <div className="row gy-4">

          {/* Risk Sections */}
          {[
            {
              title: "SLIGHT DROUGHT RISK 🔥",
              meaning: "Minor dryness — crops may start needing a little extra water soon.",
              action: "Monitor soil moisture and prepare irrigation if dry conditions continue.",
              color: "warning",
            },
            {
              title: "MODERATE DROUGHT RISK 🔥🔥",
              meaning: "Noticeable lack of rain — stress on crops and soil starting.",
              action: "Begin water conservation measures, adjust planting schedules, and protect young plants.",
              color: "warning",
            },
            {
              title: "SEVERE DROUGHT RISK 🔥🔥🔥",
              meaning: "Serious drought — high risk of crop losses without intervention.",
              action: "Prioritize irrigation, use drought-tolerant varieties, limit new planting.",
              color: "danger",
            },
            {
              title: "SLIGHT FLOOD RISK 🌊",
              meaning: "Some excess rainfall — wet soil, minor flood possibility.",
              action: "Check drainage systems and be alert for early signs of water pooling.",
              color: "info",
            },
            {
              title: "MODERATE FLOOD RISK 🌊🌊",
              meaning: "Significant rainfall likely — fields may flood partially.",
              action: "Protect sensitive crops, improve field drainage, and move equipment to safe zones.",
              color: "info",
            },
            {
              title: "SEVERE FLOOD RISK 🌊🌊🌊",
              meaning: "Major flood threat — potential for heavy damage to crops and infrastructure.",
              action: "Evacuate vulnerable areas, build barriers, delay planting, harvest early if possible.",
              color: "danger",
            },
            {
              title: "NORMAL 🌤️",
              meaning: "Conditions are balanced — rainfall and temperature are typical.",
              action: "Continue regular farming activities and monitor for changes.",
              color: "success",
            },
          ].map((item, index) => (
            <div className="col-12" key={index}>
              <div className={`card border-${item.color} shadow-sm`}>
                <div className={`card-header bg-${item.color} text-white`}>
                  <h5 className="mb-0">{item.title}</h5>
                </div>
                <div className="card-body">
                  <p><strong>🌱 What it means:</strong> {item.meaning}</p>
                  <p><strong>📈 Action:</strong> {item.action}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Reminder Section */}
          <div className="col-12">
            <div className="alert alert-primary mt-5" role="alert">
              <h4 className="alert-heading">Remember:</h4>
              <ul className="mt-3">
                <li><strong>Condition:</strong> Situation detected</li>
                <li><strong>Confidence %:</strong> How sure the system is</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </BaseLayout>
  );
}
