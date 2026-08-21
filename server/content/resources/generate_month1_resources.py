"""Generates the Month 1 practice workbook and a standalone worksheet PDF
for CogniSprint. Output lands alongside this script in
server/content/resources/, ready to import with `npm run resource:import`
(see the README in this directory). Requires `pip install reportlab`.
"""
import os
import textwrap
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, ListFlowable, ListItem
)
from reportlab.lib.enums import TA_LEFT

OUT_DIR = os.path.dirname(os.path.abspath(__file__))

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="H1Brand", parent=styles["Heading1"], textColor=colors.HexColor("#1d4ed8"), spaceAfter=14))
styles.add(ParagraphStyle(name="H2Brand", parent=styles["Heading2"], textColor=colors.HexColor("#1e3a8a"), spaceBefore=18, spaceAfter=8))
styles.add(ParagraphStyle(name="Body", parent=styles["Normal"], fontSize=10.5, leading=15, spaceAfter=8))
styles.add(ParagraphStyle(name="Small", parent=styles["Normal"], fontSize=8.5, leading=12, textColor=colors.HexColor("#555555")))
styles.add(ParagraphStyle(name="DayTitle", parent=styles["Heading3"], fontSize=11, spaceBefore=10, spaceAfter=4, textColor=colors.HexColor("#111827")))

DISCLAIMER = (
    "CogniSprint is an educational skills-practice program. It does not guarantee an increase in IQ, "
    "intelligence-test scores, academic performance, professional success or medical outcomes, and it is "
    "not a substitute for medical, psychological or educational advice."
)

def draft_note(kind: str) -> str:
    return (
        f"DRAFT — pending independent educational review. This {kind} is an authored draft matching the "
        "in-app Month 1 curriculum and is not yet approved for publication or sale."
    )

def draft_banner(kind: str = "workbook"):
    return Table(
        [[Paragraph(draft_note(kind), ParagraphStyle(name="Draft", parent=styles["Small"], textColor=colors.HexColor("#92400e")))]],
        colWidths=[6.5 * inch],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fef3c7")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#f59e0b")),
            ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ]),
    )

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(colors.HexColor("#6b7280"))
    lines = textwrap.wrap(DISCLAIMER, width=118)
    y = 0.5 * inch + (len(lines) - 1) * 9
    for line in lines:
        canvas.drawString(0.75 * inch, y, line)
        y -= 9
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(letter[0] - 0.75 * inch, letter[1] - 0.6 * inch, f"Page {doc.page}")
    canvas.restoreState()

# ---------------------------------------------------------------------------
# Month 1 Practice Workbook
# ---------------------------------------------------------------------------

FOUNDATION_DAYS = [
    (1, "Build Your 15-Minute Routine", "Attach practice to an existing daily event."),
    (2, "Accuracy Before Speed", "Slow down enough to notice each decision."),
    (3, "Reflect on Errors", "Name the cause of a mistake, then write one fix."),
    (4, "Set a Realistic Daily Target", "Pick a target you can hit on a bad day."),
    (5, "Warm Up Before You Begin", "Use one easy exercise to shift your attention."),
    (6, "Design Your Practice Space", "Remove decisions standing between you and starting."),
    (7, "Your First Weekly Review", "Look back at week one honestly."),
    (8, "A First Taste of Mental Math", "Split a calculation into smaller pieces."),
    (9, "A First Taste of Memory", "Build one connecting image for a short list."),
    (10, "A First Taste of Focus", "Notice how long attention holds before it drifts."),
    (11, "A First Taste of Logic", "Separate a rule from a specific example."),
    (12, "A First Taste of Observation", "Compare two similar things one feature at a time."),
    (13, "A First Taste of Critical Thinking", "Ask what evidence a claim rests on."),
    (14, "Choosing What to Practice Next", "Decide which skill deserves extra attention."),
    (15, "Space Out Your Repetition", "Review right before you'd forget, not five times today."),
    (16, "Chunk Information Into Groups", "Split a longer sequence into small groups."),
    (17, "Test Yourself Instead of Re-Reading", "Attempt recall before checking the answer."),
    (18, "Keep a Short Error Log", "Track the type of mistake, not just that one happened."),
    (19, "Time-Box a Session", "Set a firm end time before you start."),
    (20, "Interleave Instead of Blocking", "Mix skill types in one session."),
    (21, "Your Second Weekly Review", "Check whether last week's adjustment helped."),
    (22, "Expect and Plan for Plateaus", "A quiet stretch doesn't mean practice stopped working."),
    (23, "Compare Yourself to Yesterday, Not Others", "The only fair comparison is your own earlier sessions."),
    (24, "Protect Your Streak Without Fearing a Miss", "One missed day means exactly one missed day."),
    (25, "Rest Days Are Part of the Plan", "Recovery is part of progress, not the opposite of it."),
    (26, "Treat Mistakes as Data", "A wrong answer is information about your method."),
    (27, "Find an Accountability Partner", "A small external check-in makes a habit easier to sustain."),
    (28, "Notice Your Practice Triggers", "Identify what reliably reminds you to start."),
    (29, "Set a Target for Month Two", "Use what you learned about yourself this month."),
    (30, "Foundations Complete", "Close out Month 1 and carry its habits forward."),
]

