import React, { useState } from 'react';
import { DocumentListPage } from './DocumentListPage';
import { DocumentForm } from './DocumentForm';

export const ReceiptsPage: React.FC = () => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  if (selectedDocId) {
    return (
      <DocumentForm
        type="receipt"
        documentId={selectedDocId}
        onBack={() => setSelectedDocId(null)}
      />
    );
  }

  return (
    <DocumentListPage
      type="receipt"
      onSelectDocument={(id) => setSelectedDocId(id)}
    />
  );
};
