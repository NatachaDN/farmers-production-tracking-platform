import React from 'react';
import {
  IconTomato,
  IconBean,
  IconLeaf,
  IconLivestock,
  IconCrop,
  IconSprout
} from '../../../shared/components/Icons';

export function getCropIcon(crop, size = 20) {
  const c = (crop || '').toLowerCase();
  if (c.includes('tomato')) return <IconTomato size={size} color="#2D7A52" />;
  if (c.includes('bean')) return <IconBean size={size} color="#2D7A52" />;
  if (c.includes('cassava') || c.includes('plantain')) return <IconLeaf size={size} color="#2D7A52" />;
  if (c.includes('livestock') || c.includes('cattle')) return <IconLivestock size={size} color="#2D7A52" />;
  if (c.includes('maize') || c.includes('corn')) return <IconCrop size={size} color="#2D7A52" />;
  return <IconSprout size={size} color="#2D7A52" />;
}

export function stageProgress(stage) {
  if (stage === 'Flowering') return 74;
  if (stage === 'Vegetative growth') return 62;
  if (stage === 'Maturing') return 84;
  return 29;
}

export function mapPlotData(p) {
  return {
    id: p.id,
    title: p.name,
    crop: p.cropType || 'Crop',
    areaVal: p.area,
    area: `${p.area} ha cultivated area`,
    stage: p.stage || 'Planting',
    farmId: p.farmId,
    location: p.location,
    progress: stageProgress(p.stage),
    icon: getCropIcon(p.cropType || p.name)
  };
}

