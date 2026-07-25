import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "Suppliers API — not implemented yet (Phase 1 scaffold)." },
    { status: 501 },
  );
}
