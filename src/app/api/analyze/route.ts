// CareerPilot AI — Gemini AI Analysis API Route
// POST /api/analyze
// Downloads PDF from Supabase Storage, extracts text, sends to Gemini,
// returns structured analysis and updates the analyses table.

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerSupabaseClient } from "@/lib/supabase";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";

/** Extract text from a PDF buffer using pdf-parse */
async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // pdf-parse/node is the server-side entry point (no browser/canvas deps)
    const pdfParse = await import("pdf-parse/node");
    // The module may export as default or as the function itself
    const parser = (pdfParse as unknown as { default?: (b: Buffer) => Promise<{ text: string }> }).default
      ?? (pdfParse as unknown as (b: Buffer) => Promise<{ text: string }>);
    const result = await parser(buffer);
    return result.text?.trim() ?? "";
  } catch {
    return "";
  }
}

/** Build a structured prompt for Gemini */
function buildPrompt(resumeText: string, jobTitle: string, company: string, jobDescription: string): string {
  const resumeSection = resumeText
    ? `RESUME CONTENT:\n${resumeText.slice(0, 6000)}`
    : `RESUME CONTENT:\nNo resume uploaded. Analyze based on a typical candidate profile for this role.`;

  return `You are an expert career coach and recruiter. Analyze the match between this resume and job description.

${resumeSection}

JOB TITLE: ${jobTitle}
COMPANY: ${company || "Not specified"}
JOB DESCRIPTION:
${jobDescription.slice(0, 4000)}

Respond with ONLY valid JSON (no markdown, no backticks) in this exact format:
{
  "matchScore": <integer 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "matchedSkills": ["skill1", "skill2", ...],
  "missingSkills": ["skill1", "skill2", ...],
  "experienceEvidence": ["evidence point 1", "evidence point 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}

Rules:
- matchScore: realistic score based on actual overlap
- matchedSkills: skills/technologies found in both resume and job description
- missingSkills: important skills from job description missing in resume
- experienceEvidence: specific experiences from resume relevant to this job (3-5 points)
- recommendations: actionable advice to improve match (3-5 points)
- All arrays should have 3-8 items
- Be specific and constructive`;
}

export async function POST(request: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Parse body ──────────────────────────────────────────────────────────
    const body = await request.json();
    const { analysisId, resumeId, jobTitle, company, jobDescription } = body as {
      analysisId: string;
      resumeId: string | null;
      jobTitle: string;
      company: string;
      jobDescription: string;
    };

    if (!analysisId || !jobTitle || !jobDescription) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ── Extract resume text ─────────────────────────────────────────────────
    let resumeText = "";

    if (resumeId) {
      // Check for cached extracted text first
      const { data: resume } = await supabase
        .from("resumes")
        .select("storage_path, extracted_text, file_name")
        .eq("id", resumeId)
        .eq("user_id", user.id)
        .single();

      if (resume?.extracted_text) {
        resumeText = resume.extracted_text;
      } else if (resume?.storage_path) {
        // Download from Supabase Storage
        const { data: fileData, error: downloadError } = await supabase.storage
          .from("resumes")
          .download(resume.storage_path);

        if (!downloadError && fileData) {
          const buffer = Buffer.from(await fileData.arrayBuffer());
          resumeText = await extractPdfText(buffer);

          // Cache the extracted text for future analyses
          if (resumeText) {
            await supabase
              .from("resumes")
              .update({ extracted_text: resumeText })
              .eq("id", resumeId);
          }
        }
      }
    }

    // ── Call Gemini ─────────────────────────────────────────────────────────
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "") {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = buildPrompt(resumeText, jobTitle, company, jobDescription);

    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();

    // ── Parse JSON response ─────────────────────────────────────────────────
    let analysis: {
      matchScore: number;
      summary: string;
      matchedSkills: string[];
      missingSkills: string[];
      experienceEvidence: string[];
      recommendations: string[];
    };

    try {
      // Strip markdown code fences if Gemini added them
      const cleaned = rawText.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();
      analysis = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response", raw: rawText },
        { status: 500 }
      );
    }

    // ── Validate fields ─────────────────────────────────────────────────────
    const matchScore = Math.min(100, Math.max(0, Math.round(Number(analysis.matchScore) || 0)));

    // ── Update analyses table ───────────────────────────────────────────────
    await supabase
      .from("analyses")
      .update({
        match_score: matchScore,
        matched_skills: analysis.matchedSkills ?? [],
        missing_skills: analysis.missingSkills ?? [],
        experience_evidence: analysis.experienceEvidence ?? [],
        recommendations: analysis.recommendations ?? [],
        analysis_status: "completed",
      } as never)
      .eq("id", analysisId)
      .eq("user_id", user.id);

    // ── Return result ───────────────────────────────────────────────────────
    return NextResponse.json({
      matchScore,
      summary: analysis.summary ?? "",
      matchedSkills: analysis.matchedSkills ?? [],
      missingSkills: analysis.missingSkills ?? [],
      experienceEvidence: analysis.experienceEvidence ?? [],
      recommendations: analysis.recommendations ?? [],
    });

  } catch (err) {
    console.error("[/api/analyze] Error:", err);

    // Mark analysis as failed if we have an ID
    try {
      const body = await (request.clone()).json().catch(() => ({}));
      if (body.analysisId) {
        const supabase = await createServerSupabaseClient();
        await supabase
          .from("analyses")
          .update({ analysis_status: "failed", error_message: String(err) } as never)
          .eq("id", body.analysisId);
      }
    } catch { /* ignore */ }

    return NextResponse.json(
      { error: "Analysis failed", details: String(err) },
      { status: 500 }
    );
  }
}
