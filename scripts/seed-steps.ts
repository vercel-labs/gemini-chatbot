/**
 * scripts/seed-steps.ts
 *
 * Seeds the OnboardingStep table with department-specific onboarding tasks
 * for all 11 departments and 7 role levels in E.U.Z Energy Construction.
 *
 * Run with: npx tsx scripts/seed-steps.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { onboardingStep } from "../db/onboarding-schema";
import { getPostgresUrl } from "../lib/db-url";

const client = postgres(getPostgresUrl());
const db = drizzle(client);

type StepDef = {
    department: string;
    roleLevel: string | null; // null = all role levels in this dept
    stepOrder: number;
    title: string;
    description: string;
    category: string;
    isRequired?: boolean;
};

// ─── Step Definitions ─────────────────────────────────────────────────────────

const STEPS: StepDef[] = [
    // ── GLOBAL (all departments) ─────────────────────────────────────────────
    ...[
        "Executive / C-Suite",
        "Engineering & Design",
        "Project Management",
        "Health, Safety & Environment (HSE)",
        "Procurement & Supply Chain",
        "Finance & Accounting",
        "Human Resources",
        "IT & Digital",
        "Field Operations / Construction",
        "Legal & Compliance",
        "Facilities / Cleaners & Support Staff",
    ].flatMap((dept) => [
        {
            department: dept,
            roleLevel: null,
            stepOrder: 1,
            title: "Confirm Employment Documentation",
            description:
                "Review and sign your offer letter, employment contract, and any associated annexures. Submit copies to Human Resources.",
            category: "HR & Compliance",
            isRequired: true,
        },
        {
            department: dept,
            roleLevel: null,
            stepOrder: 2,
            title: "Complete Company Induction",
            description:
                "Attend or complete the E.U.Z company-wide induction covering mission, values, organisational structure, and code of conduct.",
            category: "HR & Compliance",
            isRequired: true,
        },
        {
            department: dept,
            roleLevel: null,
            stepOrder: 3,
            title: "IT System Access Provisioning",
            description:
                "Submit IT access request form. Obtain corporate email, VPN credentials, and access to required enterprise systems.",
            category: "IT & Systems",
            isRequired: true,
        },
        {
            department: dept,
            roleLevel: null,
            stepOrder: 4,
            title: "Security & Data Privacy Briefing",
            description:
                "Complete the cybersecurity awareness and data privacy (GDPR) briefing. Acknowledge the IT Acceptable Use Policy.",
            category: "IT & Systems",
            isRequired: true,
        },
        {
            department: dept,
            roleLevel: null,
            stepOrder: 5,
            title: "Review E.U.Z HSE Policy",
            description:
                "Read and acknowledge the company Health, Safety & Environment policy. Confirm understanding of emergency procedures.",
            category: "Health & Safety",
            isRequired: true,
        },
    ]),

    // ── ENGINEERING & DESIGN ─────────────────────────────────────────────────
    {
        department: "Engineering & Design",
        roleLevel: null,
        stepOrder: 6,
        title: "Engineering Standards & Codes Briefing",
        description:
            "Review the applicable engineering standards: IEC 61000 series, IEEE, and ISO design codes relevant to your discipline.",
        category: "Technical Onboarding",
        isRequired: true,
    },
    {
        department: "Engineering & Design",
        roleLevel: null,
        stepOrder: 7,
        title: "CAD / BIM Tool Access & Training",
        description:
            "Request access to CAD/BIM tools (AutoCAD, Revit, or AVEVA). Complete platform orientation with your supervisor.",
        category: "Technical Onboarding",
        isRequired: true,
    },
    {
        department: "Engineering & Design",
        roleLevel: null,
        stepOrder: 8,
        title: "Document Control & ECM Process",
        description:
            "Understand the Engineering Change Management (ECM) process and document control procedures. Register in the document management system.",
        category: "Technical Onboarding",
        isRequired: true,
    },
    {
        department: "Engineering & Design",
        roleLevel: "Engineer / Specialist / Analyst",
        stepOrder: 9,
        title: "Design Review Process Walkthrough",
        description:
            "Shadow a senior engineer through a full design review cycle. Understand inter-discipline check (IDC) responsibilities.",
        category: "Technical Onboarding",
        isRequired: true,
    },

    // ── HSE ──────────────────────────────────────────────────────────────────
    {
        department: "Health, Safety & Environment (HSE)",
        roleLevel: null,
        stepOrder: 6,
        title: "Site Safety Induction",
        description:
            "Complete the E.U.Z site safety induction programme. Obtain your site access card and mandatory PPE allocation.",
        category: "Safety",
        isRequired: true,
    },
    {
        department: "Health, Safety & Environment (HSE)",
        roleLevel: null,
        stepOrder: 7,
        title: "Permit-to-Work (PTW) System Training",
        description:
            "Complete PTW system training. Understand permit types, authorisation levels, and isolation/LOTO procedures.",
        category: "Safety",
        isRequired: true,
    },
    {
        department: "Health, Safety & Environment (HSE)",
        roleLevel: null,
        stepOrder: 8,
        title: "Incident Reporting & Investigation Process",
        description:
            "Learn the incident and near-miss reporting process. Understand RCA methodology used at E.U.Z.",
        category: "Safety",
        isRequired: true,
    },
    {
        department: "Health, Safety & Environment (HSE)",
        roleLevel: "Supervisor / Team Lead",
        stepOrder: 9,
        title: "HSE Audit & Inspection Procedures",
        description:
            "Review the HSE audit schedule and inspection checklists. Understand your role in safety walks and compliance reporting.",
        category: "Safety",
        isRequired: true,
    },

    // ── FIELD OPERATIONS / CONSTRUCTION ─────────────────────────────────────
    {
        department: "Field Operations / Construction",
        roleLevel: null,
        stepOrder: 6,
        title: "Site Access & Security Procedures",
        description:
            "Complete site access induction. Obtain hard hat, PPE kit, and access pass. Review site-specific emergency muster points.",
        category: "Site Operations",
        isRequired: true,
    },
    {
        department: "Field Operations / Construction",
        roleLevel: null,
        stepOrder: 7,
        title: "Toolbox Talk Programme Orientation",
        description:
            "Understand the daily toolbox talk structure, frequency, and your role in contributing and signing attendance records.",
        category: "Site Operations",
        isRequired: true,
    },
    {
        department: "Field Operations / Construction",
        roleLevel: null,
        stepOrder: 8,
        title: "Quality ITP Review",
        description:
            "Review Inspection & Test Plans (ITPs) relevant to your area of work. Understand hold and witness points.",
        category: "Site Operations",
        isRequired: true,
    },
    {
        department: "Field Operations / Construction",
        roleLevel: "Technician / Operator",
        stepOrder: 9,
        title: "Equipment Operating Procedures",
        description:
            "Complete sign-off on operating procedures for all equipment under your responsibility. Confirm with your supervisor.",
        category: "Site Operations",
        isRequired: true,
    },

    // ── PROJECT MANAGEMENT ───────────────────────────────────────────────────
    {
        department: "Project Management",
        roleLevel: null,
        stepOrder: 6,
        title: "Project Governance & EPC Contract Overview",
        description:
            "Review the E.U.Z project governance framework, standard EPC contract structure, and key contractual milestones.",
        category: "Project Delivery",
        isRequired: true,
    },
    {
        department: "Project Management",
        roleLevel: null,
        stepOrder: 7,
        title: "Schedule & Cost Control Tools",
        description:
            "Obtain access to Primavera P6 or MS Project. Complete orientation on the project schedule and EVM reporting.",
        category: "Project Delivery",
        isRequired: true,
    },
    {
        department: "Project Management",
        roleLevel: null,
        stepOrder: 8,
        title: "Risk Register & Change Control Process",
        description:
            "Review the project risk register and change control process. Understand approval thresholds.",
        category: "Project Delivery",
        isRequired: true,
    },

    // ── FINANCE & ACCOUNTING ─────────────────────────────────────────────────
    {
        department: "Finance & Accounting",
        roleLevel: null,
        stepOrder: 6,
        title: "ERP System Access (SAP/Oracle)",
        description:
            "Submit access request for the ERP system. Complete mandatory ERP orientation with the Finance Systems team.",
        category: "Finance Systems",
        isRequired: true,
    },
    {
        department: "Finance & Accounting",
        roleLevel: null,
        stepOrder: 7,
        title: "Chart of Accounts & Cost Coding",
        description:
            "Review the E.U.Z chart of accounts, project cost codes, and WBS structure applicable to your role.",
        category: "Finance Systems",
        isRequired: true,
    },
    {
        department: "Finance & Accounting",
        roleLevel: null,
        stepOrder: 8,
        title: "Budget & Forecast Process",
        description:
            "Understand the annual budget cycle, rolling forecast cadence, and submission requirements.",
        category: "Finance Systems",
        isRequired: true,
    },

    // ── PROCUREMENT & SUPPLY CHAIN ───────────────────────────────────────────
    {
        department: "Procurement & Supply Chain",
        roleLevel: null,
        stepOrder: 6,
        title: "Purchase Requisition & Approval Workflow",
        description:
            "Review the PR-to-PO process, approval authority matrix, and procurement system access.",
        category: "Procurement",
        isRequired: true,
    },
    {
        department: "Procurement & Supply Chain",
        roleLevel: null,
        stepOrder: 7,
        title: "Vendor Qualification Process",
        description:
            "Understand the vendor registration, prequalification, and performance evaluation process.",
        category: "Procurement",
        isRequired: true,
    },

    // ── HUMAN RESOURCES ──────────────────────────────────────────────────────
    {
        department: "Human Resources",
        roleLevel: null,
        stepOrder: 6,
        title: "HRIS System Access & Navigation",
        description:
            "Obtain access to the HRIS platform. Complete system navigation training and understand your data access permissions.",
        category: "HR Systems",
        isRequired: true,
    },
    {
        department: "Human Resources",
        roleLevel: null,
        stepOrder: 7,
        title: "Performance Management Cycle Overview",
        description:
            "Review the E.U.Z performance management framework: objective setting, mid-year, and year-end review process.",
        category: "HR Systems",
        isRequired: true,
    },

    // ── IT & DIGITAL ─────────────────────────────────────────────────────────
    {
        department: "IT & Digital",
        roleLevel: null,
        stepOrder: 6,
        title: "IT Architecture & Systems Landscape",
        description:
            "Review the E.U.Z enterprise architecture diagram, primary systems, and integration points.",
        category: "IT Operations",
        isRequired: true,
    },
    {
        department: "IT & Digital",
        roleLevel: null,
        stepOrder: 7,
        title: "Change Management (ITCM) Process",
        description:
            "Understand the IT change management process: request, review, approval, and deployment gates.",
        category: "IT Operations",
        isRequired: true,
    },
    {
        department: "IT & Digital",
        roleLevel: null,
        stepOrder: 8,
        title: "Cybersecurity Incident Response",
        description:
            "Review the cybersecurity incident response playbook. Know escalation contacts and SIEM alert thresholds.",
        category: "IT Operations",
        isRequired: true,
    },

    // ── LEGAL & COMPLIANCE ───────────────────────────────────────────────────
    {
        department: "Legal & Compliance",
        roleLevel: null,
        stepOrder: 6,
        title: "Regulatory Compliance Framework",
        description:
            "Review the E.U.Z regulatory compliance register: energy sector licences, permits, and reporting obligations.",
        category: "Legal",
        isRequired: true,
    },
    {
        department: "Legal & Compliance",
        roleLevel: null,
        stepOrder: 7,
        title: "Anti-Bribery & Corruption (ABC) Policy",
        description:
            "Complete the ABC policy acknowledgement and mandatory e-learning module.",
        category: "Legal",
        isRequired: true,
    },

    // ── EXECUTIVE / C-SUITE ──────────────────────────────────────────────────
    {
        department: "Executive / C-Suite",
        roleLevel: null,
        stepOrder: 6,
        title: "Board & Governance Briefing",
        description:
            "Receive briefing from the Company Secretary on board composition, committee structure, and reporting obligations.",
        category: "Governance",
        isRequired: true,
    },
    {
        department: "Executive / C-Suite",
        roleLevel: null,
        stepOrder: 7,
        title: "Stakeholder Mapping Session",
        description:
            "Complete stakeholder mapping session with the CEO and relevant department heads. Review key external relationships.",
        category: "Governance",
        isRequired: true,
    },

    // ── FACILITIES / CLEANERS & SUPPORT STAFF ────────────────────────────────
    {
        department: "Facilities / Cleaners & Support Staff",
        roleLevel: null,
        stepOrder: 6,
        title: "Cleaning Protocols & Schedule",
        description:
            "Review your assigned cleaning zone, daily schedule, and standard operating procedures for cleaning tasks.",
        category: "Facilities",
        isRequired: true,
    },
    {
        department: "Facilities / Cleaners & Support Staff",
        roleLevel: null,
        stepOrder: 7,
        title: "Waste Segregation & Disposal",
        description:
            "Complete training on waste segregation (general, recyclable, hazardous). Identify waste disposal points on site.",
        category: "Facilities",
        isRequired: true,
    },
    {
        department: "Facilities / Cleaners & Support Staff",
        roleLevel: null,
        stepOrder: 8,
        title: "Emergency Evacuation Procedures",
        description:
            "Confirm knowledge of emergency muster points, fire extinguisher locations, and evacuation route for your zone.",
        category: "Facilities",
        isRequired: true,
    },
];

// ─── Seed Function ────────────────────────────────────────────────────────────

async function seed() {
    console.log(`⏳ Seeding ${STEPS.length} onboarding steps…`);

    let inserted = 0;
    for (const step of STEPS) {
        await db.insert(onboardingStep).values({
            department: step.department,
            roleLevel: step.roleLevel,
            stepOrder: step.stepOrder,
            title: step.title,
            description: step.description,
            category: step.category,
            isRequired: step.isRequired ?? true,
        });
        inserted++;
    }

    console.log(`✅ Seeded ${inserted} onboarding steps.`);
    await client.end();
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
