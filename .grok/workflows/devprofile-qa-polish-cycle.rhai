// Generated draft — Grok Build workflow template.
// Install: copy to .grok/workflows/devprofile-qa-polish-cycle.rhai (or ~/.grok/workflows/).
// Requires Grok host APIs: agent(), phase(), log(), complete() — not rhai-host.
// Skill chain: trace-api-permissions → impeccable-qa-redesign → update-persona-copy

let meta = #{
    name: "devprofile-qa-polish-cycle",
    description: "End-to-end flow from API debug through impeccable UI redesign, persona accuracy fixes, and PR creation for the QA interview desk",
    phases: [
        #{ title: "Debug", detail: "Resolve 403 by enabling correct endpoint ACLs" },
        #{ title: "Design", detail: "Two-pane layout keeping answer visible" },
        #{ title: "Polish", detail: "Copy rewrite + badge differentiation" },
        #{ title: "Ship", detail: "README update + PR" }
    ],
    when_to_use: "End-to-end flow from API debug through impeccable UI redesign, persona accuracy fixes, and PR creation for the QA interview desk",
};

phase("Debug");
let r0 = agent(
    "Follow skill 'trace-api-permissions'. Resolve 403 by enabling correct endpoint ACLs. Use read-only tools first when mapping; "
        + "then apply edits. Report {done: bool, notes: string}.",
    #{
        label: "trace-api-permissions",
        capability_mode: "read-only",
        output_schema: #{
            "type": "object",
            "required": ["done", "notes"],
            "properties": #{
                "done": #{ "type": "boolean" },
                "notes": #{ "type": "string" },
            },
        },
    },
);
if r0 == () || !r0.success {
    log("phase failed: trace-api-permissions");
}


phase("Design");
let r1 = agent(
    "Follow skill 'impeccable-qa-redesign'. Two-pane layout keeping answer visible. Use read-only tools first when mapping; "
        + "then apply edits. Report {done: bool, notes: string}.",
    #{
        label: "impeccable-qa-redesign",
        capability_mode: "read-write",
        output_schema: #{
            "type": "object",
            "required": ["done", "notes"],
            "properties": #{
                "done": #{ "type": "boolean" },
                "notes": #{ "type": "string" },
            },
        },
    },
);
if r1 == () || !r1.success {
    log("phase failed: impeccable-qa-redesign");
}


phase("Polish");
let r2 = agent(
    "Follow skill 'update-persona-copy'. Copy rewrite + badge differentiation. Use read-only tools first when mapping; "
        + "then apply edits. Report {done: bool, notes: string}.",
    #{
        label: "update-persona-copy",
        capability_mode: "read-write",
        output_schema: #{
            "type": "object",
            "required": ["done", "notes"],
            "properties": #{
                "done": #{ "type": "boolean" },
                "notes": #{ "type": "string" },
            },
        },
    },
);
if r2 == () || !r2.success {
    log("phase failed: update-persona-copy");
}


phase("Ship");
let r3 = agent(
    "Follow skill 'Ship'. README update + PR. Use read-only tools first when mapping; "
        + "then apply edits. Report {done: bool, notes: string}.",
    #{
        label: "Ship",
        capability_mode: "read-write",
        output_schema: #{
            "type": "object",
            "required": ["done", "notes"],
            "properties": #{
                "done": #{ "type": "boolean" },
                "notes": #{ "type": "string" },
            },
        },
    },
);
if r3 == () || !r3.success {
    log("phase failed: Ship");
}

complete(#{
    summary: "Finished workflow devprofile-qa-polish-cycle",
    skill_chain: ["trace-api-permissions","impeccable-qa-redesign","update-persona-copy"],
});
