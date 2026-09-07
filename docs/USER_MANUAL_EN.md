# 📖 User Manual — TiConta v2 ERP

Welcome to the official user manual for **TiConta v2**, the market-leading offline-first ERP platform tailored for businesses, accounting standards (PGC-NIRF), and tax regulations in Mozambique.

---

## 📑 Table of Contents
1. [1. Getting Started](#1-getting-started)
2. [2. Point of Sale (POS) & Invoicing](#2-point-of-sale-pos--invoicing)
3. [3. CRM & Sales Pipeline](#3-crm--sales-pipeline)
4. [4. Financial Management & Cash Flow](#4-financial-management--cash-flow)
5. [5. Accounting & PGC-NIRF Compliance](#5-accounting--pgc-nirf-compliance)
6. [6. Projects, Works & Services](#6-projects-works--services)
7. [7. Human Resources & Payroll (INSS)](#7-human-resources--payroll-inss)
8. [8. Reports & Business Analytics](#8-reports--business-analytics)
9. [9. Settings, Company & User Management](#9-settings-company--user-management)
10. [10. Offline Mode & Auto-Sync Engine](#10-offline-mode--auto-sync-engine)
11. [11. Premium Features (WhatsApp, SMS & Barcode)](#11-premium-features)
12. [12. Troubleshooting & FAQ](#12-troubleshooting--faq)
13. [13. Support Contacts & Helpdesk](#13-support-contacts--helpdesk)

---

## 1. Getting Started

### 1.1 Accessing the Application
Open Google Chrome, Microsoft Edge, or Mozilla Firefox and navigate to your configured address (for instance, `http://localhost:3000` or your local network server IP).

### 1.2 Creating the Initial Administrator Account
On first launch, TiConta v2 displays the setup wizard:
1. Enter the administrator **Username** (e.g., `admin`).
2. Set a secure **Access PIN / Password** (at least 4 numeric or alphanumeric characters).
3. Provide your organizational email address.
4. Click **"Create Account & Get Started"**.

### 1.3 Setting Up Company Details
Navigate to **Settings > Company** in the sidebar and enter:
* **Legal Business Name:** Official entity registered in Mozambique.
* **NUIT:** Tax Identification Number (9 digits).
* **Address & City:** Operational location (e.g., Maputo, Matola, Beira, Nampula).
* **VAT Scheme:** Standard 16% rate or Exempt status.
* **Base Currency:** Mozambican Metical (MZN).

---

## 2. Point of Sale (POS) & Invoicing

The POS module is built for fast cashier checkout in retail shops, supermarkets, wholesale depots, and service counters.

```
+-------------------------------------------------------------------------------+
|  [🔍 Search Product / Barcode Scan]                   [ 🛒 Shopping Cart ]    |
|  ----------------------------------                   ----------------------- |
|  [🥤 Soft Drink 500ml]    - 50 MT                     1x Soda 500ml:    50 MT |
|  [🍞 Sliced Bread]        - 80 MT                     2x Sliced Bread: 160 MT |
|  [🍚 Rice 5Kg]            - 350 MT                    ----------------------- |
|                                                       Subtotal:        210 MT |
|                                                       VAT (16%):      33.6 MT |
|                                                       TOTAL:         243.6 MT |
|                                                                               |
|  [ 💵 Cash ]   [ 💳 POS / Card ]   [ 📱 M-Pesa / E-Mola ]   [ 🖨️ Checkout ]   |
+-------------------------------------------------------------------------------+
```

### 2.1 Processing a Sale
1. Select **POS / Sales** from the main menu.
2. Add products to the cart using any of the following methods:
   * Clicking on product tiles.
   * Scanning barcodes with a laser reader or mobile camera.
   * Searching by product name or SKU in the top bar.
3. Adjust quantities or apply authorized discounts.
4. Select or register the **Customer** (optional for retail receipts, required for tax invoices with NUIT).
5. Choose payment method:
   * **Cash:** Enter amount tendered; change due is calculated automatically.
   * **M-Pesa / E-Mola:** Record mobile money transaction code.
   * **POS Card Machine:** Record bank terminal authorization slip number.
   * **On Credit:** Automatically records open accounts receivable.
6. Click **"Complete Sale"** (`F10` or green button).

### 2.2 Thermal Receipt Printing
The system supports standard **58mm** and **80mm** ESC/POS thermal receipt printers over USB, Bluetooth, or LAN, producing certified fiscal receipts with full VAT breakdown.

---

## 3. CRM & Sales Pipeline

Track prospects and customer interactions throughout their buying lifecycle.

### 3.1 Kanban Sales Pipeline
Monitor open deals across visual stages:
* **New Lead:** Initial inquiry or quote request received.
* **Proposal Sent:** Quotation delivered, awaiting decision.
* **In Negotiation:** Discussing scope, pricing, or payment terms.
* **Won:** Deal closed and automatically convertible into an order/invoice.
* **Lost:** Opportunity closed with logged lost reason for analytics.

### 3.2 Interaction Log
Record calls, in-person meetings, WhatsApp chats, and follow-up reminders to ensure seamless team collaboration.

---

## 4. Financial Management & Cash Flow

Track revenue, costs, and petty cash with high precision.

### 4.1 Expense Tracking
1. Navigate to **Financial > Expenses**.
2. Click **"Add Expense"**.
3. Select an expense category (e.g., Rent, Fuel, Salaries, Utilities, Maintenance).
4. Attach an invoice/receipt file or photo and choose the disbursement method.

### 4.2 Daily Cash Register Reconciliation
At the end of each work shift:
* Count physical cash and compare against recorded system balances.
* Generate the daily cash closing report highlighting any surplus or deficit.

---

## 5. Accounting & PGC-NIRF Compliance

TiConta v2 complies fully with the **General Accounting Plan based on International Financial Reporting Standards (PGC-NIRF)** adopted in Mozambique.

```
       Mozambique PGC-NIRF Chart of Accounts
       ├── Class 1: Financial Assets (Cash, Bank Accounts)
       ├── Class 2: Inventories & Biological Assets
       ├── Class 3: Capital Investments & Fixed Assets
       ├── Class 4: Accounts Receivable & Payable (Customers, Suppliers, State)
       ├── Class 5: Equity & Reserves
       ├── Class 6: Operational Costs & Expenses
       └── Class 7: Operational Revenue & Gains
```

### 5.1 Automated & Manual Journal Entries
* **Automated Entries:** POS sales, stock deductions, and customer payments post automatic balanced debits and credits to the general ledger.
* **Manual Journal Entries:** Certified accountants can register adjusting, accrual, and closing journal entries under **Accounting > Double-Entry Journal**.

### 5.2 Financial Statements
Instantly generate and export:
1. **Trial Balance (Balancete de Verificação):** Opening balances, debits, credits, and closing balances.
2. **Income Statement (DRE):** Operational profit, financial income/expenses, and net profit.
3. **Balance Sheet (Balanço Patrimonial):** Complete asset, liability, and equity positions.

---

## 6. Projects, Works & Services

Engineered for construction companies, carpentry shops, workshops, fabrication facilities, and technical contractors.

### 6.1 Project & Works Setup
* Define client details, project scope, milestones, expected delivery dates, and **Total Estimated Budget**.
* Assign tasks to specific project managers or field staff.

### 6.2 Tracking Real Costs vs. Budget
* Link material purchases, vendor bills, and labor hours directly to the project code.
* Real-time financial health indicators alert you whenever cumulative costs approach the budget threshold.

---

## 7. Human Resources & Payroll (INSS)

Manage employee files and comply with Mozambican labor and social security laws.

### 7.1 Employee Master Record
Maintain employee records including Full Name, NUIT, **INSS Beneficiary ID**, Job Title, Department, Base Salary, and Allowances.

### 7.2 Monthly Payroll Processing
1. Navigate to **HR > Payroll Processing**.
2. The engine automatically calculates:
   * **Employee INSS Social Security Contribution (3%)**
   * **Employer INSS Contribution (4%)**
   * **IRPS Income Tax Withholding**
   * **Net Salary Payable**
3. Generate individual pay slips (recibos de vencimento) and the bank transfer summary file.

---

## 8. Reports & Business Analytics

* **Sales Reports:** Breakdown by date, cashier, best-selling item, and gross profit margin.
* **Tax & VAT Reports:** Monthly collected and deductible VAT summary for official filing (Modelo A).
* **Export Formats:** Export all data tables instantly to **PDF**, **Excel (.xlsx)**, and **CSV**.

---

## 9. Settings, Company & User Management

### 9.1 Role-Based Access Control (RBAC)
Enforce granular permissions across your team:
* **Admin:** Unrestricted access to configuration, audits, and licensing.
* **Manager:** Access to managerial analytics, invoice cancellations, and expense approvals.
* **Accountant:** Dedicated access to chart of accounts, ledgers, and financial reports.
* **Cashier:** Restricted to POS checkout and daily sales operations.

### 9.2 Data Backup & Recovery
* Under **Settings > System**, download a complete database snapshot before month-end closings or major system updates.

---

## 10. Offline Mode & Auto-Sync Engine

TiConta v2 is resilient to power outages and internet downtime.

### How It Works:
1. When connectivity drops, the top status badge switches from **Green (Online)** to **Amber (Offline Mode)**.
2. All sales, printing, and inventory movements continue locally at full speed via browser **IndexedDB**.
3. When network connectivity is restored, the background sync worker uploads queued changes to the central server with conflict resolution and cryptographic verification.

---

## 11. Premium Features

*(Available in Complete and Enterprise tiers)*

### 11.1 WhatsApp & SMS Digital Invoice Dispatch
Go paperless. When closing a sale, choose **"Send via WhatsApp"** or **"Send via SMS"**. Customers receive an instant message with a secure link to view and download their official digital invoice PDF.

### 11.2 Camera-Based Barcode Scanner
Turn any smartphone, tablet, or laptop camera into a high-speed barcode reader without purchasing external USB scanning hardware.

---

## 12. Troubleshooting & FAQ

### Q: I forgot my user PIN or password. How can I reset it?
**A:** Any user with an **Admin** profile can update employee credentials under **Settings > Users**.

### Q: The thermal printer produces unreadable characters for accented words.
**A:** In the print settings modal, set character encoding to `UTF-8` or `CP850 / CP860` (Portuguese code page).

### Q: An offline sale is not appearing on the main head-office dashboard.
**A:** Verify that the cashier device has reconnected to the network. Click **"Sync Now"** in the top right corner to force immediate transmission.

---

## 13. Support Contacts & Helpdesk

Carpintaria Digital provides professional support and training services:

* 📞 **Support Phone Line:** +258 21 000 000 / +258 84 123 4567
* 💬 **WhatsApp Helpdesk:** [+258 84 123 4567](https://wa.me/258841234567)
* 📧 **Email:** [suporte@ticonta.co.mz](mailto:suporte@ticonta.co.mz)
* 🏢 **Office:** Av. 24 de Julho, Maputo — Mozambique
* 🌐 **Website:** [https://ticonta.co.mz](https://ticonta.co.mz)
