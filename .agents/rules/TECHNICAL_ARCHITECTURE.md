# Technical Architecture Specification: ClearSite Solutions Platform
## 1. System Vision & Paradigm
ClearSite Solutions runs on an optimized, zero-framework, data-driven architecture. The core tenet is absolute separation of the **Control Plane** (agent operational rules, cognitive skills, and automation templates) from the **Data Plane** (production web code, assets, and configurations).
By externalizing all pricing math models, geographic nodes, and copy variations into plain JSON configuration trees, the platform guarantees that human business operators can adjust operations manually without touching code, while autonomous development agents (such as Google Antigravity 2.0) can maintain or scale the application safely without experiencing context drift.

## 2. Technology Stack Boundaries
To maximize local SEO crawl budgets, eliminate runtime dependency vulnerability patches, and achieve sub-millisecond execution loops, the platform enforces a strict Zero-Framework Frontend Philosophy:
Structure: Clean, semantic, structured HTML5 Document Object Models.
Design Typography System: Utility-first Tailwind CSS compiling down to optimized static classes.
State Interaction: Pure asynchronous Vanilla JavaScript (ECMAScript Next). Heavy framework wrappers (React, Vue, Angular) or package overhead (Node Modules)are structurally prohibited in the Data Plane.

## 3. Component Interaction Architecture
The platform core utilizes an asynchronous data pipeline. When a user interacts with the user interface components:
Event Trapping: DOM listeners intercept inputs from the fluid range volume slider or safety toggles.
Config Ingestion: The pricing.js core fires a non-blocking asynchronous Fetch API call targeting src/config/pricing-config.json.
Algorithmic Array Processing: Cost totals for all 4 service tiers are processed simultaneously inside memory.
DOM Invalidation: Values, status indicators, and dynamic savings banners update natively without whole-page refreshes.