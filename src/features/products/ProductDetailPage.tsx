import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Product Detail</h1>
        <p className="text-xs text-slate-500 mt-1">ID: {id}</p>
      </div>
      <Card title="Product Details">
        <p className="text-xs text-slate-500">Product detail placeholder.</p>
      </Card>
    </div>
  );
};
