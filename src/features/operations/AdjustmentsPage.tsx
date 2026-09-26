import React, { useState } from 'react';
import { DocumentListPage } from './DocumentListPage';
import { DocumentForm } from './DocumentForm';

export const AdjustmentsPage: React.FC = () => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  if (selectedDocId) {
    return (
      <DocumentForm
        type="adjustment"
        documentId={selectedDocId}
        onBack={() => setSelectedDocId(null)}
      />
    );
  }

  return (
    <DocumentListPage
      type="adjustment"
      onSelectDocument={(id) => setSelectedDocId(id)}
    />
  );
};
