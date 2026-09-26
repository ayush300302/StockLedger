import { DocumentType, LocationType } from '../../lib/database.types';

export interface DocumentTypeConfig {
  type: DocumentType;
  title: string;
  partnerLabel: string | null;
  defaultSourceType: LocationType;
  defaultDestType: LocationType;
  referencePrefix: string;
  showPartner: boolean;
  sourceLocationLabel: string;
  destLocationLabel: string;
}

export const DOCUMENT_CONFIGS: Record<DocumentType, DocumentTypeConfig> = {
  receipt: {
    type: 'receipt',
    title: 'Receipts',
    partnerLabel: 'Supplier',
    defaultSourceType: 'vendor',
    defaultDestType: 'internal',
    referencePrefix: 'WH/IN',
    showPartner: true,
    sourceLocationLabel: 'Vendor Location',
    destLocationLabel: 'Destination Location',
  },
  delivery: {
    type: 'delivery',
    title: 'Delivery Orders',
    partnerLabel: 'Customer',
    defaultSourceType: 'internal',
    defaultDestType: 'customer',
    referencePrefix: 'WH/OUT',
    showPartner: true,
    sourceLocationLabel: 'Source Location',
    destLocationLabel: 'Customer Location',
  },
  internal: {
    type: 'internal',
    title: 'Internal Transfers',
    partnerLabel: null,
    defaultSourceType: 'internal',
    defaultDestType: 'internal',
    referencePrefix: 'WH/INT',
    showPartner: false,
    sourceLocationLabel: 'Source Location',
    destLocationLabel: 'Destination Location',
  },
  adjustment: {
    type: 'adjustment',
    title: 'Inventory Adjustment',
    partnerLabel: null,
    defaultSourceType: 'inventory_loss',
    defaultDestType: 'internal',
    referencePrefix: 'WH/ADJ',
    showPartner: false,
    sourceLocationLabel: 'Adjustment Location',
    destLocationLabel: 'Internal Location',
  },
};
