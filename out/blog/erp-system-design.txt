3:I[9275,[],""]
5:I[1343,[],""]
6:I[3509,["842","static/chunks/842-8611233b8b168bdf.js","185","static/chunks/app/layout-1e527e6f80435bb1.js"],"default"]
4:["slug","erp-system-design","d"]
0:["96NdAYUzvXBNqDRwSinyz",[[["",{"children":["blog",{"children":[["slug","erp-system-design","d"],{"children":["__PAGE__?{\"slug\":\"erp-system-design\"}",{}]}]}]},"$undefined","$undefined",true],["",{"children":["blog",{"children":[["slug","erp-system-design","d"],{"children":["__PAGE__",{},[["$L1","$L2"],null],null]},["$","$L3",null,{"parallelRouterKey":"children","segmentPath":["children","blog","children","$4","children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L5",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","notFoundStyles":"$undefined","styles":null}],null]},["$","$L3",null,{"parallelRouterKey":"children","segmentPath":["children","blog","children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L5",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","notFoundStyles":"$undefined","styles":null}],null]},[["$","html",null,{"lang":"en","className":"scroll-smooth","children":["$","body",null,{"className":"animated-gradient-bg min-h-screen","suppressHydrationWarning":true,"children":[["$","$L6",null,{}],["$","$L3",null,{"parallelRouterKey":"children","segmentPath":["children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L5",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":"404"}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],"notFoundStyles":[],"styles":null}]]}]}],null],null],[[["$","link","0",{"rel":"stylesheet","href":"/portfolio/_next/static/css/e4fa323e070fe965.css","precedence":"next","crossOrigin":"$undefined"}]],"$L7"]]]]
8:I[231,["231","static/chunks/231-6ba2a30fef1cee39.js","308","static/chunks/app/blog/%5Bslug%5D/page-fa969c147c0a8a31.js"],""]
9:T492,# models/rbac.py
from enum import Enum

class Permission(str, Enum):
    # Accounts module
    ACCOUNTS_READ = "accounts:read"
    ACCOUNTS_WRITE = "accounts:write"
    ACCOUNTS_APPROVE = "accounts:approve"

    # HR module
    HR_READ_OWN = "hr:read:own"
    HR_READ_DEPT = "hr:read:department"
    HR_READ_ALL = "hr:read:all"
    HR_WRITE = "hr:write"

ROLE_PERMISSIONS = {
    "staff": [
        Permission.ACCOUNTS_READ,
        Permission.HR_READ_OWN,
    ],
    "manager": [
        Permission.ACCOUNTS_READ,
        Permission.ACCOUNTS_WRITE,
        Permission.HR_READ_DEPT,
        Permission.HR_WRITE,
    ],
    "admin": list(Permission),  # all permissions
}

def has_permission(user_role: str, permission: Permission) -> bool:
    return permission in ROLE_PERMISSIONS.get(user_role, [])

# Decorator for routes
def require_permission(permission: Permission):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if not has_permission(g.current_user['role'], permission):
                raise APIError("Insufficient permissions", 403)
            return fn(*args, **kwargs)
        return wrapper
    return decoratora:T408,# models/audit.py
from datetime import datetime

class AuditLog(db.Model):
    __tablename__ = 'audit_log'

    id = db.Column(db.Integer, primary_key=True)
    table_name = db.Column(db.String(100), nullable=False)
    record_id = db.Column(db.Integer, nullable=False)
    action = db.Column(db.Enum('INSERT', 'UPDATE', 'DELETE'), nullable=False)
    changed_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    changed_at = db.Column(db.DateTime, default=datetime.utcnow)
    old_values = db.Column(db.JSON)
    new_values = db.Column(db.JSON)

def log_change(table: str, record_id: int, action: str,
               old_vals: dict = None, new_vals: dict = None):
    user_id = g.current_user.get('id') if hasattr(g, 'current_user') else None
    entry = AuditLog(
        table_name=table,
        record_id=record_id,
        action=action,
        changed_by=user_id,
        old_values=old_vals,
        new_values=new_vals,
    )
    db.session.add(entry)
    # Don't commit here — let the calling transaction handle itb:T4b2,import csv
import io
from dataclasses import dataclass
from typing import Generator

@dataclass
class ImportResult:
    total: int
    successful: int
    failed: int
    errors: list[dict]

def import_accounts_csv(file_data: bytes) -> ImportResult:
    text = file_data.decode('utf-8-sig')  # handle BOM from Excel exports
    reader = csv.DictReader(io.StringIO(text))

    result = ImportResult(0, 0, 0, [])
    batch = []

    for row_num, row in enumerate(reader, start=2):  # 1-indexed, row 1 is header
        result.total += 1
        try:
            account = validate_account_row(row, row_num)
            batch.append(account)

            if len(batch) >= 500:  # commit in batches
                db.session.bulk_insert_mappings(Account, batch)
                db.session.commit()
                result.successful += len(batch)
                batch = []

        except ValidationError as e:
            result.failed += 1
            result.errors.append({"row": row_num, "error": str(e), "data": dict(row)})

    if batch:  # flush remaining
        db.session.bulk_insert_mappings(Account, batch)
        db.session.commit()
        result.successful += len(batch)

    return result2:["$","div",null,{"className":"min-h-screen","style":{"background":"radial-gradient(ellipse at 20% 10%, #f59e0b08 0%, transparent 50%),\n                     radial-gradient(ellipse at 80% 80%, rgba(251,191,36,0.05) 0%, transparent 50%),\n                     #0a0a0f"},"children":[["$","header",null,{"className":"fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/5","children":["$","div",null,{"className":"max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between","children":[["$","$L8",null,{"href":"/#blog","className":"flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium group","children":[["$","span",null,{"className":"group-hover:-translate-x-1 transition-transform duration-200","children":"←"}],"Back"]}],["$","div",null,{"className":"flex items-center gap-2","children":["$","span",null,{"className":"text-xs font-semibold px-2.5 py-1 rounded-full","style":{"color":"#f59e0b","background":"#f59e0b12","border":"1px solid #f59e0b30"},"children":"Backend Engineering"}]}]]}]}],["$","article",null,{"className":"max-w-3xl mx-auto px-3 sm:px-6 pt-24 sm:pt-28 pb-20","children":[["$","div",null,{"className":"mb-12","children":[["$","div",null,{"className":"flex flex-wrap items-center gap-3 mb-6 text-xs text-white/35 font-mono","children":[["$","span",null,{"children":"September 2024"}],["$","span",null,{"className":"w-1 h-1 rounded-full bg-white/20"}],["$","span",null,{"children":"7 min read"}],["$","span",null,{"className":"w-1 h-1 rounded-full bg-white/20"}],["$","span",null,{"children":"Harshita Rajput"}]]}],["$","h1",null,{"className":"text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tight mb-6","children":"Designing a Modular ERP System: Architecture Decisions and Tradeoffs"}],["$","div",null,{"className":"h-[2px] w-24 rounded-full mb-8","style":{"background":"linear-gradient(90deg, #f59e0b, transparent)"}}],["$","p",null,{"className":"text-lg text-white/60 leading-relaxed border-l-2 pl-5","style":{"borderColor":"#f59e0b60"},"children":"Building an ERP system is one of the most instructive software engineering challenges — it touches database design, security, business logic, and UI simultaneously. Here's the architecture behind the ERP platform I built, the decisions I made, and what I'd change now."}],["$","div",null,{"className":"flex flex-wrap gap-2 mt-8","children":[["$","span","ERP",{"className":"text-xs px-2.5 py-1 rounded-full font-medium","style":{"color":"#f59e0b","background":"#f59e0b10","border":"1px solid #f59e0b25"},"children":"ERP"}],["$","span","Flask",{"className":"text-xs px-2.5 py-1 rounded-full font-medium","style":{"color":"#f59e0b","background":"#f59e0b10","border":"1px solid #f59e0b25"},"children":"Flask"}],["$","span","MySQL",{"className":"text-xs px-2.5 py-1 rounded-full font-medium","style":{"color":"#f59e0b","background":"#f59e0b10","border":"1px solid #f59e0b25"},"children":"MySQL"}],["$","span","Architecture",{"className":"text-xs px-2.5 py-1 rounded-full font-medium","style":{"color":"#f59e0b","background":"#f59e0b10","border":"1px solid #f59e0b25"},"children":"Architecture"}],["$","span","RBAC",{"className":"text-xs px-2.5 py-1 rounded-full font-medium","style":{"color":"#f59e0b","background":"#f59e0b10","border":"1px solid #f59e0b25"},"children":"RBAC"}]]}]]}],["$","div",null,{"className":"h-px w-full mb-12 opacity-20","style":{"background":"linear-gradient(90deg, transparent, #f59e0b, transparent)"}}],["$","div",null,{"className":"space-y-10","children":[["$","section","The Core Design Principle: Modules, Not Monolith",{"children":[["$","h2",null,{"className":"text-xl sm:text-2xl font-bold text-white mb-5 leading-snug","children":"The Core Design Principle: Modules, Not Monolith"}],["$","div",null,{"children":[["$","div","0",{"children":[["$","p","0",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"An ERP system that starts as a monolith rarely decomposes cleanly later. I structured the system as independent modules from the start, each owning its data domain:"}}],null]}],["$","div","1",{"className":"relative my-6 rounded-2xl overflow-hidden border border-white/8","children":[["$","div",null,{"className":"flex items-center gap-1.5 px-4 py-2.5 bg-white/4 border-b border-white/6","children":[["$","span","0",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#ff5f56"}}],["$","span","1",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#ffbd2e"}}],["$","span","2",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#27c93f"}}]]}],["$","pre",null,{"className":"overflow-x-auto p-5 text-xs leading-relaxed text-white/75 font-mono bg-[#0d0d18]","children":["$","code",null,{"children":"erp_system/\n├── app/\n│   ├── __init__.py          # app factory\n│   ├── modules/\n│   │   ├── accounts/        # chart of accounts, GL entries\n│   │   ├── inventory/       # items, warehouses, stock movements\n│   │   ├── hr/              # employees, departments, payroll\n│   │   ├── procurement/     # purchase orders, vendors\n│   │   └── reports/         # cross-module reporting\n│   ├── auth/                # authentication, RBAC\n│   ├── api/                 # REST API layer\n│   └── models/              # shared database models\n├── migrations/\n└── tests/\n    ├── unit/\n    └── integration/"}]}]]}],["$","div","2",{"children":[null,["$","p","1",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"Each module has its own Blueprint, its own database tables, and its own service layer. Cross-module operations go through a thin service interface — modules don't import from each other directly."}}]]}]]}]]}],["$","section","Role-Based Access Control",{"children":[["$","h2",null,{"className":"text-xl sm:text-2xl font-bold text-white mb-5 leading-snug","children":"Role-Based Access Control"}],["$","div",null,{"children":[["$","div","0",{"children":[["$","p","0",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"ERP systems have complex permission requirements: admins can do everything, managers see their department's data, staff have read-only access to their own records. Flat role checks don't scale — you need granular permissions."}}],null]}],["$","div","1",{"className":"relative my-6 rounded-2xl overflow-hidden border border-white/8","children":[["$","div",null,{"className":"flex items-center gap-1.5 px-4 py-2.5 bg-white/4 border-b border-white/6","children":[["$","span","0",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#ff5f56"}}],["$","span","1",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#ffbd2e"}}],["$","span","2",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#27c93f"}}]]}],["$","pre",null,{"className":"overflow-x-auto p-5 text-xs leading-relaxed text-white/75 font-mono bg-[#0d0d18]","children":["$","code",null,{"children":"$9"}]}]]}],["$","div","2",{"children":[null]}]]}]]}],["$","section","Audit Trail: Every Change is Logged",{"children":[["$","h2",null,{"className":"text-xl sm:text-2xl font-bold text-white mb-5 leading-snug","children":"Audit Trail: Every Change is Logged"}],["$","div",null,{"children":[["$","div","0",{"children":[["$","p","0",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"In enterprise software, \"who changed what and when\" is not a nice-to-have — it's often a compliance requirement. I implemented a generic audit trail using SQLAlchemy events."}}],null]}],["$","div","1",{"className":"relative my-6 rounded-2xl overflow-hidden border border-white/8","children":[["$","div",null,{"className":"flex items-center gap-1.5 px-4 py-2.5 bg-white/4 border-b border-white/6","children":[["$","span","0",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#ff5f56"}}],["$","span","1",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#ffbd2e"}}],["$","span","2",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#27c93f"}}]]}],["$","pre",null,{"className":"overflow-x-auto p-5 text-xs leading-relaxed text-white/75 font-mono bg-[#0d0d18]","children":["$","code",null,{"children":"$a"}]}]]}],["$","div","2",{"children":[null,["$","p","1",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"Wrap all modifying operations to automatically call <code class=\"px-1.5 py-0.5 rounded bg-white/8 text-[#ff4d6d] text-[13px] font-mono\">log_change</code>. The audit log becomes a reliable \"undo\" source and compliance artifact."}}]]}]]}]]}],["$","section","Bulk Data Processing",{"children":[["$","h2",null,{"className":"text-xl sm:text-2xl font-bold text-white mb-5 leading-snug","children":"Bulk Data Processing"}],["$","div",null,{"children":[["$","div","0",{"children":[["$","p","0",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"ERP systems frequently need to import large datasets — account charts, employee records, inventory items. Building this robustly was one of the more challenging parts of the project."}}],null]}],["$","div","1",{"className":"relative my-6 rounded-2xl overflow-hidden border border-white/8","children":[["$","div",null,{"className":"flex items-center gap-1.5 px-4 py-2.5 bg-white/4 border-b border-white/6","children":[["$","span","0",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#ff5f56"}}],["$","span","1",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#ffbd2e"}}],["$","span","2",{"className":"w-2.5 h-2.5 rounded-full","style":{"background":"#27c93f"}}]]}],["$","pre",null,{"className":"overflow-x-auto p-5 text-xs leading-relaxed text-white/75 font-mono bg-[#0d0d18]","children":["$","code",null,{"children":"$b"}]}]]}],["$","div","2",{"children":[null,["$","p","1",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"Return the import result with per-row errors. Users need to see exactly which rows failed and why — a generic \"import failed\" message is useless for a 5,000-row file."}}]]}]]}]]}],["$","section","What I'd Do Differently",{"children":[["$","h2",null,{"className":"text-xl sm:text-2xl font-bold text-white mb-5 leading-snug","children":"What I'd Do Differently"}],["$","div",null,{"children":[["$","div","0",{"children":[["$","p","0",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"<strong class=\"text-white/90 font-semibold\">Database design is permanent.</strong> I underestimated how painful schema changes are once data exists. The things I'd do more carefully upfront: soft deletes everywhere (never hard-delete records in an ERP), proper foreign keys with ON DELETE behavior documented, and standardized timestamp columns (created_at, updated_at, deleted_at) on every table."}}],["$","p","1",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"<strong class=\"text-white/90 font-semibold\">Reporting is a separate concern.</strong> I built reports as complex SQL queries in Flask routes. For anything non-trivial, this doesn't scale. Reports should query a separate read replica or a materialized view, not the live transactional database."}}],["$","p","2",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"<strong class=\"text-white/90 font-semibold\">Testing business logic independently.</strong> I tested at the HTTP layer, which made tests slow and fragile. Business logic (account validation rules, payroll calculations, permission checks) should be unit-testable in pure Python, without a database or HTTP context."}}],["$","p","3",{"className":"text-white/65 text-[15px] leading-[1.85] mb-4","dangerouslySetInnerHTML":{"__html":"The ERP system taught me that enterprise software is less about clever algorithms and more about rigorous data modeling, consistent error handling, and boring but reliable operations."}}]]}]]}]]}]]}],["$","div",null,{"className":"mt-16 pt-8 border-t border-white/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4","children":[["$","div",null,{"children":[["$","p",null,{"className":"text-sm font-semibold text-white/70","children":"Harshita Rajput"}],["$","p",null,{"className":"text-xs text-white/35 mt-0.5","children":"AI Engineer · R&D at CertifyMe"}]]}],["$","$L8",null,{"href":"/#blog","className":"text-sm font-medium transition-colors","style":{"color":"#f59e0b"},"children":"← More articles"}]]}]]}]]}]
7:[["$","meta","0",{"name":"viewport","content":"width=device-width, initial-scale=1"}],["$","meta","1",{"charSet":"utf-8"}],["$","title","2",{"children":"Designing a Modular ERP System: Architecture Decisions and Tradeoffs — Harshita Rajput"}],["$","meta","3",{"name":"description","content":"Building an ERP system is one of the most instructive software engineering challenges — it touches database design, security, business logic, and UI simultaneou"}],["$","meta","4",{"name":"author","content":"Harshita Rajput"}],["$","meta","5",{"name":"keywords","content":"AI Engineer,Machine Learning,NLP,Computer Vision,Generative AI,Flask,Python,Full Stack,Harshita Rajput"}],["$","meta","6",{"property":"og:title","content":"Harshita Rajput — AI Engineer"}],["$","meta","7",{"property":"og:description","content":"Building intelligent systems that learn, adapt, and scale."}],["$","meta","8",{"property":"og:type","content":"website"}],["$","meta","9",{"name":"twitter:card","content":"summary"}],["$","meta","10",{"name":"twitter:title","content":"Harshita Rajput — AI Engineer"}],["$","meta","11",{"name":"twitter:description","content":"Building intelligent systems that learn, adapt, and scale."}],["$","link","12",{"rel":"icon","href":"/portfolio/icon.svg?5cfbb99a5743764e","type":"image/svg+xml","sizes":"any"}]]
1:null
