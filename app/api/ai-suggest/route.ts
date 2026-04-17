import { NextResponse } from "next/server";

const fallback = [
  "Open the exact file you paused on and complete one function.",
  "Write one sentence that advances your task deliverable.",
  "Ship a tiny version first, then refine it.",
  "Do the smallest concrete step that produces visible progress.",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const taskName = typeof body?.taskName === "string" ? body.taskName : "";
    const seed = taskName.length % fallback.length;

    return NextResponse.json({
      nextStep: taskName
        ? `For ${taskName}, start with this: ${fallback[seed]}`
        : fallback[seed],
    });
  } catch {
    return NextResponse.json(
      { nextStep: "Pick one clear sub-step and complete it in 5 minutes." },
      { status: 200 }
    );
  }
}
