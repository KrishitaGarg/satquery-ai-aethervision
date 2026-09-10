export interface SampleDataset {
  id: string;
  name: string;
  category: 'bitemporal' | 'crossmodal' | 'single';
  badge: string;
  suggestedQuery: string;
  description: string;
  images: Array<{
    filename: string;
    label: string;
    description: string;
    src: string;
  }>;
}

/**
 * Curated sample datasets backed by real satellite/aerial imagery.
 * Each `src` points at a static file under /public/samples/, which
 * `createSampleFiles` fetches and converts into standard browser
 * `File` objects — the same shape the upload flow already expects.
 */
export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: 'single-remote-sensing-landcover',
    name: 'Single Scene: Land-Cover Analysis',
    category: 'single',
    badge: '1. Single Image',
    suggestedQuery:
      'Describe this remote-sensing image in detail.',
    description:
      'High-resolution optical remote-sensing imagery showing heterogeneous vegetation, agricultural or cleared terrain, settlements, and linear transportation features.',
    images: [
      {
        filename: 'remote_sensing_scene.jpeg',
        label: 'Single Image',
        description:
          'Optical remote-sensing capture showing forested/vegetated terrain, patterned agricultural or cleared areas, settlements, and roads.',
        src: '/samples/scene.jpeg',
      },
    ],
  },
  {
    id: 'bitemporal-landcover-pair',
    name: 'Bi-temporal Land-Cover Pair',
    category: 'bitemporal',
    badge: '2. Bi-temporal Pair',
    suggestedQuery: 'What differences in vegetation, water, and land cover are visible between Frame A and Frame B?',
    description: 'Paired aerial captures for demonstrating bi-temporal comparison queries across two frames.',
    images: [
      {
        filename: 'bitemporal_frame_a.png',
        label: 'Frame A',
        description: 'Baseline aerial capture — dense vegetation, a standing water body, and access roads',
        src: '/samples/bitemporal_im1.png',
      },
      {
        filename: 'bitemporal_frame_b.png',
        label: 'Frame B',
        description: 'Comparison aerial capture — wetland/marsh terrain with a levee road and irrigation canal',
        src: '/samples/bitemporal_im2.png',
      },
    ],
  },
  {
    id: 'crossmodal-sar-optical',
    name: 'Optical + SAR Cross-Modal Pair',
    category: 'crossmodal',
    badge: '3. Optical + SAR Pair',
    suggestedQuery: 'Use the optical and SAR images together to identify vegetation and land-cover patterns.',
    description: 'Optical imagery paired with a SAR backscatter capture, for demonstrating cross-modal analysis.',
    images: [
      {
        filename: 'optical_frame.png',
        label: 'Frame A',
        description: 'Optical (visible-spectrum) capture of vegetated terrain',
        src: '/samples/optical.png',
      },
      {
        filename: 'sar_frame.png',
        label: 'Frame B',
        description: 'SAR backscatter capture for the same cross-modal pair',
        src: '/samples/sar.png',
      },
    ],
  },
];

export async function createSampleFiles(dataset: SampleDataset): Promise<File[]> {
  const files: File[] = [];

  for (const item of dataset.images) {
    const response = await fetch(item.src);
    if (!response.ok) {
      throw new Error(`Failed to load sample image "${item.filename}" (${response.status})`);
    }

    const blob = await response.blob();
    const inferredType =
      blob.type || (item.src.toLowerCase().endsWith('.jpg') || item.src.toLowerCase().endsWith('.jpeg')
        ? 'image/jpeg'
        : 'image/png');

    const file = new File([blob], item.filename, { type: inferredType });
    files.push(file);
  }

  return files;
}