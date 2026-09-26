import React, { useState } from 'react';
import { DocumentListPage } from './DocumentListPage';
import { DocumentForm } from './DocumentForm';

export const InternalTransfersPage: React.FC = () => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  if (selectedDocId) {
    return (
      <DocumentForm
        type="internal"
        documentId={selectedDocId}
        onBack={() => setSelectedDocId(null)}
      />
    );
  }

  return (
    <DocumentListPage
      type="internal"
      onSelectDocument={(id) => setSelectedDocId(id)}
    />
  );
};
