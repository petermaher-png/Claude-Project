import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Recommend API — not implemented yet (Phase 1 scaffold)." },
    { status: 501 },
  );
}
