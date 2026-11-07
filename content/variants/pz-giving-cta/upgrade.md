---
zone: pz-giving-cta
eyebrow: Thank you, [[firstName]]
heading: Your first gift made a difference. Ready to double it?
body: "Your [[lastGiftAmount]] gift to the [[lastGiftFund]] helped students stay on track. Join the Connected Circle with ${{facts.giving.connectedCircle.member}} a year, or ${{facts.giving.connectedCircle.monthly}} a month."
ctas:
  - { label: "Join with ${{facts.giving.connectedCircle.member}}", href: "/giving/give/?amount={{facts.giving.connectedCircle.member|raw}}", style: navy, cta: join-connected-circle }
  - { label: "${{facts.giving.connectedCircle.monthly}} a Month", href: "/giving/give/?amount={{facts.giving.connectedCircle.monthly|raw}}&frequency=monthly", style: ghost, cta: join-connected-circle-monthly }
---
