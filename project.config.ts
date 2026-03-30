import { type ProjectConfig } from '@/lib/project-config-schema'

export const projectConfig: ProjectConfig = {
  name: 'VBS Canvas',
  shortName: 'VBS Canvas',
  iconLetter: 'V',
  description: 'Collaborative platform for structuring and reviewing business requirements',

  abbreviations: {
    HBL: 'House Bill of Lading',
    WFF: 'Wholesale Freight Forwarder',
    FF: 'Freight Forwarder',
    LSP: 'Logistics Service Provider',
    P4TC: 'Party to Collect',
    NVOCC: 'Non-Vessel Operating Common Carrier',
    DO: 'Delivery Order',
    TC: 'Transport Carrier',
    BRD: 'Business Requirements Document',
    OTP: 'One-Time Password',
    SSO: 'Single Sign-On',
    ABF: 'Australian Border Force',
    FOC: 'Free of Charge',
    ACFS: 'Australian Container Freight Services',
    VBS: 'Vehicle Booking System',
    ECST: 'ECST (pending definition)',
    ICS: 'Integrated Cargo System',
  },

  brd: {
    introText: 'The {project} is a web-based system for managing container pickup bookings at ACFS facilities.',
    scopeText: 'It enables logistics service providers to view shipments, delegate pickup authority, book pickup slots, manage documentation, and make payments — with ACFS staff overseeing operations, slot configuration, and verification.',
  },

  ai: {
    idExamples: "short lowercase, e.g. 'lsp', 'acfs', 'p4tc'",
    journeyIdExamples: "kebab-case, e.g. 'carrier-books-pickup'",
    idPatternHint: 'if actors have lsp, p4tc, acfs — a new actor gets a short lowercase ID',
  },
}
