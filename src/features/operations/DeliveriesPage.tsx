import React, { useState } from 'react';
import { DocumentListPage } from './DocumentListPage';
import { DocumentForm } from './DocumentForm';

export const DeliveriesPage: React.FC = () => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  if (selectedDocId) {
    return (
      <DocumentForm
        type="delivery"
        documentId={selectedDocId}
        onBack={() => setSelectedDocId(null)}
      />
    );
  }

  return (
    <DocumentListPage
      type="delivery"
      onSelectDocument={(id) => setSelectedDocId(id)}
    />
  );
};
