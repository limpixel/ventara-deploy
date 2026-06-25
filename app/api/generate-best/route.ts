import { NextRequest, NextResponse } from "next/server";

const PYTHON_API = process.env.PYTHON_API_URL;

export async function POST(req: NextRequest) {
  const username = req.headers.get("x-username") ?? "";
  const formData = await req.formData();

  const backendForm = new FormData();
  backendForm.append("model", formData.get("model") as string);
  backendForm.append("var", formData.get("var") as string);

  const res = await fetch(`${PYTHON_API}/generate_best`, {
    method: "POST",
    headers: {
      "X-Username": username,
    },
    body: backendForm,
  });

  const data = await res.json();
  return NextResponse.json(data);
}