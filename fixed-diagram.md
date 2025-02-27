flowchart TD
    subgraph "1. Claim Submission (Retailer/Distributor Initiated)"
        A[Start - Retailer/Distributor Submits Claim] --> B{Submission Method?}
        B -- EDI --> C[Electronic Data Interchange]
        B -- Web Portal --> D[Web Portal Submission]
        B -- Email/Mail --> E[Email/Mail Submission]
        B -- Deduction from Invoice --> F[Deduction from Invoice]
        C --> G{Key Information Included?}
        D --> G
        E --> G
        F --> G
        G -- Yes --> H[Retailer/Distributor ID and Name]
        H --> I[Invoice Number(s)]
        I --> J[Claim Type]
        J --> K[Claim Amount]
        K --> L[Reason Code]
        L --> M[Supporting Documentation]
    end

    subgraph "2. Claim Receipt & Logging (CPG Company - Automated System)"
        M --> N[Claim Received by CPG System]
        N --> O{Automated Capture?}
        O -- Yes: EDI/Portal --> P[Automatic Ingestion]
        O -- No: Email/Mail --> Q[Manual Data Entry]
        P --> R[Claim ID Generation]
        Q --> R
        R --> S[Initial Validation]
        S --> T[Valid Retailer/Distributor ID]
        T --> U[Matching Invoice Number]
        U --> V[Completeness of Required Fields]
    end

    subgraph "3. Claim Triage & Routing (CPG Company - Automated/Manual)"
        V --> W[Claim Type Classification]
        W --> X{Claim Type?}
        X -- Shortages/Damages --> Y[Route to Supply Chain Team]
        X -- Pricing Discrepancies --> AA[Route to Dedicated Claims Analyst/Account Manager]
        X -- Promotional Allowances --> BB[Route to Marketing/Sales Team]
        X -- Returns --> CC[Route to Supply Chain/Claims Analyst]
        X -- Compliance Fines --> DD[Route to Account Manager/Claims Analyst]
        X -- Marketing/Advertising Fees --> EE[Route to Marketing Team]
        X -- Slotting/Listing Fees --> FF[Route to Sales/Marketing Team]
        Y --> GG[Prioritization]
        AA --> GG
        BB --> GG
        CC --> GG
        DD --> GG
        EE --> GG
        FF --> GG
        X -- Other --> HH[Route to Dedicated Claims Analyst]
        HH --> GG
        GG --> II{Low-Value/Known Claim?}
        II -- Yes --> JJ[Automated Approval]
        II -- No --> KK[Claim Validation & Research]
    end

    subgraph "4. Claim Validation & Research (CPG Company - Claims Analyst/Relevant Teams)"
        KK --> LL[Document Review]
        LL --> MM[Proof of Delivery (POD)]
        MM --> NN[Sales Orders/Invoices]
        NN --> OO[Promotional Agreements]
        OO --> PP[Trade Spend Budgets]
        PP --> QQ[Inventory Records]
        QQ --> RR[Communication Logs]
        RR --> SS[Cross-Functional Collaboration]
        SS --> TT[Sales]
        TT --> UU[Supply Chain]
        UU --> VV[Marketing]
        VV --> WW[Finance]
        WW --> XX[Retailer Communication (if needed)]
        XX --> YY[Dispute Resolution]
    end

    subgraph "5. Claim Resolution & Decision (CPG Company - Claims Analyst/Manager)"
        YY --> ZZ[Claim Decision]
        ZZ --> AAA{Approve?}
        AAA -- Yes: Full --> BBB[Approve (Full)]
        AAA -- Yes: Partial --> CCC[Approve (Partial)]
        AAA -- No --> DDD[Reject (Full or Partial)]
        AAA -- Requires Further Action --> EEE[Requires Further Action]
        BBB --> FFF[Approval Workflow (Hierarchical)]
        CCC --> FFF
        DDD --> GGG[Provide Explanation to Retailer]
        EEE --> HHH[Update Claim Status]
        FFF --> III[Write-offs (if needed)]
    end

    subgraph "6. Claim Settlement & Payment (CPG Company - Finance/Accounting)"
        BBB --> JJJ[Claim Settlement]
        CCC --> JJJ
        JJJ --> KKK{Payment Method?}
        KKK -- Credit Memo --> LLL[Issue Credit Memo]
        KKK -- Direct Payment --> MMM[Make Direct Payment]
        LLL --> NNN[Reconciliation]
        MMM --> NNN
        NNN --> OOO[Accounting Entries]
    end 