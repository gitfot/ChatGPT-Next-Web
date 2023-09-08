import { NextRequest } from "next/server";

import { requestCommon } from "../common";
// import type { Response } from "../common";

async function handle(req: NextRequest) {
  return await requestCommon(req);
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";
