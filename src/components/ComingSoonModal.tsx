import React from 'react';
import { X } from 'lucide-react';
import { ComingSoonFeature } from '../types';

export const COMING_SOON_FEATURES: ComingSoonFeature[] = [
  {
    id: 'interactive-change-maps',
    title: 'Interactive Change Maps',
    description: 'Dynamic raster diff overlays with swipeable comparisons and change thresholding.',
    category: 'Spatial',
  },
  {
    id: 'bounding-box-viz',
    title: 'Bounding-Box Grounding',
    description: 'Interactive rendering of target entity polygons and oriented bounding boxes directly on imagery.',
    category: 'Spatial',
  },
  {
    id: 'segmentation-overlays',
    title: 'Semantic Segmentation Overlays',
    description: 'Pixel-level thematic land-cover masks with GIS vector shapefile export.',
    category: 'Spatial',
  },
  {
    id: 'geotiff-metadata',
    title: 'GeoTIFF CRS & Extent Explorer',
    description: 'Client-side parsing of EPSG projections, affine transform matrices, and bounding extents.',
    category: 'Data',
  },
  {
    id: 'map-based-viz',
    title: 'Interactive Basemap Placement',
    description: 'Geolocated slippy map layer placement with OpenStreetMap and satellite basemaps.',
    category: 'Spatial',
  },
  {
    id: 'multi-temporal-timeline',
    title: 'Multi-Temporal Cube Timeline',
    description: 'Sequence analysis across 3+ satellite passes to measure progression over time.',
    category: 'Workflows',
  },
  {
    id: 'explainable-ai',
    title: 'Explainable AI & Saliency Maps',
    description: 'Visual heatmaps highlighting model attention across spectral bands.',
    category: 'Workflows',
  },
  {
    id: 'batch-analysis',
    title: 'Batch Satellite Tile Pipeline',
    description: 'Bulk query dispatch across large Sentinel or Landsat orbital scenes.',
    category: 'Workflows',
  },
  {
    id: 'advanced-model-select',
    title: 'Specialist Model Override',
    description: 'Force specific vision-language backbones or specialist model weights.',
    category: 'Workflows',
  },
];

interface ComingSoonModalProps {
  feature: ComingSoonFeature | null;
  onClose: () => void;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  feature,
  onClose,
}) => {
  if (!feature) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full p-5 shadow-lg transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Planned Workflow &bull; {feature.category}
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {feature.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-4 space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {feature.description}
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            This capability is scheduled for a future SatQuery AI release. The current version integrates with the unified <code className="font-mono text-slate-600 dark:text-slate-300">POST /ask</code> endpoint.
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded text-xs font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
