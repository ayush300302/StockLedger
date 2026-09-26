import React, { useState, useMemo } from 'react';
import { DocumentType } from '../../lib/database.types';
import { DOCUMENT_CONFIGS } from './documentConfig';
import {
  useStockDocument,
  useUpdateDocumentState,
  useAddMoveLine,
  useDeleteMoveLine,
  useLocations,
} from '../../lib/queries/operations';
import { useValidateDocument } from './useValidate';
import { useProducts } from '../../lib/queries/products';
import {
  Button,
  Badge,
  Card,
  Input,
  Select,
  ConfirmDialog,
  Spinner,
} from '../../components/ui';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Calendar,
  User,
  PackageCheck,
  Building,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DocumentFormProps {
  type: DocumentType;
  documentId: string;
  onBack: () => void;
}

export const DocumentForm: React.FC<DocumentFormProps> = ({
  type,
  documentId,
  onBack,
}) => {
  const config = DOCUMENT_CONFIGS[type];

  const { data: doc, isLoading } = useStockDocument(documentId);
  const { data: products } = useProducts('', null);
  const { data: locations } = useLocations();

  const updateStateMutation = useUpdateDocumentState();
  const validateMutation = useValidateDocument();
  const addLineMutation = useAddMoveLine();
  const deleteLineMutation = useDeleteMoveLine();

  // Confirmation dialogs state
  const [confirmValidateOpen, setConfirmValidateOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  // Line item modal / state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [lineQty, setLineQty] = useState('1');
  const [fromLocationId, setFromLocationId] = useState('');
  const [toLocationId, setToLocationId] = useState('');

  const isReadOnly = doc?.state === 'done' || doc?.state === 'canceled';

  // Available location options filtered by default type configs
  const sourceLocations = useMemo(() => {
    if (!locations) return [];
    if (config.defaultSourceType === 'vendor') {
      return locations.filter((l) => l.type === 'vendor' || l.type === 'internal');
    }
    if (config.defaultSourceType === 'inventory_loss') {
      return locations.filter((l) => l.type === 'inventory_loss' || l.type === 'internal');
    }
    return locations.filter((l) => l.type === 'internal');
  }, [locations, config.defaultSourceType]);

  const destLocations = useMemo(() => {
    if (!locations) return [];
    if (config.defaultDestType === 'customer') {
      return locations.filter((l) => l.type === 'customer' || l.type === 'internal');
    }
    return locations.filter((l) => l.type === 'internal');
  }, [locations, config.defaultDestType]);

  // Set default source and dest locations when locations load
  React.useEffect(() => {
    if (sourceLocations.length > 0 && !fromLocationId) {
      setFromLocationId(sourceLocations[0].id);
    }
    if (destLocations.length > 0 && !toLocationId) {
      setToLocationId(destLocations[0].id);
    }
  }, [sourceLocations, destLocations, fromLocationId, toLocationId]);

  const selectedProduct = useMemo(() => {
    return products?.find((p) => p.id === selectedProductId);
  }, [products, selectedProductId]);

  const handleAddLine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error('Please select a product');
      return;
    }
    const qtyNum = parseFloat(lineQty);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      toast.error('Please enter a valid positive quantity');
      return;
    }
    if (!fromLocationId || !toLocationId) {
      toast.error('Please select source and destination locations');
      return;
    }
    if (fromLocationId === toLocationId) {
      toast.error('Source and destination locations must be distinct');
      return;
    }

    try {
      await addLineMutation.mutateAsync({
        document_id: documentId,
        product_id: selectedProductId,
        qty: qtyNum,
        from_location_id: fromLocationId,
        to_location_id: toLocationId,
      });

      toast.success('Line item added');
      setSelectedProductId('');
      setLineQty('1');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add line item');
    }
  };

  const handleDeleteLine = async (moveId: string) => {
    try {
      await deleteLineMutation.mutateAsync({ moveId, docId: documentId });
      toast.success('Line item removed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove line item');
    }
  };

  const handleValidateConfirm = async () => {
    setConfirmValidateOpen(false);
    await validateMutation.mutateAsync(documentId);
  };

  const handleCancelConfirm = async () => {
    setConfirmCancelOpen(false);
    await updateStateMutation.mutateAsync({ docId: documentId, state: 'canceled' });
  };

  if (isLoading || !doc) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-slate-200">
        <Spinner size="lg" className="text-brand-600 mb-3" />
        <p className="text-xs text-slate-500">Loading document {documentId}...</p>
      </div>
    );
  }

  const moves = doc.moves || [];
  const totalQty = moves.reduce((acc, m) => acc + (m.qty || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header / Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={onBack}>
            Back to List
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-slate-900">{doc.reference}</h1>
              <Badge
                variant={
                  doc.state === 'done'
                    ? 'success'
                    : doc.state === 'ready'
                    ? 'info'
                    : doc.state === 'waiting'
                    ? 'warning'
                    : doc.state === 'canceled'
                    ? 'danger'
                    : 'neutral'
                }
              >
                {doc.state}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {config.title} • Created {new Date(doc.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* State Machine Action Bar */}
        <div className="flex items-center gap-2">
          {doc.state === 'draft' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmCancelOpen(true)}
                disabled={updateStateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => updateStateMutation.mutate({ docId: documentId, state: 'waiting' })}
                loading={updateStateMutation.isPending}
              >
                Confirm Document
              </Button>
            </>
          )}

          {doc.state === 'waiting' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmCancelOpen(true)}
                disabled={updateStateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => updateStateMutation.mutate({ docId: documentId, state: 'ready' })}
                loading={updateStateMutation.isPending}
              >
                Mark Ready
              </Button>
            </>
          )}

          {doc.state === 'ready' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmCancelOpen(true)}
                disabled={updateStateMutation.isPending || validateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<PackageCheck className="w-4 h-4" />}
                onClick={() => setConfirmValidateOpen(true)}
                loading={validateMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Validate & Post Moves
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Terminal Banners */}
      {doc.state === 'done' && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold">Document Validated.</span> All stock moves have been posted to the ledger on{' '}
            {doc.validated_at ? new Date(doc.validated_at).toLocaleString() : 'N/A'} by{' '}
            {doc.validated_by_profile?.name || 'Manager'}.
          </div>
        </div>
      )}

      {doc.state === 'canceled' && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="text-xs font-semibold">
            This document has been canceled and is read-only.
          </div>
        </div>
      )}

      {/* Header Fields Card */}
      <Card title="Document Info">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {config.showPartner && (
            <Input
              label={config.partnerLabel || 'Partner'}
              value={doc.partner_name || 'N/A'}
              disabled
              leftIcon={<User className="w-4 h-4" />}
            />
          )}
          <Input
            label="Warehouse"
            value={doc.warehouse?.name || 'All Warehouses'}
            disabled
            leftIcon={<Building className="w-4 h-4" />}
          />
          <Input
            label="Scheduled Date"
            value={doc.scheduled_date ? new Date(doc.scheduled_date).toLocaleDateString() : 'N/A'}
            disabled
            leftIcon={<Calendar className="w-4 h-4" />}
          />
        </div>
      </Card>

      {/* Add Line Form (only active when not read-only) */}
      {!isReadOnly && (
        <Card title="Add Line Item">
          <form onSubmit={handleAddLine} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="md:col-span-2">
              <Select
                label="Product SKU / Name"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                options={[
                  { value: '', label: 'Select Product...' },
                  ...(products?.map((p) => ({
                    value: p.id,
                    label: `[${p.sku}] ${p.name} (${p.on_hand} ${p.uom} on hand)`,
                  })) || []),
                ]}
              />
            </div>

            <Select
              label={config.sourceLocationLabel}
              value={fromLocationId}
              onChange={(e) => setFromLocationId(e.target.value)}
              options={sourceLocations.map((l) => ({
                value: l.id,
                label: `${l.name} (${l.code})`,
              }))}
            />

            <Select
              label={config.destLocationLabel}
              value={toLocationId}
              onChange={(e) => setToLocationId(e.target.value)}
              options={destLocations.map((l) => ({
                value: l.id,
                label: `${l.name} (${l.code})`,
              }))}
            />

            <div className="flex items-center gap-2">
              <Input
                label={`Qty (${selectedProduct?.uom || 'Units'})`}
                type="number"
                step="0.001"
                min="0.001"
                value={lineQty}
                onChange={(e) => setLineQty(e.target.value)}
              />
              <Button type="submit" size="sm" icon={<Plus className="w-4 h-4" />} loading={addLineMutation.isPending}>
                Add
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Line Items Table */}
      <Card
        title="Stock Moves / Line Items"
        action={
          <span className="text-xs font-semibold text-slate-600">
            Total Items: <span className="text-brand-600">{moves.length}</span> | Total Qty:{' '}
            <span className="text-brand-600">{totalQty.toFixed(2)}</span>
          </span>
        }
      >
        {moves.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No line items added yet. Add a product line above to post stock moves.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-dense">
              <thead>
                <tr>
                  <th className="text-left">Product / SKU</th>
                  <th className="text-left">Source Location</th>
                  <th className="text-left">Destination Location</th>
                  <th className="text-right">Quantity</th>
                  <th className="text-center">UoM</th>
                  {!isReadOnly && <th className="text-center">Action</th>}
                </tr>
              </thead>
              <tbody>
                {moves.map((move) => (
                  <tr key={move.id}>
                    <td className="font-medium text-slate-900">
                      [{move.product?.sku}] {move.product?.name}
                    </td>
                    <td className="text-slate-600">
                      {move.from_location?.name} ({move.from_location?.code})
                    </td>
                    <td className="text-slate-600">
                      {move.to_location?.name} ({move.to_location?.code})
                    </td>
                    <td className="text-right font-mono font-semibold text-slate-900">
                      {move.qty}
                    </td>
                    <td className="text-center text-slate-500 font-mono text-xs">
                      {move.product?.uom || 'Units'}
                    </td>
                    {!isReadOnly && (
                      <td className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="w-4 h-4 text-rose-600" />}
                          onClick={() => handleDeleteLine(move.id)}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Confirm Validate Dialog */}
      <ConfirmDialog
        isOpen={confirmValidateOpen}
        onClose={() => setConfirmValidateOpen(false)}
        onConfirm={handleValidateConfirm}
        title="Validate & Post Stock Document?"
        message="Validating this document is an irreversible operation. It will update on-hand inventory balances by creating append-only ledger entries."
        confirmText="Validate & Post"
        variant="primary"
        loading={validateMutation.isPending}
      />

      {/* Confirm Cancel Dialog */}
      <ConfirmDialog
        isOpen={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        onConfirm={handleCancelConfirm}
        title="Cancel Document?"
        message="Are you sure you want to cancel this document? Canceled documents cannot be re-opened or validated."
        confirmText="Cancel Document"
        variant="danger"
        loading={updateStateMutation.isPending}
      />
    </div>
  );
};