WEEKLY_REVIEW_DAYS = {7, 14, 21, 30}

def build_workbook():
    doc = SimpleDocTemplate(
        f"{OUT_DIR}/month-1-practice-workbook.pdf", pagesize=letter,
        topMargin=0.85 * inch, bottomMargin=0.85 * inch, leftMargin=0.75 * inch, rightMargin=0.75 * inch,
        title="CogniSprint Month 1 Practice Workbook", author="CogniSprint",
    )
    story = []

    story.append(Paragraph("CogniSprint", ParagraphStyle(name="Brand", parent=styles["Normal"], fontSize=14, textColor=colors.HexColor("#1d4ed8"))))
    story.append(Paragraph("Month 1 Practice Workbook", styles["H1Brand"]))
    story.append(Paragraph("Practice Foundations — a printable companion to the first 30 daily sessions", styles["Body"]))
    story.append(Spacer(1, 8))
    story.append(draft_banner())
    story.append(Spacer(1, 14))

    story.append(Paragraph("How to use this workbook", styles["H2Brand"]))
    story.append(Paragraph(
        "Each day below corresponds to that day's lesson in the CogniSprint app. Complete the digital session first, "
        "then use this page to tick the day off, write one honest reflection line, and note anything you want to "
        "remember for the weekly review. Keep entries short — a few words is enough.", styles["Body"],
    ))
    story.append(Spacer(1, 6))

    header = ["Day", "Focus", "Done", "One-line reflection"]
    rows = [header]
    for day, title, _summary in FOUNDATION_DAYS:
        rows.append([str(day), title, "", ""])
    table = Table(rows, colWidths=[0.4 * inch, 3.0 * inch, 0.5 * inch, 2.6 * inch], repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1d4ed8")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
        ("BOX", (2, 1), (2, -1), 0.8, colors.HexColor("#374151")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (2, 1), (2, -1), "CENTER"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f3f4f6")]),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(table)
    story.append(PageBreak())

    story.append(Paragraph("Weekly review pages", styles["H1Brand"]))
    story.append(Paragraph(
        "Fill these out on days 7, 14, 21 and 30, right after that day's lesson. The point isn't to grade "
        "yourself — it's to notice one specific, fixable pattern each week.", styles["Body"],
    ))
    for day, title, _s in FOUNDATION_DAYS:
        if day not in WEEKLY_REVIEW_DAYS:
            continue
        story.append(Paragraph(f"Review — Day {day}: {title}", styles["DayTitle"]))
        prompts = [
            "Which day this week was easiest to complete, and why?",
            "Which day was hardest to complete, and why?",
            "One specific, fixable adjustment for next week:",
        ]
        for prompt in prompts:
            story.append(Paragraph(f"• {prompt}", styles["Body"]))
            story.append(Spacer(1, 16))
            story.append(Table([[""]], colWidths=[6.4 * inch], rowHeights=[0.02 * inch],
                                style=TableStyle([("LINEBELOW", (0, 0), (-1, -1), 0.6, colors.HexColor("#9ca3af"))])))
            story.append(Spacer(1, 6))
        story.append(Spacer(1, 10))

    story.append(PageBreak())
    story.append(Paragraph("Your Month 2 target", styles["H1Brand"]))
    story.append(Paragraph(
        "On Day 29 you're asked to set one specific, measurable target for Month 2 based on four weeks of real "
        "practice data. Write it here so it's easy to find again.", styles["Body"],
    ))
    story.append(Spacer(1, 20))
    for label in ["Skill or habit I'll focus extra attention on:", "How I'll know it worked (be specific):"]:
        story.append(Paragraph(label, styles["Body"]))
        story.append(Spacer(1, 20))
        story.append(Table([[""]], colWidths=[6.4 * inch], rowHeights=[0.02 * inch],
                            style=TableStyle([("LINEBELOW", (0, 0), (-1, -1), 0.6, colors.HexColor("#9ca3af"))])))
        story.append(Spacer(1, 14))

    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print("wrote", f"{OUT_DIR}/month-1-practice-workbook.pdf")

# ---------------------------------------------------------------------------
# Standalone practice worksheet
# ---------------------------------------------------------------------------

def build_worksheet():
    doc = SimpleDocTemplate(
        f"{OUT_DIR}/foundations-practice-worksheet.pdf", pagesize=letter,
        topMargin=0.85 * inch, bottomMargin=0.85 * inch, leftMargin=0.75 * inch, rightMargin=0.75 * inch,
        title="CogniSprint Foundations Practice Worksheet", author="CogniSprint",
    )
    story = []
    story.append(Paragraph("CogniSprint", ParagraphStyle(name="Brand", parent=styles["Normal"], fontSize=14, textColor=colors.HexColor("#1d4ed8"))))
    story.append(Paragraph("Foundations Practice Worksheet", styles["H1Brand"]))
    story.append(Paragraph("A printable warm-up across all six practice categories — no login required.", styles["Body"]))
    story.append(Spacer(1, 8))
    story.append(draft_banner("worksheet"))
    story.append(Spacer(1, 14))

    def section(title, instructions, items):
        story.append(Paragraph(title, styles["H2Brand"]))
        story.append(Paragraph(instructions, styles["Small"]))
        story.append(Spacer(1, 4))
        flow_items = [ListItem(Paragraph(item, styles["Body"]), leftIndent=6) for item in items]
        story.append(ListFlowable(flow_items, bulletType="1", start=1))
        story.append(Spacer(1, 10))

    section(
        "1. Mental Math", "Solve each without a calculator. Show your working in the margin.",
        [
            "56 + 38 = ______",
            "91 − 47 = ______",
            "7 × 12 = ______",
            "What is 20% of 145? ______",
            "144 ÷ 12 = ______",
        ],
    )
    section(
        "2. Memory", "Study this list for 20 seconds, then cover it and write it from memory below.",
        [
            "Study: lantern, compass, ledger, kettle, anchor",
            "Write the list from memory, in order: ________________________________",
        ],
    )
    section(
        "3. Focus", "Scan the line once, left to right. Do not count twice.",
        [
            "Line: B 8 B 6 B B 3 B 0 B — how many exact letter B characters appear? ______",
            "Line: the calm dock near the calm cove by the calm shore — how many times does \"calm\" appear? ______",
        ],
    )
    section(
        "4. Logic", "Read the two statements, then write the conclusion that must follow — or write \"no conclusion\" if none does.",
        [
            "All certified inspectors carry a badge. This person carries a badge. Conclusion: ________________________________",
            "If a battery is fully charged, its light is green. The light is not green. Conclusion: ________________________________",
        ],
    )
    section(
        "5. Observation", "Circle the one code in each row that differs from the other two.",
        [
            "Row A:   K9L3       K9L3       K9L8",
            "Row B:   Q7W2       Q7M2       Q7W2",
        ],
    )
    section(
        "6. Critical Thinking", "Write one sentence identifying the flaw in each claim.",
        [
            "\"Ice cream sales and drowning incidents rise together in summer, so ice cream causes drowning.\"",
            "\"This routine has the most 5-star reviews online, so it must be the best one.\"",
        ],
    )

    story.append(PageBreak())
    story.append(Paragraph("Answer key", styles["H1Brand"]))
    answers = [
        "Mental Math — 1) 94  2) 44  3) 84  4) 29  5) 12",
        "Memory — lantern, compass, ledger, kettle, anchor (exact order)",
        "Focus — 1) 5 exact B characters  2) \"calm\" appears 3 times",
        "Logic — 1) No conclusion follows: the rule only says certified inspectors carry a badge, not that only certified inspectors do, so a badge alone doesn't prove certification.  2) The battery is not fully charged: this is a valid inference, since the light being green was guaranteed by a full charge, and it isn't green.",
        "Observation — Row A: K9L3 differs by ending in 8 instead of 3 on the third item. Row B: Q7M2 differs by using M instead of W.",
        "Critical Thinking — 1) Correlation is treated as proven causation without ruling out a shared underlying cause (like warmer weather). 2) Popularity (review count) is treated as equivalent to quality, which the evidence doesn't establish.",
    ]
    for line in answers:
        story.append(Paragraph(f"• {line}", styles["Body"]))

    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print("wrote", f"{OUT_DIR}/foundations-practice-worksheet.pdf")

if __name__ == "__main__":
    build_workbook()
    build_worksheet()
