export async function getAISuggestion(taskName) {
  try {
    const response = await fetch("/api/ai-suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskName }),
    });
    if (!response.ok) {
      throw new Error("AI suggestion failed");
    }
    const data = await response.json();
    return data?.nextStep || "Continue with the smallest actionable step.";
  } catch {
    return "Continue with the smallest actionable step.";
  }
}
