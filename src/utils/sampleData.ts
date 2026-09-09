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
    generator: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  }>;
}

/**
 * Procedural generators that create realistic satellite-like images on HTML Canvas
 * and return standard JavaScript `File` objects.
 */
export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: 'single-coastal-port',
    name: 'Single Scene: Coastal Harbour',
    category: 'single',
    badge: '1. Single Image',
    suggestedQuery: 'Describe the land-cover and major objects visible in this image.',
    description: 'High-resolution satellite view of commercial container terminal, breakwater, and vessels.',
    images: [
      {
        filename: 'worldview_port_terminal.png',
        label: 'Single Image',
        description: 'Commercial container port with shipping vessels and loading cranes',
        generator: (ctx, w, h) => {
          // Ocean water
          ctx.fillStyle = '#0c4a6e';
          ctx.fillRect(0, 0, w, h);

          // Pier / dock concrete pier
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.moveTo(w * 0.4, 0);
          ctx.lineTo(w * 0.4, h * 0.85);
          ctx.lineTo(w, h * 0.85);
          ctx.lineTo(w, 0);
          ctx.fill();

          // Container stacks (colorful small rectangles)
          const colors = ['#dc2626', '#2563eb', '#16a34a', '#eab308', '#ea580c'];
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 12; c++) {
              ctx.fillStyle = colors[(r * 3 + c) % colors.length];
              ctx.fillRect(w * 0.5 + c * 14, 20 + r * 14, 11, 8);
            }
          }

          // Moored container vessel along the pier
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.roundRect(w * 0.28, h * 0.2, 34, 110, [12, 12, 4, 4]);
          ctx.fill();
          // Deck cargo
          ctx.fillStyle = '#f97316';
          ctx.fillRect(w * 0.3, h * 0.3, 30, 70);

          drawSatelliteGrid(ctx, w, h, 'HIGH-RES OPTICAL / 0.5m GSD / HARBOUR');
        },
      },
    ],
  },
  {
    id: 'bitemporal-urban',
    name: 'Bi-temporal Urban Expansion',
    category: 'bitemporal',
    badge: '2. Bi-temporal Pair',
    suggestedQuery: 'Has the forest area changed between Frame A and Frame B?',
    description: 'Sentinel-2 simulated pair showing forest clearing and infrastructure expansion over 3 years.',
    images: [
      {
        filename: 'sentinel2_t1_20210615.png',
        label: 'Frame A',
        description: 'Sentinel-2 MSI True Color - Baseline vegetation and river valley',
        generator: (ctx, w, h) => {
          // Dark forest green background
          ctx.fillStyle = '#1e3a1e';
          ctx.fillRect(0, 0, w, h);

          // River winding
          ctx.strokeStyle = '#1e40af';
          ctx.lineWidth = 14;
          ctx.beginPath();
          ctx.moveTo(0, h * 0.3);
          ctx.bezierCurveTo(w * 0.4, h * 0.2, w * 0.6, h * 0.8, w, h * 0.7);
          ctx.stroke();

          // Dense forest patches
          ctx.fillStyle = '#14532d';
          for (let i = 0; i < 40; i++) {
            const x = (Math.sin(i * 13) * 0.5 + 0.5) * w;
            const y = (Math.cos(i * 17) * 0.5 + 0.5) * h;
            ctx.beginPath();
            ctx.arc(x, y, 20 + (i % 15), 0, Math.PI * 2);
            ctx.fill();
          }

          // Small rural settlement
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(w * 0.7, h * 0.2, 28, 24);
          ctx.fillRect(w * 0.75, h * 0.26, 20, 18);

          // Grid overlay subtle
          drawSatelliteGrid(ctx, w, h, 'SENTINEL-2A / T32UMU / 2021-06-15');
        },
      },
      {
        filename: 'sentinel2_t2_20240618.png',
        label: 'Frame B',
        description: 'Sentinel-2 MSI True Color - Same coordinate showing expanded built-up zone',
        generator: (ctx, w, h) => {
          // Forest background with diminished density
          ctx.fillStyle = '#2d472c';
          ctx.fillRect(0, 0, w, h);

          // River winding (same)
          ctx.strokeStyle = '#1e40af';
          ctx.lineWidth = 14;
          ctx.beginPath();
          ctx.moveTo(0, h * 0.3);
          ctx.bezierCurveTo(w * 0.4, h * 0.2, w * 0.6, h * 0.8, w, h * 0.7);
          ctx.stroke();

          // Retained forest
          ctx.fillStyle = '#14532d';
          for (let i = 0; i < 20; i++) {
            const x = (Math.sin(i * 7) * 0.5 + 0.5) * w * 0.6;
            const y = (Math.cos(i * 11) * 0.5 + 0.5) * h;
            ctx.beginPath();
            ctx.arc(x, y, 18 + (i % 10), 0, Math.PI * 2);
            ctx.fill();
          }

          // Significantly expanded built-up concrete area (tan/gray)
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(w * 0.55, h * 0.15, w * 0.4, h * 0.45);

          // Building footprints and roads
          ctx.fillStyle = '#64748b';
          for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
              ctx.fillRect(w * 0.58 + c * 18, h * 0.18 + r * 18, 12, 12);
            }
          }

          // New highway
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(w * 0.5, 0);
          ctx.lineTo(w * 0.85, h);
          ctx.stroke();

          drawSatelliteGrid(ctx, w, h, 'SENTINEL-2B / T32UMU / 2024-06-18');
        },
      },
    ],
  },
  {
    id: 'crossmodal-sar-optical',
    name: 'Optical + SAR Cross-Modal Pair',
    category: 'crossmodal',
    badge: '3. Optical + SAR Pair',
    suggestedQuery: 'Use the optical and SAR images together to identify built-up and water-covered regions.',
    description: 'Sentinel-2 MSI Optical paired with Sentinel-1 SAR C-band backscatter for cloud-penetrating water/urban analysis.',
    images: [
      {
        filename: 'sentinel2_optical_rgb.png',
        label: 'Frame A',
        description: 'Sentinel-2 Multispectral Instrument (Optical B4-B3-B2 RGB)',
        generator: (ctx, w, h) => {
          // Terrain color
          ctx.fillStyle = '#4a5d3f';
          ctx.fillRect(0, 0, w, h);

          // Estuary / coastal water (blue)
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.moveTo(w * 0.3, 0);
          ctx.bezierCurveTo(w * 0.4, h * 0.5, w * 0.1, h * 0.8, 0, h);
          ctx.lineTo(0, 0);
          ctx.fill();

          // Cloud haze over part of the scene (showing why SAR is needed!)
          const grad = ctx.createRadialGradient(w * 0.6, h * 0.4, 10, w * 0.6, h * 0.4, 90);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);

          // Urban center
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(w * 0.5, h * 0.6, 60, 50);

          drawSatelliteGrid(ctx, w, h, 'SENTINEL-2 / MSI OPTICAL RGB / 10m GSD');
        },
      },
      {
        filename: 'sentinel1_sar_grd.png',
        label: 'Frame B',
        description: 'Sentinel-1 C-SAR GRD (VV/VH cross-polarization radar backscatter)',
        generator: (ctx, w, h) => {
          // Radar speckle dark background
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, 0, w, h);

          // Water is specular reflector -> very dark in SAR
          ctx.fillStyle = '#05070a';
          ctx.beginPath();
          ctx.moveTo(w * 0.3, 0);
          ctx.bezierCurveTo(w * 0.4, h * 0.5, w * 0.1, h * 0.8, 0, h);
          ctx.lineTo(0, 0);
          ctx.fill();

          // Cloud is completely transparent to C-band SAR! (no cloud haze)
          // Built-up corner reflectors -> extremely bright white/cyan response in SAR
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(w * 0.5, h * 0.6, 60, 50);

          // Individual bright targets (ships, metal towers)
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(w * 0.15, h * 0.35, 6, 6);
          ctx.fillRect(w * 0.18, h * 0.5, 6, 6);

          // Radar speckle noise
          const imgData = ctx.getImageData(0, 0, w, h);
          for (let i = 0; i < imgData.data.length; i += 16) {
            const noise = (Math.random() - 0.5) * 40;
            imgData.data[i] = Math.min(255, Math.max(0, imgData.data[i] + noise));
            imgData.data[i + 1] = Math.min(255, Math.max(0, imgData.data[i + 1] + noise));
            imgData.data[i + 2] = Math.min(255, Math.max(0, imgData.data[i + 2] + noise));
          }
          ctx.putImageData(imgData, 0, 0);

          drawSatelliteGrid(ctx, w, h, 'SENTINEL-1 / C-SAR IW GRD / VV+VH');
        },
      },
    ],
  },
];

function drawSatelliteGrid(
  _ctx: CanvasRenderingContext2D,
  _w: number,
  _h: number,
  _telemetry: string
) {
  // Clean natural imagery without sci-fi HUD elements or artificial telemetry
}

/**
 * Converts a sample dataset into actual browser File objects
 */
export async function createSampleFiles(dataset: SampleDataset): Promise<File[]> {
  const files: File[] = [];

  for (const item of dataset.images) {
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      item.generator(ctx, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (blob) {
        const file = new File([blob], item.filename, { type: 'image/png' });
        files.push(file);
      }
    }
  }

  return files;
}
