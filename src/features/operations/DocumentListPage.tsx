import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DocumentType } from '../../lib/database.types';
import { DOCUMENT_CONFIGS } from './documentConfig';
import { useStockDocuments, useCreateDocument } from '../../lib/queries/operations';
import { FilterBar } from '../../components/FilterBar';
import { Table, Column, Badge, Button, Modal, Input, Select } from '../../components/ui';
import { Plus, Calendar, User } from 'lucide-react';
import { useWarehouses } from '../../lib/queries/dashboard';
import toast from 'react-hot-toast';

interface DocumentListPageProps {
  type: DocumentType;
  onSelectDocument?: (docId: string) => void;
}

export const DocumentListPage: React.FC<DocumentListPageProps> = ({
  type,
  onSelectDocument,
}) => {
  const config = DOCUMENT_CONFIGS[type];
  const [searchParams] = useSearchParams();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  const { data: warehouses } = useWarehouses();
  const createDocumentMutation = useCreateDocument();

  // Extract filter parameters from URL
  const search = searchParams.get('q') || '';
  const statusParam = searchParams.get('status');
  const warehouseParam = searchParams.get('warehouse');

  const statuses = statusParam ? statusParam.split(',') : [];

  const { data: documents, isLoading } = useStockDocuments({
    type,
    search,
    statuses,
    warehouseId: warehouseParam,
  });

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const doc = await createDocumentMutation.mutateAsync({
        type,
        partner_name: config.showPartner ? partnerName : null,
        warehouse_id: warehouseId || null,
        scheduled_date: scheduledDate || null,
      });

      toast.success(`Draft document ${doc.reference} created!`);
      setCreateModalOpen(false);
      setPartnerName('');
      setWarehouseId('');
      setScheduledDate('');
      if (onSelectDocument) {
        onSelectDocument(doc.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create document');
    }
  };

  const badgeVariants = (state: string) => {
    switch (state) {
      case 'done':
        return 'success';
      case 'ready':
        return 'info';
      case 'waiting':
        return 'warning';
      case 'canceled':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'reference',
      header: 'Reference',
      render: (row) => (
        <span className="font-mono font-semibold text-brand-600 hover:underline">
          {row.reference}
        </span>
      ),
    },
    ...(config.showPartner
      ? [
          {
            key: 'partner_name',
            header: config.partnerLabel || 'Partner',
            render: (row: any) => (
              <span className="text-slate-700">{row.partner_name || '—'}</span>
            ),
          },
        ]
      : []),
    {
      key: 'scheduled_date',
      header: 'Scheduled Date',
      render: (row) => (
        <span className="text-slate-600">
          {row.scheduled_date ? new Date(row.scheduled_date).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      render: (row) => (
        <span className="text-slate-600">{row.warehouse?.name || 'All Warehouses'}</span>
      ),
    },
    {
      key: 'moves_count',
      header: 'Line Items',
      align: 'center',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
          {row.moves_count || 0} items
        </span>
      ),
    },
    {
      key: 'state',
      header: 'Status',
      render: (row) => (
        <Badge variant={badgeVariants(row.state)} size="sm">
          {row.state}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{config.title}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage {config.title.toLowerCase()} and post ledger moves
          </p>
        </div>

        <Button
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setCreateModalOpen(true)}
        >
          New {config.title.slice(0, -1)}
        </Button>
      </div>

      {/* Filter Bar */}
      <FilterBar fixedDocType={type} hideDocType />

      {/* Documents Table */}
      <Table
        columns={columns}
        data={documents || []}
        loading={isLoading}
        rowKey={(row) => row.id}
        onRowClick={(row) => onSelectDocument?.(row.id)}
        emptyTitle={`No ${config.title.toLowerCase()} found`}
        emptyDescription={`Create your first ${config.title.slice(0, -1).toLowerCase()} draft to get started.`}
        emptyAction={
          <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setCreateModalOpen(true)}>
            Create Draft
          </Button>
        }
      />

      {/* Create Draft Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={`New ${config.title.slice(0, -1)} Draft`}
        size="md"
      >
        <form onSubmit={handleCreateDraft} className="space-y-4">
          {config.showPartner && (
            <Input
              label={config.partnerLabel || 'Partner Name'}
              placeholder={`Enter ${config.partnerLabel?.toLowerCase() || 'partner'} name`}
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
            />
          )}

          <Select
            label="Warehouse"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            options={[
              { value: '', label: 'Select Warehouse...' },
              ...(warehouses?.map((w: { id: string; name: string; code: string }) => ({ value: w.id, label: `${w.name} (${w.code})` })) || []),
            ]}
          />

          <Input
            label="Scheduled Date"
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
          />

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={createDocumentMutation.isPending}>
              Create Draft Document
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
